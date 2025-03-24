import type { APIRoute } from "astro";
import { sendToQueue } from "../../../lib/amqp";

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const { page } = params;
  const body = await request.json();

  const url = `http://ms-pdf:4321/${page}`;

  await sendToQueue(url, body);
  
  return new Response("📤 PDF quequed", { status: 200 });
}
