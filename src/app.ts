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
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Suggested options for similarity to existing grpc.load behavior
const packageDefinition = protoLoader.loadSync(
    process.env.GRPC_PROTO_PATH,
    {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    }
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// The protoDescriptor object has the full package hierarchy
const modelService = protoDescriptor.Model;
const clientModel1 = new modelService(`${process.env.MODEL_1_HOST}:${process.env.MODEL_1_PORT}`,
                                       grpc.credentials.createInsecure());
                                      
const { setupWorker } = require("@socket.io/sticky");
import * as crypto from "crypto";

const randomId = () => crypto.randomBytes(8).toString("hex");
const frameHeaderLength = "data:image/png;base64,".length

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

  socket.on("predictionRequest", ({ payload: { uuid, frame: base64frame } }: any) => {
    new Promise((resolve: any, reject: any) => {
      base64frame = base64frame.substring(frameHeaderLength); // Removing data header
      base64frame = Buffer.from(base64frame, 'base64');

      clientModel1.Inference({image: base64frame}, (err: any, data: any) => {
        // console.log("Model 1 response data: ", data);
        resolve();
      })

      // Sample response, using this for now
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
    })
    
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