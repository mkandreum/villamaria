import React, { useState, useEffect } from 'react';
import { Calendar, Users, ShieldCheck, MapPin, Sparkles, MessageCircle, Star, Award, Wifi, Sun, Car, ChevronLeft, ChevronRight, Zap } from 'lucide-react';

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

const DEFAULT_HERO_PHOTOS = [
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
];

export const Hero: React.FC<HeroProps> = ({
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onSearch,
  title = 'Tu refugio frente al mar en Chichiriviche',
  subtitle = 'Alojamiento Turístico & Relax 🌴',
  description = 'Villa María es una elegante finca vacacional totalmente equipada. Disfruta de piscina privada climatizada, servicio de agua constante 24/7, planta eléctrica y cercanía a los cayos de Morrocoy.',
  pricePerNight = 150,
  whatsappNumber = '+34600000000',
  heroImage,
}) => {
  const photos = heroImage ? [heroImage, ...DEFAULT_HERO_PHOTOS.slice(1)] : DEFAULT_HERO_PHOTOS;
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Auto slide photos every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePhotoIndex((prev) => (prev + 1) % photos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [photos.length]);

  const waUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(
    'Hola Villa María 🌴, me gustaría consultar disponibilidad y precios para reservar.'
  )}`;

  return (
    <section className="relative pt-3 md:pt-24 lg:pt-28 pb-10 md:pb-20 overflow-hidden bg-gradient-to-b from-[#F8F5F0] via-[#EAE3D8]/40 to-[#F8F5F0] text-[#1B3B36] font-sans border-b border-[#1B3B36]/10">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* MOBILE ORDER (< lg screens): CAROUSEL FIRST 📸 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Headline & Subtitle */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider">
              <span>✨</span>
              <span>{subtitle}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-[#1B3B36] leading-[1.1] tracking-tight font-bold">
              {title}
            </h1>

            {/* MOBILE AUTO-SLIDING CAROUSEL (Visible first on Mobile!) 📸 */}
            <div className="block lg:hidden my-4">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[16/10] group">
                {photos.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Villa María ${idx + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                      idx === activePhotoIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                    }`}
                  />
                ))}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

                {/* Left/Right Controls */}
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActivePhotoIndex((prev) => (prev + 1) % photos.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Photo Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActivePhotoIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === activePhotoIndex ? 'w-5 bg-emerald-400' : 'w-2 bg-white/60'
                      }`}
                    />
                  ))}
                </div>

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 bg-emerald-950/80 backdrop-blur-md border border-emerald-400/30 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <span>🏊‍♂️</span>
                  <span>Piscina Climatizada</span>
                </div>
              </div>
            </div>

            <p className="font-sans text-xs sm:text-base text-[#1B3B36]/80 max-w-xl leading-relaxed">
              {description}
            </p>

            {/* Rating & WhatsApp CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-white border border-[#1B3B36]/15 rounded-2xl px-3.5 py-2 shadow-sm">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1B3B36]">4.96/5.0</span>
                <span className="text-[10px] text-[#1B3B36]/60 font-medium">(48 reseñas ⭐)</span>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-md active:scale-95 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Consultar por WhatsApp 💬</span>
              </a>
            </div>

            {/* Features Emojis Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {[
                { emoji: '🏊‍♂️', text: 'Piscina Privada' },
                { emoji: '📶', text: 'Fibra 600Mb' },
                { emoji: '⚡', text: 'Luz y Agua 24/7' },
                { emoji: '🚗', text: 'Parking Privado' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 px-3 rounded-2xl bg-white border border-[#1B3B36]/10 text-xs font-semibold text-[#1B3B36] shadow-sm"
                >
                  <span className="text-sm">{item.emoji}</span>
                  <span className="text-[11px] truncate">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DESKTOP CAROUSEL (Visible on >= lg screens) 📸 */}
          <div className="hidden lg:block lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] group">
              {photos.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Villa María ${idx + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                    idx === activePhotoIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent" />

              {/* Photo Dots */}
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                {photos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === activePhotoIndex ? 'w-6 bg-emerald-400' : 'w-2 bg-white/60'
                    }`}
                  />
                ))}
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-emerald-950/90 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                      Tarifa Estándar 🏷️
                    </span>
                    <span className="text-2xl font-serif font-bold text-white">
                      {pricePerNight}€ <span className="text-xs font-sans font-normal text-emerald-200">/ noche</span>
                    </span>
                  </div>
                  <button
                    onClick={onSearch}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold text-xs uppercase tracking-wider hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md active:scale-95"
                  >
                    Reservar Ahora 📅
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
