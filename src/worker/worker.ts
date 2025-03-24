import amqp from "amqplib";
import playwright from "playwright";
import fs from "fs";
import cluster from "cluster";
import path from "path";
import config from "../config/config";


let browser: playwright.Browser | null = null;

async function getBrowser() {
  if (!browser) {
    browser = await playwright.chromium.launch({ headless: true });
    console.log(`Worker ${process.pid} browser launched`);
  }
  return browser;
}

async function generatePDF(url: string, payload: any) {
  console.log(`⚙️ Worker ${process.pid} Generating PDF for: ${url}`);

  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.route(url, async (route) => {
      const response = await page.request.post(url, {
        data: payload,
      });

      const body = await response.text();
      await route.fulfill({ body, contentType: "text/html" });
    });

    await page.goto(url, { waitUntil: "networkidle" });

    const outputPath = path.join("generated_pdfs", `documento-pdf-${payload.id}.pdf`);
    fs.mkdirSync("generated_pdfs", { recursive: true });

    await page.pdf({ path: outputPath, format: "A4", printBackground: true });

    console.log(`✅ PDF saved at: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
  } finally {
    await page.close();
    await context.close();
  }
}

async function startWorker() {
  const conn = await amqp.connect(config.rabbitmq);
  const channel = await conn.createChannel();
  const queue = "pdf_queue";

  await channel.assertQueue(queue, { durable: true }); 
  console.log(`📥 PDF Worker ${process.pid} is running`);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const { url, payload } = JSON.parse(msg.content.toString());
      await generatePDF(url, payload);
      channel.ack(msg);
    }
  });
}

if (cluster.isPrimary) {
  console.log(`🚀 Master ${process.pid} is running`);

  for (let i = 0; i < config.cluster.numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`❌ Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  startWorker();
}

process.on("exit", async () => {
  if (browser) {
    await browser.close();
    console.log("🔻 Playwright closed");
  }
});
