import dotenv from 'dotenv';
import os from "os";
dotenv.config();

export default {
  cluster: {
    numCPUs: process.env.CLUSTER_CPUS
      ? Number(process.env.CLUSTER_CPUS)
      : os.cpus().length,
    multiplier: process.env.CLUSTER_MULTIPLIER
      ? Number(process.env.CLUSTER_MULTIPLIER)
      : 1,
    numCPUsWorker: process.env.CLUSTER_CPUS_WORKER
      ? Number(process.env.CLUSTER_CPUS_WORKER)
      : undefined,
    multiplierWorker: process.env.CLUSTER_MULTIPLIER_WORKER
      ? Number(process.env.CLUSTER_MULTIPLIER_WORKER)
      : 1,
    disabled: process.env.CLUSTER_DISABLED === "true",
  },
  rabbitmq: {
    hostname: "rabbitmq",
    port: 5672,
    maxRetries: 3,
    retryTtl: 1000,
  },
};
