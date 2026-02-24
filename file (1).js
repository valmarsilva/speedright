import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      nome,
      email,
      whatsapp,
      empresa,
      cidade,
      servico,
      mensagem,
      website // honeypot anti-spam
    } = req.body || {};

    if (website) {
      return res.status(200).json({ ok: true });
    }

    if (!nome || !email || !whatsapp || !servico || !mensagem) {
      return res.status(400).json({ ok: false, error: "Campos obrigatórios faltando." });
    }

    const to = process.env.CONTACT_TO_EMAIL || "itapara30@gmail.com";
    const subject = `Novo contato (Itajaimetal): ${nome} — ${servico}`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Novo cadastro/contato — Itajaimetal</h2>
        <p><b>Nome:</b> ${escapeHtml(nome)}</p>
        <p><b>E-mail:</b> ${escapeHtml(email)}</p>
        <p><b>WhatsApp:</b> ${escapeHtml(whatsapp)}</p>
        <p><b>Empresa:</b> ${escapeHtml(empresa || "-")}</p>
        <p><b>Cidade:</b> ${escapeHtml(cidade || "-")}</p>
        <p><b>Serviço:</b> ${escapeHtml(servico)}</p>
        <p><b>Mensagem:</b><br>${escapeHtml(mensagem).replaceAll("\n", "<br>")}</p>
        <hr>
        <p>Enviado pelo site.</p>
      </div>
    `;

    await resend.emails.send({
      from: "Itajaimetal <onboarding@resend.dev>",
      to: [to],
      replyTo: email,
      subject,
      html
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Falha ao enviar e-mail." });
  }
}
