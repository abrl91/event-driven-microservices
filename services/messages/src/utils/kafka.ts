import { Kafka } from "kafkajs";
import { brokers } from "../../../brokers";
import { topics } from "../../../topics";

const kafka = new Kafka({
  clientId: "messages-app",
  brokers,
});

const producer = kafka.producer();

export async function connectProducer() {
  console.log("producer connecting...");
  await producer.connect();
}

export async function disconnectProducer() {
  console.log("producer disconnecting...");
  await producer.disconnect();
}

export async function sendMessage(topic: typeof topics[number], message: any) {
  return producer.send({
    topic,
    messages: [
      {
        value: message,
      },
    ],
  });
}
