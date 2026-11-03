import { useSite } from '../context/SiteContext';
import React, { useState, useEffect } from 'react';
import { Calendar, MessageCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { WeatherSeaWidget } from './WeatherSeaWidget';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { EASE_OUT, WordReveal } from './Motion';
import { Stagger, StaggerItem } from './Reveal';
import { iconForText, stripEmoji } from '../utils/icons';

interface HeroProps {
  showWeather?: boolean;
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
  rating?: string;
  reviewsCount?: string;
  priceLabel?: string;
  whatsappGreeting?: string;
}


export const Hero: React.FC<HeroProps> = ({
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onSearch,
  title,
  subtitle,
  description,
  pricePerNight,
  whatsappNumber,
  heroImage,
  images,
  photoBadge,
  feat1,
  feat2,
  feat3,
  feat4,
  rating,
  reviewsCount,
  priceLabel,
  whatsappGreeting,
  showWeather,
}) => {
  const { t, siteName } = useSite();
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
        typeof item === 'string' ? item : item.url || item.imageUrl
      );
    }
    return [];
  }, [images, heroImage]);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [showArrows, setShowArrows] = useState(false);
  const [loadedImgs, setLoadedImgs] = useState<Record<number, boolean>>({});
  const trackRef = React.useRef<HTMLDivElement>(null);
  const interactedAt = React.useRef(0);
  const introBase = 0.25;
  // On desktop this column is on the first screen and waits for the title; on a phone it is reached by scrolling
  const isDesktop = React.useMemo(() => window.matchMedia('(min-width: 1024px)').matches, []);
  const heroRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  // Stays under the 10% vertical overscan of the track, so the edges are never exposed
  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', reduceMotion ? '0%' : '7%']);
  const overlayY = useTransform(scrollYProgress, [0, 0.6], [0, reduceMotion ? 0 : -60]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [1, reduceMotion ? 1 : 0.15]);
  const { formatPrice } = useCurrency();

  const scrollToSlide = (i: number, smooth = true) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'instant' });
  };
  const goTo = (delta: number) => {
    interactedAt.current = Date.now();
    scrollToSlide(Math.max(0, Math.min(photos.length, activePhotoIndex + delta)));
  };

  // Track position drives the dots; a copy of the first photo closes the loop seamlessly
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    let settle: number | undefined;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const i = Math.round(el.scrollLeft / el.clientWidth);
        setActivePhotoIndex(i % photos.length);
      });
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (Math.round(el.scrollLeft / el.clientWidth) >= photos.length) el.scrollTo({ left: 0, behavior: 'instant' });
      }, 140);
    };
    const onTouch = () => { interactedAt.current = Date.now(); };
    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('touchstart', onTouch, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('touchstart', onTouch);
    };
  }, [photos.length]);

  // Autoplay rests while the visitor is handling the photos or looking elsewhere
  useEffect(() => {
    if (reduceMotion || photos.length < 2) return;
    const timer = setInterval(() => {
      const el = trackRef.current;
      if (!el || document.hidden || Date.now() - interactedAt.current < 8000) return;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      scrollToSlide(Math.round(el.scrollLeft / el.clientWidth) + 1);
    }, 5000);
    return () => clearInterval(timer);
  }, [photos.length, reduceMotion]);

  const waDigits = String(whatsappNumber ?? '').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${waDigits}?text=${encodeURIComponent(String(whatsappGreeting ?? ''))}`;
  const features = [feat1, feat2, feat3, feat4].map((f) => stripEmoji(f)).filter(Boolean);
  const badgeText = stripEmoji(photoBadge);
  const hasRating = Boolean(String(rating ?? '').trim() || String(reviewsCount ?? '').trim());

  return (
    <section className="relative pt-0 md:pt-20 lg:pt-28 pb-12 md:pb-20 overflow-hidden bg-[#efeeea] text-[#1c1c1c] font-sans">
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        
        {/* Headline & Title Section */}
        <div className="hidden lg:block max-w-5xl mb-12">
          <h1 className="text-[clamp(54px,6.6vw,108px)] font-serif font-light tracking-[-0.03em] leading-[1.02] text-[#1c1c1c] text-balance">
            <WordReveal text={title} delay={0.1} stagger={0.05} />
          </h1>
          <motion.p initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7, ease: EASE_OUT }} className="mt-6 text-xl text-[#1c1c1c] max-w-[48ch] leading-snug">{stripEmoji(subtitle)}</motion.p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-10 items-center">
          
          {/* PHOTO CAROUSEL "AL AIRE" (Full-width, large, rounded corners, arrows on touch/hover)  */}
          <div className="lg:col-span-7 min-w-0">
            <motion.div
              ref={heroRef}
              initial={reduceMotion ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)', transitionEnd: { clipPath: 'none' } }}
              transition={{ duration: 1.2, ease: EASE_OUT }}
              onMouseEnter={() => setShowArrows(true)}
              onMouseLeave={() => setShowArrows(false)}
              className="relative -mx-3 sm:-mx-6 lg:mx-0 rounded-none overflow-hidden  h-[calc(100svh-7rem)] min-h-[460px] max-h-[720px] lg:h-auto lg:min-h-0 lg:max-h-none lg:aspect-[16/9] group bg-emerald-950 isolate"
            >
              <motion.div
                style={{ y: parallaxY }}
                initial={reduceMotion ? false : { scale: 1.14 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.7, ease: EASE_OUT }}
                className="absolute inset-x-0 -inset-y-[10%] bg-emerald-950"
              >
                <div
                  ref={trackRef}
                  className="no-scrollbar flex h-full w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory overscroll-x-contain"
                  style={{ touchAction: 'pan-x pan-y' }}
                >
                  {[...photos, ...(photos.length > 1 ? [photos[0]] : [])].map((img: string, idx: number) => (
                    <div key={idx} className="relative h-full w-full shrink-0 snap-center snap-always overflow-hidden bg-emerald-950">
                      <img
                        src={img}
                        alt={idx < photos.length ? `${siteName}, foto ${idx + 1}` : ''}
                        loading={idx < 2 ? 'eager' : 'lazy'}
                        decoding="async"
                        draggable={false}
                        {...(idx === 0 ? { fetchPriority: 'high' as const } : {})}
                        onLoad={() => setLoadedImgs((m) => ({ ...m, [idx]: true }))}
                        className={`absolute inset-0 w-full h-full object-cover select-none transition-[opacity,transform] ease-out ${
                          loadedImgs[idx] ? 'opacity-100' : 'opacity-0'
                        } ${idx % photos.length === activePhotoIndex ? 'scale-105 duration-[6000ms]' : 'scale-100 duration-500'}`}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

                            {/* Gradient overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/90 via-emerald-950/20 to-emerald-950/30 lg:from-emerald-950/70 lg:via-transparent lg:to-transparent" />

              {/* Mobile overlay: title, price and primary actions over the photo */}
              <motion.div style={{ y: overlayY, opacity: overlayOpacity }} className="pointer-events-none lg:hidden absolute inset-x-0 bottom-0 z-10 px-5 pb-12 text-white space-y-3">
                <h1 className="text-[clamp(34px,10vw,54px)] font-serif font-light tracking-[-0.02em] leading-[1.05] text-balance"><WordReveal text={title} delay={introBase} /></h1>
                <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: introBase + 0.3, duration: 0.7, ease: EASE_OUT }} className="text-base text-white/90 -mt-1">{stripEmoji(subtitle)}</motion.p>
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: introBase + 0.45, duration: 0.8, ease: EASE_OUT }} className="flex items-end justify-between gap-3 pt-1">
                  <div>
                    <span className="text-[13px] text-emerald-200 font-bold block">{t('txt_from')}</span>
                    <span className="text-2xl font-serif font-bold leading-none">
                      {formatPrice(pricePerNight)} <span className="text-xs font-sans font-normal text-white/80">{t('txt_per_night')}</span>
                    </span>
                  </div>
                  <button
                    onClick={onSearch}
                    className="pointer-events-auto shine px-5 min-h-[48px] rounded-2xl bg-white text-[#1c1c1c] font-bold text-sm flex items-center gap-2  active:scale-95 transition-transform cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />{t('txt_see_dates')}</button>
                </motion.div>
              </motion.div>

              {/* Left/Right Controls - ONLY APPEAR ON TOUCH / HOVER */}
              {showArrows && photos.length > 1 && (
                <>
                  <button
                    onClick={() => goTo(-1)}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center   transition active:scale-90 z-20 cursor-pointer"
                    title="Anterior foto"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => goTo(1)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center   transition active:scale-90 z-20 cursor-pointer"
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
                    onClick={() => { interactedAt.current = Date.now(); scrollToSlide(idx); }}
                    aria-label={`Ver foto ${idx + 1}`}
                    className={`h-2.5 rounded-full transition cursor-pointer ${
                      idx === activePhotoIndex ? 'w-6 bg-emerald-400' : 'w-2.5 bg-white/60 hover:bg-white'
                    }`}
                  />
                ))}
              </div>

              {/* Editable Badge Overlay */}
              {badgeText && (<div className="pointer-events-none absolute top-4 lg:top-3 left-4 lg:left-3 bg-emerald-950/85  border border-emerald-400/30 text-white text-[13px] sm:text-[13px] font-bold px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1  max-w-[80%] truncate"><span className="truncate">{badgeText}</span></div>)}
            </motion.div>
            <p className="lg:hidden px-1 pt-4 text-sm text-[#1c1c1c]/80 leading-relaxed">{description}</p>
          </div>

          {/* Right Column: Rating, WhatsApp CTA & Features */}
          <Stagger delay={isDesktop ? 0.6 : 0.05} gap={0.1} className="lg:col-span-5 space-y-3.5 sm:space-y-4">
            
            {showWeather && <StaggerItem><WeatherSeaWidget /></StaggerItem>}

            <div className="space-y-6 pt-2">
              <StaggerItem className="flex items-end justify-between gap-4">
                <div>
                  {Number(pricePerNight) > 0 && <span className="text-5xl font-serif font-light tracking-tight text-[#1c1c1c]">
                    {formatPrice(pricePerNight)} <span className="text-base font-sans text-[#1c1c1c]/70 tracking-normal">{t('txt_per_night')}</span>
                  </span>}
                  <span className="text-base text-[#1c1c1c]/70 block mt-1">{priceLabel}</span>
                </div>
                {hasRating && (<div className="text-right shrink-0">
                  <div className="flex text-amber-500 justify-end">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-base font-semibold text-[#1c1c1c]">{rating}</span>
                  {String(reviewsCount ?? '').trim() && <span className="text-sm text-[#1c1c1c]/70 block">({reviewsCount} {t('txt_reviews_word')})</span>}
                </div>)}
              </StaggerItem>

              <StaggerItem className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSearch}
                  className="py-3.5 rounded-full bg-[#1c1c1c] text-white hover:bg-emerald-800 font-semibold text-base transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{t('txt_book')}</span>
                </button>
                {waDigits && (<a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 rounded-full bg-emerald-300 hover:bg-emerald-200 text-[#1c1c1c] font-semibold text-base transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer min-h-[52px]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{t('txt_whatsapp')}</span>
                </a>)}
              </StaggerItem>

              <StaggerItem><ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-base text-[#1c1c1c]">
                {features.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 min-w-0">
                    {React.createElement(iconForText(String(item)), { className: 'w-4 h-4 mt-1 text-emerald-700 shrink-0', strokeWidth: 1.75 })}
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul></StaggerItem>
            </div>

          </Stagger>

        </div>
      </div>
    </section>
  );
};
