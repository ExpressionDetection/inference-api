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
      socket.username = session.username;  
      return next();
    }
  }
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.sessionID = randomId();
  socket.userID = randomId();
  socket.username = username;
  next();
});

io.on("connection", async (socket: any) => {
  // persist session
  sessionStore.saveSession(socket.sessionID, {
    userID: socket.userID,
    username: socket.username,
    connected: true,
  });

  // emit session details
  socket.emit("session", {
    sessionID: socket.sessionID,
    userID: socket.userID,
  });

  // join the "userID" room
  socket.join(socket.userID);

  socket.on("predictionRequest", ({ frame }: any) => {
    console.log("DEBUG")
    console.log(frame)
    socket.emit("predictionResponse", {message: "Hello"}); 
  });

  // notify users upon disconnection
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: false,
      });
    }
  });
});

setupWorker(io);