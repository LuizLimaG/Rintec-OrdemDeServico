import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const { id, channel, destination } = await req.json();

    if (!id || !channel || !destination) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    // Gerar PDF
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/order/service/${id}`;
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print")
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    await browser.close();

    // Converter Uint8Array para Buffer
    const buffer = Buffer.from(pdfBuffer);

    if (channel === "email") {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Serviços" <${process.env.SMTP_USER}>`,
        to: destination,
        subject: `Relatório do Serviço #${id}`,
        text: "Segue em anexo o relatório solicitado.",
        attachments: [
          {
            filename: `servico-${id}.pdf`,
            content: buffer, // Usar o buffer convertido
          },
        ],
      });

    } else if (channel === "whatsapp") {
      // Formatar número para WhatsApp
      const phoneNumber = destination.replace(/\D/g, '');
      const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;

      // Upload do arquivo para o WhatsApp
      const formData = new FormData();
      
      // Criar Blob com buffer convertido
      const blob = new Blob([buffer], { type: 'application/pdf' });
      formData.append("file", blob, `servico-${id}.pdf`);
      formData.append("messaging_product", "whatsapp");
      formData.append("type", "application/pdf");

      const uploadRes = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/media`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          },
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        console.error("Erro no upload:", uploadData);
        throw new Error(
          `Erro ao fazer upload para o WhatsApp: ${JSON.stringify(uploadData)}`
        );
      }

      // Verificar se o upload retornou ID
      if (!uploadData.id) {
        throw new Error("Upload não retornou ID do arquivo");
      }

      // Enviar mensagem com o documento
      const msgRes = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: formattedPhone, // usar número formatado
            type: "document",
            document: {
              id: uploadData.id,
              filename: `servico-${id}.pdf`,
              caption: `Relatório do Serviço #${id}` // adicionar caption
            },
          }),
        }
      );

      const msgData = await msgRes.json();
      if (!msgRes.ok) {
        console.error("Erro ao enviar mensagem:", msgData);
        throw new Error(
          `Erro ao enviar mensagem pelo WhatsApp: ${JSON.stringify(msgData)}`
        );
      }

    } else {
      return NextResponse.json({ error: "Canal inválido" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Erro ao enviar PDF:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno" },
      { status: 500 }
    );
  }
}