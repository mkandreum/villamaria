import { useSite } from '../context/SiteContext';
import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface FloatingWhatsAppProps {
  phone?: string;
  availableToday: boolean;
  raised: boolean;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ phone, availableToday, raised }) => {
  const { t, siteName } = useSite();
  const digits = (phone || '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(t('whatsapp_greeting'))}`;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={availableToday ? 'Escribir por WhatsApp: casa disponible hoy' : 'Escribir por WhatsApp'}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, bottom: raised ? 'calc(148px + env(safe-area-inset-bottom))' : 'calc(84px + env(safe-area-inset-bottom))' }}
      transition={{ type: 'spring', stiffness: 360, damping: 28 }}
      className="fixed right-3 md:!bottom-6 md:right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] text-[#1c1c1c] shadow-xl h-12 min-w-12 px-3.5 font-bold text-sm active:scale-95 cursor-pointer"
    >
      <MessageCircle className="w-6 h-6 fill-white shrink-0" />
      {availableToday && (
        <span className="hidden md:flex items-center gap-1.5 pr-1">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />{t('txt_available_today')}</span>
      )}
      {availableToday && <span className="md:hidden absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-300 ring-2 ring-[#25D366]" />}
    </motion.a>
  );
};
