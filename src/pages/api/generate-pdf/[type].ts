import type { APIRoute } from "astro";
import { sendToQueue } from "../../../lib/amqp";

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const { type } = params;
  const body = await request.json();

  const url = `http://ms-pdf:4321/${type}`;

  await sendToQueue(url, body);
  
  return new Response("📤 PDF quequed", { status: 200 });
}
