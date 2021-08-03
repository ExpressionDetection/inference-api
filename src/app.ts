const httpServer = require("http").createServer();
const Redis = require("ioredis");
const redisClient = new Redis(process.env.REDIS_PORT, process.env.REDIS_HOST);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: `${process.env.FRONT_END_PROTOCOL}://${process.env.FRONT_END_HOST}:${process.env.FRONT_END_PORT}`,
  },
  adapter: require("socket.io-redis")({
    pubClient: redisClient,
    subClient: redisClient.duplicate(),
  }),
});

const { setupWorker } = require("@socket.io/sticky");
import * as crypto from "crypto";

const randomId = () => crypto.randomBytes(8).toString("hex");

const { RedisSessionStore } = require("./sessionStore");
const sessionStore = new RedisSessionStore(redisClient);


io.use(async (socket: any, next: any) => {
  const sessionID = socket.handshake.auth.sessionID;
  if (sessionID) {
    const session = await sessionStore.findSession(sessionID);
    if (session) {
      socket.sessionID = sessionID; 
      socket.userID = session.userID;
      return next();
    }
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  next();
});

io.on("connection", async (socket: any) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  socket.on("predictionRequest", ({ payload: { uuid, frame } }: any) => {
    socket.emit("predictionResponse", {
      uuid,
      models: [{
        name: "Model 1",
        labels: ["happy", "sad", "angry"],
        probabilities: [0.2, 0.3, 0.5]
      }],
      aggregatedResult: {
        name: "Result",
        labels: ["happy", "sad", "angry"],
        probabilities: [0.5, 0.1, 0.4]
      }
    }); 
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        connected: false,
      });
    }
  });
});

setupWorker(io);