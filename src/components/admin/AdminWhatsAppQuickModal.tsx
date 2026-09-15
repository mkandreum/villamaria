import React, { useState } from 'react';
import { X, MessageCircle, Send, Copy, Check, Sparkles, MapPin, Wifi, Star, DollarSign } from 'lucide-react';

export interface QuickMessageReservation {
  id: string;
  guestName: string;
  guestPhone: string;
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
      title: '📍 1. Bienvenida & Ubicación GPS (24h antes)',
      description: 'Envía los datos de llegada, enlace de Google Maps y hora de entrada.',
      icon: MapPin,
      color: 'border-emerald-500/40 text-emerald-300',
      text: `¡Hola ${reservation.guestName}! 🌴 Te saludamos desde Villa María (Chichiriviche). Estamos listos para recibirte para tu estancia del ${startFormatted} al ${endFormatted}.

📍 Dirección: ${propertyAddress}
🗺️ GPS Google Maps: ${mapsUrl}
🕒 Hora de Check-in: A partir de las 3:00 PM.
🎟️ Código de Reserva: ${reservation.id.slice(0, 8)}

El personal de la garita de seguridad de la Calle 15 tiene tu nombre registrado para el acceso vehicular directo. ¡Buen viaje y te esperamos!`,
    },
    {
      id: 'wifi_rules',
      title: '📶 2. Clave Wi-Fi & Servicios de la Casa',
      description: 'Credenciales de Wi-Fi de alta velocidad, piscina y planta eléctrica.',
      icon: Wifi,
      color: 'border-teal-500/40 text-teal-300',
      text: `¡Hola ${reservation.guestName}! Esperamos que estés disfrutando de tu estadía en Villa María 🌴. Te recordamos los accesos y comodidades de la casa:

📶 Red Wi-Fi: ${wifiSsid}
🔑 Contraseña: ${wifiPass}
🏊‍♂️ Piscina: Climatizada de 8:00 AM a 10:00 PM
⚡ Planta eléctrica 24/7 y tanque de agua de 10.000L operativos

Cualquier consulta o necesidad durante tu estancia, estamos a tu completa disposición por este número. ¡Feliz descanso!`,
    },
    {
      id: 'checkout',
      title: '⭐ 3. Check-out & Agradecimiento con Reseña',
      description: 'Horario de salida, entrega de llaves y enlace para dejar opinión.',
      icon: Star,
      color: 'border-amber-500/40 text-amber-300',
      text: `¡Hola ${reservation.guestName}! 🌴 Muchas gracias por elegir Villa María para tus vacaciones en Morrocoy.

🕒 Recordatorio de Check-out: Hoy hasta las 12:00 PM. Por favor entregar las llaves al encargado de la casa.
⭐ Tu opinión es muy importante para nosotros: ¿Podrías dejarnos una breve reseña en nuestra página web?

¡Esperamos tener el gusto de recibirte nuevamente muy pronto!`,
    },
    {
      id: 'payment_reminder',
      title: '💰 4. Confirmación de Pago & Verificación',
      description: 'Para reservas pendientes que requieren comprobante de pago.',
      icon: DollarSign,
      color: 'border-purple-500/40 text-purple-300',
      text: `¡Hola ${reservation.guestName}! Te escribimos del equipo de Villa María para confirmar los datos de tu solicitud de reserva #${reservation.id.slice(0, 8)} del ${startFormatted} al ${endFormatted}.

💰 Monto Total: $${reservation.totalPrice || 0} USD
Por favor envíanos por aquí tu comprobante de transferencia (Zelle / Pago Móvil / Efectivo) para activar tu código de acceso oficial. ¡Muchas gracias!`,
    },
  ];

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getWhatsAppUrl = (text: string) => {
    const encoded = encodeURIComponent(text);
    return cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-emerald-950 border border-emerald-500/30 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-3 text-emerald-100 font-sans max-h-[92vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors z-10 min-w-[36px] min-h-[36px] flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 pr-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold">
              <MessageCircle className="w-4 h-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
              Mensajes Predefinidos de WhatsApp
            </h3>
          </div>
          <p className="text-xs text-emerald-300/70">
            Huésped: <strong className="text-white">{reservation.guestName}</strong> ({reservation.guestPhone || 'Sin teléfono'})
          </p>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
          {templates.map((tpl, idx) => {
            const Icon = tpl.icon;
            const isCopied = copiedIndex === idx;
            const waLink = getWhatsAppUrl(tpl.text);

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
                      <p className="text-[11px] text-emerald-300/70">{tpl.description}</p>
                    </div>
                  </div>
                </div>

                {/* Text Box Preview */}
                <div className="bg-emerald-950/80 border border-emerald-500/20 rounded-xl p-2.5 text-xs text-emerald-200/90 whitespace-pre-line font-sans leading-relaxed max-h-36 overflow-y-auto">
                  {tpl.text}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(tpl.text, idx)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all min-h-[38px]"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? '¡Copiado!' : 'Copiar Texto'}</span>
                  </button>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95 min-h-[38px]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar por WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-emerald-500/20 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-900/50 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition-colors min-h-[40px]"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
