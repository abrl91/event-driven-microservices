import { connectToDb } from "./utils/db";
import { connectConsumer, disconnectConsumer } from "./utils/kafka";
import { createServer } from "./utils/server";

const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

async function gracefulShutdown(app: Awaited<ReturnType<typeof createServer>>) {
  console.log("Graceful shutdown");

  await app.close();
  await disconnectConsumer();

  process.exit(0);
}

async function main() {
  const app = createServer();

  await connectToDb();

  await connectConsumer();

  await app.listen({
    port: 4000,
    host: "0.0.0.0",
  });

  for (const signal of signals) {
    process.on(signal, () => {
      gracefulShutdown(app);
    });
  }

  console.log("Notification service ready at http://localhost:4000");
}

main();
