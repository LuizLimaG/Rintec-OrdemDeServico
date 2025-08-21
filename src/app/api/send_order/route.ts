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
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--hide-scrollbars',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    await page.goto(url, { 
      waitUntil: "networkidle0",
      timeout: 30000 
    });

    await page.emulateMediaType("print");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      displayHeaderFooter: false,
      scale: 1.0,
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
        subject: "Seu PDF - Relatório de Serviço",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Relatório de Serviço</h2>
            <p>Olá,</p>
            <p>Segue em anexo o relatório de serviço solicitado.</p>
            <p>Se você tiver alguma dúvida, entre em contato conosco.</p>
            <p>Atenciosamente,<br>Equipe de Serviços</p>
          </div>
        `,
        attachments: [
          {
            filename: `pedido-${id}.pdf`,
            content: buffer,
            contentType: 'application/pdf',
          },
        ],
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}