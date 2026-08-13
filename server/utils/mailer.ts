import nodemailer from 'nodemailer';
import { prisma } from '../db.js';
import { decryptText } from './crypto.js';

export interface SmtpConfigInput {
  host: string;
  port: number;
  user: string;
  password?: string;
  fromEmail: string;
  fromName: string;
  security: 'TLS' | 'STARTTLS' | 'NONE';
  replyTo?: string;
}

export async function getActiveTransporter() {
  // 1. Try DB SMTP Setting
  const dbSmtp = await prisma.smtpSetting.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  });

  if (dbSmtp) {
    const clearPassword = decryptText(dbSmtp.encryptedPassword);
    const secure = dbSmtp.security === 'TLS';

    const transporter = nodemailer.createTransport({
      host: dbSmtp.host,
      port: dbSmtp.port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: dbSmtp.user,
        pass: clearPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    return {
      transporter,
      from: `"${dbSmtp.fromName}" <${dbSmtp.fromEmail}>`,
      replyTo: dbSmtp.replyTo || dbSmtp.fromEmail,
      configured: true,
    };
  }

  // 2. Fallback to process.env if available
  const envHost = process.env.SMTP_HOST;
  const envUser = process.env.SMTP_USER;
  const envPass = process.env.SMTP_PASSWORD;

  if (envHost && envUser && envPass) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const fromName = process.env.SMTP_FROM_NAME || 'Villa María Reservas';
    const transporter = nodemailer.createTransport({
      host: envHost,
      port: port,
      secure: port === 465,
      auth: {
        user: envUser,
        pass: envPass,
      },
    });

    return {
      transporter,
      from: `"${fromName}" <${envUser}>`,
      replyTo: envUser,
      configured: true,
    };
  }

  return {
    transporter: null,
    from: '',
    replyTo: '',
    configured: false,
  };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const { transporter, from, replyTo, configured } = await getActiveTransporter();
    if (!configured || !transporter) {
      console.warn('[Mailer] SMTP not configured. Email skipped to:', to);
      return false;
    }

    await transporter.sendMail({
      from,
      to,
      replyTo,
      subject,
      html,
    });

    console.log('[Mailer] Email sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('[Mailer] Error sending email to', to, ':', error);
    return false;
  }
}

export async function testSmtpConnection(config: SmtpConfigInput): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.security === 'TLS',
      auth: {
        user: config.user,
        pass: config.password || '',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();
    return { success: true, message: 'Conexión SMTP verificada con éxito.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al conectar con el servidor SMTP.' };
  }
}

export async function sendTestEmailDirect(config: SmtpConfigInput, targetEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.security === 'TLS',
      auth: {
        user: config.user,
        pass: config.password || '',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: targetEmail,
      subject: 'Prueba de Configuración SMTP - Villa María',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #059669;">¡Configuración SMTP Correcta!</h2>
          <p>Este es un correo de prueba enviado desde el Panel de Administración de Villa María.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">Servidor SMTP: ${config.host}:${config.port} | Usuario: ${config.user}</p>
        </div>
      `,
    });

    return { success: true, message: `Correo de prueba enviado con éxito a ${targetEmail}.` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Error al enviar el correo de prueba.' };
  }
}
