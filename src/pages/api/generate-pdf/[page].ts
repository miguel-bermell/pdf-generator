import type { APIRoute } from "astro";
import { sendToQueue } from "../../../lib/amqp";
import { PAGES } from "../../../lib/enums/pages";
import type { Languages } from "../../../types/Languages";


export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const query = new URLSearchParams(request.url);

  const { page } = params;
  const body = await request.json();

  if (!page || !Object.values(PAGES).includes(page)) {
    return new Response("Invalid page", { status: 400 });
  }

  const language = query.get("language") as Languages ?? "es";
  const url = `http://ms-pdf:4321/${page}?language=${language}`;

  await sendToQueue(url, body);
  
  return new Response("📤 PDF quequed", { status: 200 });
}
