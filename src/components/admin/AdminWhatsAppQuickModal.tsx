import React, { useState } from 'react';
import {
  X,
  Mail,
  MessageCircle,
  Send,
  Copy,
  Check,
  MapPin,
  Wifi,
  Star,
  DollarSign,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../api';

export interface QuickMessageReservation {
  id: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  startDate: string;
  endDate: string;
  totalPrice?: number;
  status?: string;
}

interface AdminWhatsAppQuickModalProps {
  reservation: QuickMessageReservation;
  onClose: () => void;
  propertyAddress?: string;
  mapsUrl?: string;
  wifiSsid?: string;
  wifiPass?: string;
}

export const AdminWhatsAppQuickModal: React.FC<AdminWhatsAppQuickModalProps> = ({
  reservation,
  onClose,
  propertyAddress = 'Calle 15, Urbanización Privada, Chichiriviche, Edo. Falcón',
  mapsUrl = 'https://maps.google.com/?q=10.9317,-68.2736',
  wifiSsid = 'VillaMaria_Privada_5G',
  wifiPass = 'MorrocoySol2026!',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [recipientEmail, setRecipientEmail] = useState<string>(reservation.guestEmail || '');
  const [activeTab, setActiveTab] = useState<'email' | 'whatsapp'>('email');

  const cleanPhone = (reservation.guestPhone || '').replace(/\D/g, '');

  const startFormatted = new Date(reservation.startDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const endFormatted = new Date(reservation.endDate).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const templates = [
    {
      id: 'welcome',
      title: '📍 1. Bienvenida & Ubicación GPS (24h antes del viaje)',
      subtitle: 'Instrucciones de llegada, enlace a Google Maps, hora de check-in e ingreso por garita.',
      subject: `🌴 ¡Bienvenido a Villa María! Instrucciones de Llegada y Ubicación GPS (#${reservation.id.slice(0, 8)})`,
      icon: MapPin,
      color: 'border-emerald-500/40 text-emerald-300',
      text: `¡Hola ${reservation.guestName}! 🌴 Te saludamos desde Villa María (Chichiriviche). Estamos listos para recibirte para tu estancia del ${startFormatted} al ${endFormatted}.

📍 Dirección: ${propertyAddress}
🗺️ GPS Google Maps: ${mapsUrl}
🕒 Hora de Check-in: A partir de las 3:00 PM.
🎟️ Código de Reserva: ${reservation.id.slice(0, 8)}

El personal de la garita de seguridad de la Calle 15 tiene tu nombre registrado para el acceso vehicular directo. ¡Buen viaje y te esperamos!`,
      html: `
        <div style="background-color: #F8F5F0; padding: 25px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.06);">
            <div style="background-color: #1B3B36; padding: 24px 20px; text-align: center; border-bottom: 3px solid #059669;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 1px;">VILLA MARÍA 🌴</h1>
              <p style="color: #A7F3D0; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Guía de Llegada &amp; Check-In • Chichiriviche</p>
            </div>
            <div style="padding: 24px 20px;">
              <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 0 0 10px 0; font-size: 20px;">¡Hola ${reservation.guestName}!</h2>
              <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0 0 18px 0; line-height: 1.5;">
                Estamos muy emocionados de recibirte en Villa María. A continuación tienes todos los datos clave para tu llegada del <strong>${startFormatted}</strong> al <strong>${endFormatted}</strong>:
              </p>
              
              <div style="background-color: #EAE3D8; border-radius: 14px; padding: 16px; margin-bottom: 18px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr><td style="padding: 5px 0; color: rgba(27,59,54,0.7); font-weight: bold;">🎟️ Código de Reserva:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; font-family: monospace;">${reservation.id}</td></tr>
                  <tr><td style="padding: 5px 0; color: rgba(27,59,54,0.7);">🕒 Hora de Check-in:</td><td style="padding: 5px 0; text-align: right; font-weight: bold;">A partir de las 3:00 PM</td></tr>
                  <tr><td style="padding: 5px 0; color: rgba(27,59,54,0.7);">🛡️ Acceso Garita:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; color: #059669;">Vigilancia 24/7 Calle 15</td></tr>
                </table>
              </div>

              <div style="background-color: #ffffff; border: 1px solid rgba(27,59,54,0.15); border-radius: 14px; padding: 16px; text-align: center; margin-bottom: 20px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #1B3B36; font-weight: bold;">📍 Dirección de la Propiedad:</p>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: rgba(27,59,54,0.8);">${propertyAddress}</p>
                <a href="${mapsUrl}" target="_blank" style="display: inline-block; background-color: #1B3B36; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: bold; padding: 10px 20px; border-radius: 10px; text-transform: uppercase; letter-spacing: 1px;">🗺️ Abrir en Google Maps</a>
              </div>

              <p style="font-size: 12px; color: rgba(27,59,54,0.75); margin: 0; line-height: 1.4;">
                El vigilante de turno en la garita principal tiene tu nombre en la lista autorizada de huéspedes para acceso directo. ¡Te deseamos un excelente viaje!
              </p>
            </div>
            <div style="background-color: #F8F5F0; padding: 14px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">
              © Villa María • Chichiriviche, Falcón, Venezuela
            </div>
          </div>
        </div>
      `,
    },
    {
      id: 'wifi_rules',
      title: '📶 2. Clave Wi-Fi, Normas & Servicios de la Casa',
      subtitle: 'Red Wi-Fi de alta velocidad, horario de piscina y planta eléctrica 24/7.',
      subject: `📶 Clave de Wi-Fi y Guía de Comodidades en Villa María (#${reservation.id.slice(0, 8)})`,
      icon: Wifi,
      color: 'border-teal-500/40 text-teal-300',
      text: `¡Hola ${reservation.guestName}! Esperamos que estés disfrutando de tu estadía en Villa María 🌴. Te recordamos los accesos y comodidades de la casa:

📶 Red Wi-Fi: ${wifiSsid}
🔑 Contraseña: ${wifiPass}
🏊‍♂️ Piscina: Climatizada de 8:00 AM a 10:00 PM
⚡ Planta eléctrica 24/7 y tanque de agua de 10.000L operativos

Cualquier consulta o necesidad durante tu estancia, estamos a tu completa disposición. ¡Feliz descanso!`,
      html: `
        <div style="background-color: #F8F5F0; padding: 25px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.06);">
            <div style="background-color: #1B3B36; padding: 24px 20px; text-align: center; border-bottom: 3px solid #0D9488;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 1px;">VILLA MARÍA 🌴</h1>
              <p style="color: #5EEAD4; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Credenciales Wi-Fi &amp; Servicios</p>
            </div>
            <div style="padding: 24px 20px;">
              <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 0 0 10px 0; font-size: 20px;">¡Hola ${reservation.guestName}!</h2>
              <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0 0 18px 0; line-height: 1.5;">
                Esperamos que estés disfrutando al máximo de tu estancia. Aquí tienes tus credenciales de conexión y servicios de la propiedad:
              </p>
              
              <!-- Wi-Fi Box -->
              <div style="background-color: #E6F4EA; border: 2px dashed #059669; border-radius: 14px; padding: 18px; margin-bottom: 18px; text-align: center;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #047857;">📶 WI-FI DE ALTA VELOCIDAD (FIBRA ÓPTICA)</p>
                <p style="margin: 4px 0; font-size: 15px; color: #1B3B36;">Red (SSID): <strong>${wifiSsid}</strong></p>
                <p style="margin: 4px 0; font-size: 16px; color: #047857; font-family: monospace; font-weight: bold; letter-spacing: 1px;">Contraseña: ${wifiPass}</p>
              </div>

              <!-- Comodidades Grid -->
              <div style="background-color: #EAE3D8; border-radius: 14px; padding: 16px; margin-bottom: 18px;">
                <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 13px; color: #1B3B36;">✨ Servicios y Normas de la Casa:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: rgba(27,59,54,0.85); line-height: 1.6;">
                  <li>🏊‍♂️ <strong>Piscina:</strong> Operativa de 8:00 AM a 10:00 PM.</li>
                  <li>⚡ <strong>Energía y Agua:</strong> Planta eléctrica 24/7 y tanque de 10.000L garantizados.</li>
                  <li>🌙 <strong>Horas de Descanso:</strong> Agradecemos moderar el volumen de música después de las 11:00 PM.</li>
                </ul>
              </div>

              <p style="font-size: 12px; color: rgba(27,59,54,0.75); margin: 0;">
                Estamos a tu total disposición ante cualquier consulta durante tus vacaciones.
              </p>
            </div>
            <div style="background-color: #F8F5F0; padding: 14px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">
              © Villa María • Chichiriviche, Falcón, Venezuela
            </div>
          </div>
        </div>
      `,
    },
    {
      id: 'checkout',
      title: '⭐ 3. Check-out, Agradecimiento & Solicitud de Reseña',
      subtitle: 'Horario de salida, entrega de llaves y enlace para dejar una reseña en la web.',
      subject: `⭐ Gracias por visitarnos en Villa María — Recordatorio de Check-out (#${reservation.id.slice(0, 8)})`,
      icon: Star,
      color: 'border-amber-500/40 text-amber-300',
      text: `¡Hola ${reservation.guestName}! 🌴 Muchas gracias por elegir Villa María para tus vacaciones en Morrocoy.

🕒 Recordatorio de Check-out: Hoy hasta las 12:00 PM. Por favor entregar las llaves al encargado de la casa.
⭐ Tu opinión es muy importante para nosotros: ¿Podrías dejarnos una breve reseña en nuestra página web?

¡Esperamos tener el gusto de recibirte nuevamente muy pronto!`,
      html: `
        <div style="background-color: #F8F5F0; padding: 25px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.06);">
            <div style="background-color: #1B3B36; padding: 24px 20px; text-align: center; border-bottom: 3px solid #D97706;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 1px;">VILLA MARÍA 🌴</h1>
              <p style="color: #FDE68A; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Check-Out &amp; Agradecimiento</p>
            </div>
            <div style="padding: 24px 20px; text-align: center;">
              <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 0 0 10px 0; font-size: 20px;">¡Gracias por tu visita, ${reservation.guestName}!</h2>
              <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0 0 18px 0; line-height: 1.5;">
                Ha sido un placer recibirte en Villa María. Esperamos que hayas disfrutado de unas vacaciones inolvidables.
              </p>
              
              <div style="background-color: #FEF3C7; border-radius: 14px; padding: 16px; margin-bottom: 20px; text-align: left;">
                <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 13px; color: #92400E;">🕒 Recordatorio de Check-out:</p>
                <p style="margin: 0; font-size: 12px; color: #78350F;">
                  La salida está programada para hoy hasta las <strong>12:00 PM</strong>. Por favor haz entrega de las llaves al encargado de la casa.
                </p>
              </div>

              <div style="background-color: #EAE3D8; border-radius: 14px; padding: 20px; margin-bottom: 18px;">
                <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 14px; color: #1B3B36;">⭐⭐⭐⭐⭐</p>
                <p style="margin: 0 0 12px 0; font-size: 13px; color: rgba(27,59,54,0.9); font-weight: bold;">
                  ¿Cómo fue tu experiencia en Villa María?
                </p>
                <p style="margin: 0 0 14px 0; font-size: 12px; color: rgba(27,59,54,0.75);">
                  Tu opinión nos ayuda enormemente a seguir brindando el mejor servicio.
                </p>
              </div>

              <p style="font-size: 12px; color: rgba(27,59,54,0.75); margin: 0;">
                ¡Te esperamos de vuelta en tu próxima visita a Chichiriviche!
              </p>
            </div>
            <div style="background-color: #F8F5F0; padding: 14px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">
              © Villa María • Chichiriviche, Falcón, Venezuela
            </div>
          </div>
        </div>
      `,
    },
    {
      id: 'payment_reminder',
      title: '💰 4. Confirmación de Pago & Verificación de Reserva',
      subtitle: 'Recordatorio para reservas pendientes que requieren comprobante de pago.',
      subject: `💰 Confirmación de Pago y Validación de Reserva en Villa María (#${reservation.id.slice(0, 8)})`,
      icon: DollarSign,
      color: 'border-purple-500/40 text-purple-300',
      text: `¡Hola ${reservation.guestName}! Te escribimos del equipo de Villa María para confirmar los datos de tu solicitud de reserva #${reservation.id.slice(0, 8)} del ${startFormatted} al ${endFormatted}.

💰 Monto Total: $${reservation.totalPrice || 0} USD
Por favor envíanos por correo o WhatsApp tu comprobante de transferencia (Zelle / Pago Móvil / Efectivo) para activar tu pase digital con código QR. ¡Muchas gracias!`,
      html: `
        <div style="background-color: #F8F5F0; padding: 25px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1B3B36;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; border: 1px solid rgba(27,59,54,0.15); overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.06);">
            <div style="background-color: #1B3B36; padding: 24px 20px; text-align: center; border-bottom: 3px solid #9333EA;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-family: Georgia, serif; letter-spacing: 1px;">VILLA MARÍA 🌴</h1>
              <p style="color: #E9D5FF; margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Validación de Pago &amp; Reserva</p>
            </div>
            <div style="padding: 24px 20px;">
              <h2 style="color: #1B3B36; font-family: Georgia, serif; margin: 0 0 10px 0; font-size: 20px;">¡Hola ${reservation.guestName}!</h2>
              <p style="color: rgba(27,59,54,0.8); font-size: 13px; margin: 0 0 18px 0; line-height: 1.5;">
                Hemos registrado tu solicitud de reserva para el periodo del <strong>${startFormatted}</strong> al <strong>${endFormatted}</strong>.
              </p>
              
              <div style="background-color: #EAE3D8; border-radius: 14px; padding: 16px; margin-bottom: 18px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr><td style="padding: 5px 0; color: rgba(27,59,54,0.7);">Código de Reserva:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; font-family: monospace;">${reservation.id}</td></tr>
                  <tr><td style="padding: 5px 0; color: rgba(27,59,54,0.7);">Estado:</td><td style="padding: 5px 0; text-align: right; font-weight: bold; color: #D97706;">Pendiente de Comprobante</td></tr>
                  <tr style="border-top: 1px solid rgba(27,59,54,0.15);"><td style="padding: 8px 0 0 0; font-weight: bold; color: #1B3B36;">Total a Pagar:</td><td style="padding: 8px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #1B3B36;">$${reservation.totalPrice || 0} USD</td></tr>
                </table>
              </div>

              <div style="background-color: #EDE9FE; border-radius: 14px; padding: 16px; margin-bottom: 18px;">
                <p style="margin: 0 0 6px 0; font-weight: bold; font-size: 13px; color: #5B21B6;">💳 Envío de Comprobante:</p>
                <p style="margin: 0; font-size: 12px; color: #6B21A8; line-height: 1.4;">
                  Por favor responde a este correo adjuntando tu comprobante de pago (Zelle, Pago Móvil o Transferencia) para activar tu <strong>Pase Digital con Código QR</strong>.
                </p>
              </div>

              <p style="font-size: 12px; color: rgba(27,59,54,0.75); margin: 0;">
                ¡Muchas gracias por elegir Villa María!
              </p>
            </div>
            <div style="background-color: #F8F5F0; padding: 14px; text-align: center; border-top: 1px solid rgba(27,59,54,0.1); font-size: 11px; color: rgba(27,59,54,0.6);">
              © Villa María • Chichiriviche, Falcón, Venezuela
            </div>
          </div>
        </div>
      `,
    },
  ];

  // 1-Click Send Email via SMTP
  const handleSendEmail = async (template: (typeof templates)[0], index: number) => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setEmailStatus({
        type: 'error',
        message: 'Por favor ingresa un correo electrónico válido para el huésped.',
      });
      return;
    }

    setSendingIndex(index);
    setEmailStatus(null);

    try {
      await api.sendManualEmail({
        to: recipientEmail.trim(),
        subject: template.subject,
        bodyHtml: template.html,
      });

      setEmailStatus({
        type: 'success',
        message: `✅ Correo enviado con éxito a ${recipientEmail.trim()}`,
      });
    } catch (err: any) {
      setEmailStatus({
        type: 'error',
        message: err.message || 'Error al enviar el email. Verifica la configuración SMTP en el panel.',
      });
    } finally {
      setSendingIndex(null);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getWhatsAppUrl = (text: string) => {
    const encoded = encodeURIComponent(text);
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  const getMailtoUrl = (template: (typeof templates)[0]) => {
    const encodedSubject = encodeURIComponent(template.subject);
    const encodedBody = encodeURIComponent(template.text);
    return `mailto:${recipientEmail || ''}?subject=${encodedSubject}&body=${encodedBody}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-emerald-950 border border-emerald-500/30 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-3 text-emerald-100 font-sans max-h-[94vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors z-10 min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-3 pr-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                Centro de Comunicaciones con Huéspedes
              </h3>
              <p className="text-[11px] text-emerald-300/70">
                Envío oficial por <strong>Correo Electrónico (SMTP)</strong> y plantillas de <strong>WhatsApp</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Guest Recipient Header Bar */}
        <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-3 mb-3 text-xs space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/60 font-bold block">
                Huésped Principal
              </span>
              <span className="text-sm font-bold text-white">{reservation.guestName}</span>
              <span className="text-[11px] text-emerald-300/70 ml-2">
                (Reserva: #{reservation.id.slice(0, 8)})
              </span>
            </div>

            {/* Recipient Email Input */}
            <div className="flex items-center gap-1.5 min-w-[240px]">
              <span className="text-[11px] font-semibold text-emerald-300 shrink-0">Para (Email):</span>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-emerald-950/80 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Status Alert Toast */}
          {emailStatus && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                emailStatus.type === 'success'
                  ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                  : 'bg-rose-500/20 border border-rose-400/40 text-rose-200'
              }`}
            >
              {emailStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{emailStatus.message}</span>
            </div>
          )}
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-emerald-900/50 rounded-xl mb-3 shrink-0 border border-emerald-500/20">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
              activeTab === 'email'
                ? 'bg-emerald-500 text-emerald-950 shadow-md'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>✉️ Enviar por Correo Electrónico (Email Oficial)</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
              activeTab === 'whatsapp'
                ? 'bg-[#25D366] text-white shadow-md'
                : 'text-emerald-300 hover:text-white hover:bg-emerald-800/40'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>💬 Mensajes de WhatsApp</span>
          </button>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          {templates.map((tpl, idx) => {
            const Icon = tpl.icon;
            const isCopied = copiedIndex === idx;
            const isSending = sendingIndex === idx;
            const waLink = getWhatsAppUrl(tpl.text);
            const mailtoLink = getMailtoUrl(tpl);

            return (
              <div
                key={tpl.id}
                className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 space-y-2.5 transition-all hover:border-emerald-500/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {tpl.title}
                      </h4>
                      <p className="text-[11px] text-emerald-300/70">{tpl.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Subject Preview for Email */}
                {activeTab === 'email' && (
                  <div className="bg-emerald-950/60 border border-emerald-500/20 rounded-lg px-2.5 py-1 text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <span className="font-bold text-emerald-400">Asunto:</span>
                    <span className="truncate">{tpl.subject}</span>
                  </div>
                )}

                {/* Text Box Preview */}
                <div className="bg-emerald-950/80 border border-emerald-500/20 rounded-xl p-2.5 text-xs text-emerald-200/90 whitespace-pre-line font-sans leading-relaxed max-h-32 overflow-y-auto">
                  {tpl.text}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(tpl.text, idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all min-h-[38px]"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? '¡Copiado!' : 'Copiar'}</span>
                  </button>

                  {/* Primary Action: Send Email */}
                  {activeTab === 'email' ? (
                    <>
                      <a
                        href={mailtoLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/30 text-xs font-semibold transition-all min-h-[38px]"
                        title="Abrir en tu app de correo predeterminada"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir en Mail</span>
                      </a>

                      <button
                        onClick={() => handleSendEmail(tpl, idx)}
                        disabled={isSending}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 min-h-[38px]"
                      >
                        {isSending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>{isSending ? 'Enviando...' : 'Enviar Correo (1 Clic)'}</span>
                      </button>
                    </>
                  ) : (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 min-h-[38px]"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar por WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-emerald-300/60 hidden sm:block">
            Configura tus servidores de envío en <em>Plantillas Email &amp; SMTP</em>.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition-colors min-h-[40px] ml-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

