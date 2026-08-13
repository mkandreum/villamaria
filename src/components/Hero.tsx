import React from 'react';
import { Calendar, MapPin, Waves, Zap, ShieldCheck, ArrowRight, Star, Anchor, MessageCircle } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

interface HeroProps {
  checkIn: string;
  checkOut: string;
  guests: number;
  onCheckInChange: (val: string) => void;
  onCheckOutChange: (val: string) => void;
  onGuestsChange: (val: number) => void;
  onSearch: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onSearch,
}) => {
  const waUrl = `https://wa.me/${PROPERTY_INFO.phoneWhatsApp.replace('+', '')}?text=${encodeURIComponent(
    'Hola Villa María, me gustaría consultar información sobre alquiler de la casa en Chichiriviche Calle 15.'
  )}`;

  return (
    <section className="relative pt-20 sm:pt-32 pb-8 sm:pb-20 overflow-hidden bg-[#F8F5F0] border-b border-[#1B3B36]/10">
      {/* Decorative background arch and texture */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#EAE3D8] rounded-l-[120px] opacity-40 pointer-events-none hidden lg:block" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-center">
          
          {/* Headline & Story */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 sm:w-8 h-px bg-[#C17D5C]" />
              <p className="font-sans text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#C17D5C] font-semibold">
                Chichiriviche • Calle 15 (c15)
              </p>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-[#1B3B36] leading-[1.0] sm:leading-[0.95] tracking-tight">
              Tu refugio <br className="hidden sm:inline" />
              <span className="italic font-normal text-[#C17D5C]">frente al mar.</span>
            </h1>

            <p className="font-sans text-xs sm:text-lg text-[#1B3B36]/80 max-w-xl leading-relaxed">
              Casa de playa privada en Chichiriviche (Parque Morrocoy). Con{' '}
              <strong className="text-[#C17D5C] font-semibold">piscina comunitaria</strong>,{' '}
              <strong className="text-[#C17D5C] font-semibold">planta eléctrica y agua 24/7</strong>, a solo 5 min de los embarcaderos a Cayo Sombrero.
            </p>

            {/* Rating Summary & WhatsApp Direct CTA */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 sm:pt-2 font-sans">
              <div className="flex items-center gap-1.5 bg-[#EAE3D8] px-3 py-1.5 rounded-full border border-[#1B3B36]/10 text-xs">
                <Star className="w-3.5 h-3.5 text-[#C17D5C] fill-[#C17D5C]" />
                <span className="font-bold text-[#1B3B36]">4.96</span>
                <span className="text-[10px] text-[#1B3B36]/60">(32 opiniones)</span>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                <span>WhatsApp Anfitrión</span>
              </a>

              <a
                href="#ubicacion"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-[#1B3B36] hover:text-[#C17D5C] py-1.5 px-2 border-b border-[#1B3B36]/20"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C17D5C]" />
                <span>Ubicación C15</span>
              </a>
            </div>
          </div>

          {/* Featured Photo Arch */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              <div className="w-full h-[260px] sm:h-[420px] bg-[#EAE3D8] overflow-hidden rounded-t-[100px] sm:rounded-t-[160px] rounded-b-3xl border border-[#1B3B36]/15 shadow-md relative group">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
                  alt="Villa María Chichiriviche"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1B3B36]/70 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 text-white font-sans">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-[#EAE3D8] block">Sector Calle 15</span>
                  <h3 className="text-base sm:text-xl font-serif italic text-white">Conjunto Privado con Vigilancia</h3>
                </div>
              </div>

              {/* Floating Badge Card */}
              <div className="absolute -bottom-4 -left-2 bg-[#F8F5F0] p-3 rounded-2xl border border-[#1B3B36]/15 shadow-md max-w-[180px] hidden sm:block">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-[#C17D5C]" />
                  <span className="text-[10px] font-sans uppercase tracking-wider font-bold text-[#1B3B36]">Piscina & Caney</span>
                </div>
                <p className="text-[10px] text-[#1B3B36]/70 leading-snug">
                  Áreas recreativas con áreas verdes y estacionamiento.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Availability Form Widget */}
        <div className="mt-8 sm:mt-12 max-w-5xl mx-auto">
          <div className="bg-[#EAE3D8] p-4 sm:p-6 rounded-3xl border border-[#1B3B36]/15 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C17D5C]" />
                <h3 className="font-serif italic text-base sm:text-lg text-[#1B3B36]">
                  Selecciona tus Fechas
                </h3>
              </div>
              <span className="text-[10px] font-sans font-bold bg-[#1B3B36]/10 text-[#1B3B36] px-2.5 py-0.5 rounded-full">
                Desde $120/noche
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-12 gap-2.5 sm:gap-3 items-end font-sans">
              {/* Check-In */}
              <div className="col-span-1 sm:col-span-4 space-y-1 text-left">
                <label className="text-[10px] font-sans uppercase tracking-wider text-[#1B3B36]/70 font-semibold block">
                  Llegada
                </label>
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => onCheckInChange(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-xl px-3 py-2 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C] transition-all font-medium"
                />
              </div>

              {/* Check-Out */}
              <div className="col-span-1 sm:col-span-4 space-y-1 text-left">
                <label className="text-[10px] font-sans uppercase tracking-wider text-[#1B3B36]/70 font-semibold block">
                  Salida
                </label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => onCheckOutChange(e.target.value)}
                  className="w-full bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-xl px-3 py-2 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C] transition-all font-medium"
                />
              </div>

              {/* Guests */}
              <div className="col-span-2 sm:col-span-2 space-y-1 text-left">
                <label className="text-[10px] font-sans uppercase tracking-wider text-[#1B3B36]/70 font-semibold block">
                  Huéspedes
                </label>
                <select
                  value={guests}
                  onChange={(e) => onGuestsChange(Number(e.target.value))}
                  className="w-full bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-xl px-3 py-2 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C] transition-all font-medium"
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i === 0 ? 'persona' : 'personas'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="col-span-2 sm:col-span-2">
                <button
                  onClick={onSearch}
                  className="w-full bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all transform active:scale-95"
                >
                  <span>Ver Disponibilidad</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Strip (Compact 2x2 grid on mobile) */}
        <div className="mt-6 sm:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 max-w-5xl mx-auto font-sans">
          <div className="bg-[#F8F5F0] p-3 sm:p-4 rounded-2xl border border-[#1B3B36]/15 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C17D5C]/15 flex items-center justify-center text-[#C17D5C] shrink-0">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-[#1B3B36] leading-snug">Piscina</h3>
              <p className="text-[10px] text-[#1B3B36]/70 leading-tight">En la urbanización</p>
            </div>
          </div>

          <div className="bg-[#F8F5F0] p-3 sm:p-4 rounded-2xl border border-[#1B3B36]/15 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C17D5C]/15 flex items-center justify-center text-[#C17D5C] shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-[#1B3B36] leading-snug">Planta 24/7</h3>
              <p className="text-[10px] text-[#1B3B36]/70 leading-tight">Luz y agua continuas</p>
            </div>
          </div>

          <div className="bg-[#F8F5F0] p-3 sm:p-4 rounded-2xl border border-[#1B3B36]/15 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C17D5C]/15 flex items-center justify-center text-[#C17D5C] shrink-0">
              <Anchor className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-[#1B3B36] leading-snug">A 5 min Cayos</h3>
              <p className="text-[10px] text-[#1B3B36]/70 leading-tight">Muelle Chichiriviche</p>
            </div>
          </div>

          <div className="bg-[#F8F5F0] p-3 sm:p-4 rounded-2xl border border-[#1B3B36]/15 text-left flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C17D5C]/15 flex items-center justify-center text-[#C17D5C] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[11px] uppercase tracking-wider font-bold text-[#1B3B36] leading-snug">Vigilancia</h3>
              <p className="text-[10px] text-[#1B3B36]/70 leading-tight">Conjunto cerrado C15</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
