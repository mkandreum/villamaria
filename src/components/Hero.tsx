import React from 'react';
import { Calendar, Users, ShieldCheck, MapPin, Sparkles, MessageCircle, Star, Award, Wifi, Sun, Car } from 'lucide-react';

interface HeroProps {
  checkIn: string;
  checkOut: string;
  guests: number;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onGuestsChange: (val: number) => void;
  onSearch: () => void;
  title?: string;
  subtitle?: string;
  description?: string;
  pricePerNight?: number;
  whatsappNumber?: string;
  heroImage?: string;
}

export const Hero: React.FC<HeroProps> = ({
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onSearch,
  title = 'Tu refugio frente al mar',
  subtitle = 'Alojamiento Turístico & Relax',
  description = 'Villa María es una elegante propiedad turística totalmente equipada. Disfruta de piscina privada, jardines, aire acondicionado, servicio de agua constante y planta eléctrica 24/7.',
  pricePerNight = 150,
  whatsappNumber = '+34600000000',
  heroImage = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
}) => {
  const waUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(
    'Hola Villa María, me gustaría consultar información sobre reservas.'
  )}`;

  return (
    <section className="relative pt-4 md:pt-28 lg:pt-32 pb-8 md:pb-20 overflow-hidden bg-gradient-to-b from-[#F8F5F0] via-[#EAE3D8]/50 to-[#F8F5F0] text-[#1B3B36] border-b border-[#1B3B36]/10 font-sans">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center">
          {/* Headline & Story */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 sm:w-8 h-px bg-emerald-600" />
              <p className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.25em] text-emerald-800 font-bold">
                {subtitle}
              </p>
            </div>

            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-serif text-[#1B3B36] leading-[1.05] tracking-tight font-bold">
              {title}
            </h1>

            <p className="font-sans text-xs sm:text-base text-[#1B3B36]/80 max-w-xl leading-relaxed">
              {description}
            </p>

            {/* Rating Summary & WhatsApp Direct CTA */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white border border-[#1B3B36]/10 rounded-2xl px-3.5 py-2 shadow-sm">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1B3B36]">4.96/5.0</span>
                <span className="text-[10px] text-[#1B3B36]/60 font-medium">(48 reseñas)</span>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366] text-white hover:bg-[#20bd5a] text-xs font-bold transition-all shadow-md active:scale-95 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>

            {/* Key highlights pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
              {[
                { icon: Sun, text: 'Piscina Privada' },
                { icon: Wifi, text: 'Fibra Óptica 600Mb' },
                { icon: Car, text: 'Parking Privado' },
                { icon: Award, text: 'Luz y Agua 24/7' },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 px-3 rounded-xl bg-white/80 border border-[#1B3B36]/10 text-xs font-semibold text-[#1B3B36] shadow-sm"
                  >
                    <Icon className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span className="text-[11px] truncate">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Image & Quick Reservation Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img
                src={heroImage}
                alt="Villa María"
                className="w-full h-[320px] sm:h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                      Tarifa Estándar
                    </span>
                    <span className="text-2xl font-serif font-bold text-white">
                      {pricePerNight}€ <span className="text-xs font-sans font-normal text-emerald-200">/ noche</span>
                    </span>
                  </div>
                  <button
                    onClick={onSearch}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md active:scale-95"
                  >
                    Reservar Ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
