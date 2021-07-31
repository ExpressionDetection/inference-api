const cluster = require("cluster");
const http = require("http");
const { setupMaster } = require("@socket.io/sticky");

const WORKERS_COUNT = 4;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < WORKERS_COUNT; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker: any) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });

  const httpServer = http.createServer();
  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection", // either "random", "round-robin" or "least-connection"
  });
  const API_PORT = process.env.API_PORT || 3000;

  httpServer.listen(API_PORT, () =>
    console.log(`server listening at http://localhost:${API_PORT}`)
  );
} else {
  console.log(`Worker ${process.pid} started`);
  require("./app");
}