import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function POST(req: Request) {
  try {
    const { id, channel, destination } = await req.json();

    if (!id || !channel || !destination) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/order/service/${id}`;

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    const buffer = Buffer.from(pdfBuffer);

    if (channel === "email") {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: destination,
        subject: "Seu PDF",
        text: "Segue o PDF em anexo.",
        attachments: [
          {
            filename: `pedido-${id}.pdf`,
            content: buffer,
          },
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}
