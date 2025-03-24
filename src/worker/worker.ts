import amqp from "amqplib";
import playwright from "playwright";
import fs from "fs";
import path from "path";
import config from "../config/config";

let browser: playwright.Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await playwright.chromium.launch({ headless: true });
  }
  return browser;
}

async function generatePDF(url: string, payload: any) {
  console.log(`⚙️ Generating PDF for: ${url}`);

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.route(url, async (route) => {
      const response = await page.request.post(url, {
        data: payload,
      });

      const body = await response.text();
      await route.fulfill({ body, contentType: "text/html" });
    });

    await page.goto(url, { waitUntil: "networkidle" });

    const outputPath = path.join("generated_pdfs", `documento-pdf-5.pdf`);
    fs.mkdirSync("generated_pdfs", { recursive: true });

    await page.pdf({ path: outputPath, format: "A4", printBackground: true });

    console.log(`✅ PDF saved at: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
  } finally {
    await page.close();
  }
}

async function startWorker() {
  const conn = await amqp.connect(config.rabbitmq);
  const channel = await conn.createChannel();
  const queue = "pdf_queue";

  await channel.assertQueue(queue, { durable: true }); 
  console.log("📥 PDF Worker is running");

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { url, payload } = JSON.parse(msg.content.toString());
      await generatePDF(url, payload);
      channel.ack(msg);
    }
  });
}

startWorker();

process.on("exit", async () => {
  if (browser) {
    await browser.close();
    console.log("🔻 Playwright closed");
  }
});
