import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { WeatherSeaWidget } from './WeatherSeaWidget';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { WordReveal } from './Motion';
import { iconForText, stripEmoji } from '../utils/icons';

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
  images?: any;
  photoBadge?: string;
  feat1?: string;
  feat2?: string;
  feat3?: string;
  feat4?: string;
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
  title = 'Villa María',
  subtitle = 'Tu refugio exclusivo en Chichiriviche',
  description = 'Villa María es una elegante finca vacacional totalmente equipada. Disfruta de piscina privada climatizada, servicio de agua constante 24/7, planta eléctrica y cercanía a los cayos de Morrocoy.',
  pricePerNight = 150,
  whatsappNumber = '+34600000000',
  heroImage,
  images,
  photoBadge = ' Piscina Climatizada',
  feat1 = ' Piscina Privada',
  feat2 = ' Fibra 600Mb',
  feat3 = ' Luz y Agua 24/7',
  feat4 = ' Parking Privado',
}) => {
  const photos = React.useMemo(() => {
    let list = images;
    if (typeof images === 'string') {
      try {
        list = JSON.parse(images);
      } catch {
        list = [];
      }
    }
    if (Array.isArray(list) && list.length > 0) {
      return list.map((item: any) =>
        typeof item === 'string' ? item : item.url || item.imageUrl || DEFAULT_HERO_PHOTOS[0]
      );
    }
    if (heroImage) {
      return [heroImage, ...DEFAULT_HERO_PHOTOS.slice(1)];
    }
    return DEFAULT_HERO_PHOTOS;
  }, [images, heroImage]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const introBase = React.useMemo(() => { try { return sessionStorage.getItem('vm-splash') === '1' ? 0.1 : 1.15; } catch { return 0.1; } }, []);
  const heroRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '18%']);
  const overlayY = useTransform(scrollYProgress, [0, 0.6], [0, reduceMotion ? 0 : -60]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [1, reduceMotion ? 1 : 0.15]);
  const [loadedImgs, setLoadedImgs] = useState<Record<number, boolean>>({});
  const touchStartX = React.useRef<number | null>(null);
  const goTo = (delta: number) => setActivePhotoIndex((prev) => (prev + delta + photos.length) % photos.length);
  const { formatPrice } = useCurrency();

  // Auto slide photos every 4 seconds
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || photos.length < 2) return;
    const timer = setInterval(() => {
      if (!document.hidden) setActivePhotoIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length]);

  const waUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(
    'Hola Villa María , me gustaría consultar disponibilidad y precios para reservar.'
  )}`;

  return (
    <section className="relative pt-0 md:pt-20 lg:pt-24 pb-12 md:pb-16 overflow-hidden bg-gradient-to-b from-[#F8F5F0] via-[#EAE3D8]/40 to-[#F8F5F0] text-[#1B3B36] font-sans border-b border-[#1B3B36]/10">
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        
        {/* Headline & Title Section */}
        <div className="hidden lg:block text-center lg:text-left max-w-4xl mx-auto lg:mx-0 space-y-2 mb-4">

          {/* Centered Large Professional Title - Super Big on Mobile */}
          <h1 className="text-5xl xs:text-6xl sm:text-6xl md:text-7xl lg:text-8xl font-serif text-[#1B3B36] font-black tracking-tighter text-center lg:text-left leading-[1.05] sm:leading-none pt-1 sm:pt-2 pb-1 break-words">
            {title}
          </h1>
          <p className="font-serif italic text-xl lg:text-2xl text-emerald-900 pt-1">{stripEmoji(subtitle)}</p>

          <p className="text-xs sm:text-sm md:text-base text-[#1B3B36]/80 max-w-2xl text-center lg:text-left pt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
          
          {/* PHOTO CAROUSEL "AL AIRE" (Full-width, large, rounded corners, arrows on touch/hover)  */}
          <div className="lg:col-span-7">
            <div
              ref={heroRef}
              onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                if (touchStartX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchStartX.current;
                touchStartX.current = null;
                if (Math.abs(dx) > 40) goTo(dx < 0 ? 1 : -1);
              }}
              onMouseEnter={() => setShowArrows(true)}
              onMouseLeave={() => setShowArrows(false)}
              className="relative -mx-3 sm:-mx-6 lg:mx-0 rounded-none lg:rounded-3xl overflow-hidden shadow-2xl h-[calc(100svh-7rem)] min-h-[460px] max-h-[720px] lg:h-auto lg:max-h-none lg:aspect-[16/9] group bg-emerald-950 touch-pan-y"
            >
              <motion.div style={{ y: parallaxY }} className="absolute -inset-[10%] lg:inset-0">
              {photos.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Villa María ${idx + 1}`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  {...(idx === 0 ? { fetchPriority: 'high' as const } : {})}
                  onLoad={() => setLoadedImgs((m) => ({ ...m, [idx]: true }))}
                  className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-[1400ms] ease-out ${
                    idx === activePhotoIndex && loadedImgs[idx] ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                  }`}
                />
              ))}
              </motion.div>
              
              {!loadedImgs[activePhotoIndex] && <div className="absolute inset-0 shimmer-badge" aria-hidden />}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-emerald-950/30 lg:from-emerald-950/70 lg:via-transparent lg:to-transparent" />

              {/* Mobile overlay: title, price and primary actions over the photo */}
              <motion.div style={{ y: overlayY, opacity: overlayOpacity }} className="lg:hidden absolute inset-x-0 bottom-0 z-10 px-5 pb-12 text-white space-y-3">
                <h1 className="text-5xl font-serif font-black tracking-tight leading-[1.02] drop-shadow-lg break-words"><WordReveal text={title} delay={introBase + 0.1} /></h1>
                <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: introBase + 0.4, duration: 0.7 }} className="font-serif italic text-lg text-emerald-100/95 -mt-1">{stripEmoji(subtitle)}</motion.p>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: introBase + 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="flex items-end justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-emerald-200 font-bold block">Desde</span>
                    <span className="text-2xl font-serif font-bold leading-none">
                      {formatPrice(pricePerNight)} <span className="text-xs font-sans font-normal text-white/80">/ noche</span>
                    </span>
                  </div>
                  <button
                    onClick={onSearch}
                    className="shine cta-pulse px-5 min-h-[48px] rounded-2xl bg-white text-[#1B3B36] font-bold text-sm flex items-center gap-2 shadow-xl active:scale-95 transition-transform cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" /> Ver fechas
                  </button>
                </motion.div>
              </motion.div>

              {/* Left/Right Controls - ONLY APPEAR ON TOUCH / HOVER */}
              {showArrows && photos.length > 1 && (
                <>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-90 z-20 cursor-pointer"
                    title="Anterior foto"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActivePhotoIndex((prev) => (prev + 1) % photos.length)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-all active:scale-90 z-20 cursor-pointer"
                    title="Siguiente foto"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Photo Dots */}
              <div className="absolute bottom-4 lg:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 p-1">
                {photos.map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    aria-label={`Ver foto ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === activePhotoIndex ? 'w-6 bg-emerald-400' : 'w-2.5 bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>

              {/* Editable Badge Overlay */}
              <div className="absolute top-4 lg:top-3 left-4 lg:left-3 bg-emerald-950/85 backdrop-blur-md border border-emerald-400/30 text-white text-[11px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1 shadow-md max-w-[80%] truncate">
                <span className="truncate">{stripEmoji(String(photoBadge))}</span>
              </div>
            </div>
            <p className="lg:hidden px-1 pt-4 text-sm text-[#1B3B36]/80 leading-relaxed">{description}</p>
          </div>

          {/* Right Column: Rating, WhatsApp CTA & Features */}
          <div className="lg:col-span-5 space-y-3.5 sm:space-y-4">
            
            {/* Live Weather & Sea Condition Widget */}
            <WeatherSeaWidget />

            {/* Price & Rating Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#1B3B36]/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider block">
                    Tarifa Estándar
                  </span>
                  <span className="text-xl sm:text-3xl font-serif font-bold text-[#1B3B36]">
                    {formatPrice(pricePerNight)} <span className="text-xs font-sans font-normal text-[#1B3B36]/70">/ noche</span>
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex text-amber-500 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-[#1B3B36]">4.96/5.0</span>
                  <span className="text-[11px] text-[#1B3B36]/60 block">(48 reseñas)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={onSearch}
                  className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#1B3B36] text-white hover:bg-emerald-900 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Reservar</span>
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl sm:rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Editable Features Emojis Grid */}
            <div className="grid grid-cols-2 gap-2">
              {[feat1, feat2, feat3, feat4].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 px-3 rounded-xl sm:rounded-2xl bg-white border border-[#1B3B36]/10 text-xs font-semibold text-[#1B3B36] shadow-sm min-h-[42px]"
                >
                  {React.createElement(iconForText(String(item)), { className: 'w-4 h-4 text-emerald-700 shrink-0', strokeWidth: 1.75 })}
                  <span className="text-xs truncate">{stripEmoji(String(item))}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
