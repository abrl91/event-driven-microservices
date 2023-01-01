import { connectToDb } from "./utils/db";
import { connectProducer, disconnectProducer } from "./utils/kafka";
import { createServer } from "./utils/server";

const signals = ["SIGINT", "SIGTERM", "SIGQUIT"] as const;

async function gracefulShutdown(app: Awaited<ReturnType<typeof createServer>>) {
  console.log("graceful shutdown...");

  await app.close();
  await disconnectProducer();

  process.exit(0);
}

async function main() {
  const app = createServer();

  await connectToDb();

  await connectProducer();

  app.listen({
    port: 3000,
    host: "0.0.0.0",
  });

  for (const signal of signals) {
    process.on(signal, () => {
      gracefulShutdown(app);
    });
  }

  console.log("Message service ready at http://localhost:3000");
}

main();
