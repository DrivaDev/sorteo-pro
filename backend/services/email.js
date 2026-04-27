const nodemailer = require('nodemailer');

function createTransport() {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_FROM, pass: process.env.EMAIL_PASSWORD },
  });
}

function buildVerificationHtml(code) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF7ED;font-family:'Fira Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
        <tr>
          <td style="background:linear-gradient(135deg,#9A3412,#EA580C);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">Sorteo Pro</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Verificación de cuenta</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;padding:36px 32px;text-align:center;">
            <h2 style="margin:0 0 8px;color:#9A3412;font-size:18px;font-weight:700;">Verificá tu email</h2>
            <p style="margin:0 0 24px;color:#57534e;font-size:14px;line-height:1.6;">Ingresá el siguiente código para activar tu cuenta:</p>
            <div style="background:#FFF7ED;border:2px solid #FED7AA;border-radius:16px;padding:24px;display:inline-block;margin:0 auto;">
              <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#EA580C;">${code}</span>
            </div>
            <p style="margin:20px 0 0;color:#a8a29e;font-size:12px;">Este código expira en 15 minutos.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#fff;border-radius:0 0 16px 16px;padding:16px 32px 24px;text-align:center;border-top:1px solid #FED7AA;">
            <p style="margin:0;font-size:11px;color:#a8a29e;">Si no solicitaste este código, ignorá este email.</p>
            <p style="margin:8px 0 0;font-size:11px;color:#d6d3d1;">
              Desarrollado por <a href="https://drivadev.com" style="color:#EA580C;font-weight:600;text-decoration:none;">Driva Dev</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendVerificationCode(email, code) {
  const transport = createTransport();
  const text = `Tu código de verificación para Sorteo Pro es: ${code}\n\nExpira en 15 minutos.`;
  const html = buildVerificationHtml(code);

  if (!transport) {
    console.log(`[Email] Sin configurar. Código para ${email}: ${code}`);
    return { ok: false, reason: 'email_not_configured', code };
  }
  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: `${code} — Código de verificación Sorteo Pro`,
      text,
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error('[Email] Error:', err.message);
    return { ok: false, reason: err.message };
  }
}

module.exports = { sendVerificationCode };
