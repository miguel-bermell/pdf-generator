
import amqp from "amqplib";
import config from "../config/config";


async function sendToQueue(url: string, payload: any) {
  const conn = await amqp.connect(config.rabbitmq);
  const channel = await conn.createChannel();
  const queue = "pdf_queue";

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify({ url, payload })));
  console.log("📤 PDF in queue");
}

export {
  sendToQueue
}
