import React from 'react';
import { Calendar, MapPin, Waves, Zap, ShieldCheck, ArrowRight, Star, Anchor, MessageCircle } from 'lucide-react';

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
  subtitle = 'Casa de campo & relax',
  description = 'Villa María es una elegante finca rústica equipada con todas las comodidades modernas. Disfruta de amplios jardines, piscina privada, zona de barbacoa y espacios luminosos diseñados para el descanso perfecto.',
  pricePerNight = 150,
  whatsappNumber = '+34600000000',
  heroImage = 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
}) => {
  const waUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(
    'Hola Villa María, me gustaría consultar información sobre reservas.'
  )}`;

  return (
    <section className="relative pt-20 sm:pt-32 pb-8 sm:pb-20 overflow-hidden bg-emerald-950/90 text-emerald-100 border-b border-emerald-500/20">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center">
          {/* Headline & Story */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 sm:w-8 h-px bg-emerald-400" />
              <p className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.25em] text-emerald-400 font-semibold">
                {subtitle}
              </p>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-white leading-[1.0] sm:leading-[0.95] tracking-tight">
              {title}
            </h1>

            <p className="font-sans text-xs sm:text-lg text-emerald-200/80 max-w-xl leading-relaxed">
              {description}
            </p>

            {/* Rating Summary & WhatsApp Direct CTA */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 sm:pt-2 font-sans">
              <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-200">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-white">4.96</span>
                <span className="text-[10px] text-emerald-300/70">(Valoraciones verificadas)</span>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-[#20bd5a] transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Anfitrión</span>
              </a>

              <a
                href="#location"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-emerald-300 hover:text-emerald-100 py-1.5 px-2 border-b border-emerald-500/30"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ver Ubicación</span>
              </a>
            </div>
          </div>

          {/* Featured Photo Arch */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="w-full h-[260px] sm:h-[420px] bg-emerald-900/40 overflow-hidden rounded-t-[100px] sm:rounded-t-[160px] rounded-b-3xl border border-emerald-500/30 shadow-xl relative group">
                <img
                  src={heroImage}
                  alt={title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white font-sans">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300 block">Villa María</span>
                  <h3 className="text-base sm:text-xl font-serif italic text-white">{title}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Availability Form Widget */}
        <div className="mt-8 sm:mt-12 max-w-5xl mx-auto">
          <div className="bg-emerald-900/60 backdrop-blur-md p-4 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <h3 className="font-serif italic text-base sm:text-lg text-white">
                  Selecciona tus Fechas
                </h3>
              </div>
              <span className="text-[10px] font-sans font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                Desde {pricePerNight}€/noche
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 sm:gap-3 items-end font-sans">
              {/* Check-In */}
              <div className="col-span-1 sm:col-span-4 space-y-1 text-left">
                <label className="text-[10px] font-sans uppercase tracking-wider text-emerald-300/80 font-semibold block">
                  Entrada
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => onCheckInChange(e.target.value)}
                  className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              {/* Check-Out */}
              <div className="col-span-1 sm:col-span-4 space-y-1 text-left">
                <label className="text-[10px] font-sans uppercase tracking-wider text-emerald-300/80 font-semibold block">
                  Salida
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => onCheckOutChange(e.target.value)}
                  className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400 font-medium"
                />
              </div>

              {/* Guests */}
              <div className="col-span-2 sm:col-span-2 space-y-1 text-left">
                <label className="text-[10px] font-sans uppercase tracking-wider text-emerald-300/80 font-semibold block">
                  Huéspedes
                </label>
                <select
                  value={guests}
                  onChange={(e) => onGuestsChange(Number(e.target.value))}
                  className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400 font-medium"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1} className="bg-emerald-950 text-emerald-100">
                      {i + 1} {i === 0 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="col-span-2 sm:col-span-2">
                <button
                  onClick={onSearch}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-emerald-950 font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 min-h-[44px]"
                >
                  <span>Ver Disponibilidad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Strip */}
        <div className="mt-6 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-5xl mx-auto font-sans">
          <div className="bg-emerald-900/40 p-3 sm:p-4 rounded-2xl border border-emerald-500/20 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-white leading-snug">Piscina Privada</h3>
              <p className="text-[10px] text-emerald-300/70 leading-tight">Jardín y solárium</p>
            </div>
          </div>

          <div className="bg-emerald-900/40 p-3 sm:p-4 rounded-2xl border border-emerald-500/20 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-white leading-snug">Wi-Fi & Clima</h3>
              <p className="text-[10px] text-emerald-300/70 leading-tight">Fibra óptica y A/C</p>
            </div>
          </div>

          <div className="bg-emerald-900/40 p-3 sm:p-4 rounded-2xl border border-emerald-500/20 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-white leading-snug">Entorno Natural</h3>
              <p className="text-[10px] text-emerald-300/70 leading-tight">Vistas panorámicas</p>
            </div>
          </div>

          <div className="bg-emerald-900/40 p-3 sm:p-4 rounded-2xl border border-emerald-500/20 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-white leading-snug">Parking Privado</h3>
              <p className="text-[10px] text-emerald-300/70 leading-tight">Recinto cerrado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
