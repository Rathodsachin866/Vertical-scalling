import express from "express";
import cluster from "cluster";
import os from "os";

const totalCPUs = os.cpus().length; // Dynamically detect available CPUs
const port = 3000;

if (cluster.isPrimary || cluster.isMaster) {
  console.log(`Number of CPUs is ${totalCPUs}`);
  console.log(`Primary process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log("Forking a new worker...");
    cluster.fork();
  });
} else {
  const app = express();
  console.log(`Worker ${process.pid} started`);

  app.get("/", (req, res) => {
    res.send(`Hello from worker ${process.pid}`);
   console.log(`Hello from worker ${process.pid}`);
  });

  app.get("/api/:n", (req, res) => {
    let n = parseInt(req.params.n);
    let count = 0;

    if (n > 5_000_000_000) n = 5_000_000_000;

    for (let i = 0; i <= n; i++) {
      count += i;
    }

    res.send(`Final count is ${count}, handled by worker ${process.pid}`);
  });

  app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}
