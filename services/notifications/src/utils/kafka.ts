import { Kafka } from "kafkajs";
import { brokers } from "../../../brokers";
import { topics } from "../../../topics";

const kafka = new Kafka({
  clientId: "notifications-service",
  brokers,
});

const consumer = kafka.consumer({
  groupId: "notifications-service",
});

const topicsToSubscribe: Record<typeof topics[number], Function> = {
  "message-created": messageCreatedHandler,
  "test-topic": () => testTopicHandler,
};

async function messageCreatedHandler(data: any) {
  console.log("message-created", data);
}

async function testTopicHandler(data: any) {
  console.log("test-topic", data);
}

export async function connectConsumer() {
  console.log("consumer connecting...");
  await consumer.connect();

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message || !message.value) return;
      const data = JSON.parse(message.value.toString());

      const handler = topicsToSubscribe[topic];
      if (handler) {
        await handler(data);
      }
    },
  });
}

export async function disconnectConsumer() {
  console.log("consumer disconnecting...");
  await consumer.disconnect();
}
