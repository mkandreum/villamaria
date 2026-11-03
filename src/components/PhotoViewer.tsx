import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface ViewerPhoto {
  url: string;
  title?: string;
  caption?: string;
}

interface PhotoViewerProps {
  photos: ViewerPhoto[];
  startIndex: number;
  onClose: () => void;
}

const MAX_ZOOM = 4;

/** One slide: handles pinch, double tap and panning while zoomed. */
const ZoomableSlide: React.FC<{
  photo: ViewerPhoto;
  eager: boolean;
  active: boolean;
  onZoomChange: (zoomed: boolean) => void;
  onToggleChrome: () => void;
  onDismissDrag: (dy: number, end: boolean) => void;
}> = ({ photo, eager, active, onZoomChange, onToggleChrome, onDismissDrag }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const view = useRef({ scale: 1, x: 0, y: 0 });
  const gesture = useRef<{
    mode: 'none' | 'pinch' | 'pan' | 'swipe' | 'dismiss';
    startDist: number;
    startScale: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  }>({ mode: 'none', startDist: 0, startScale: 1, startX: 0, startY: 0, originX: 0, originY: 0, moved: false });
  const lastTap = useRef(0);
  const tapTimer = useRef<number | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  const apply = (animated = false) => {
    const el = imgRef.current;
    if (!el) return;
    const { scale, x, y } = view.current;
    el.style.transition = animated ? 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  const clampPan = () => {
    const el = imgRef.current;
    if (!el) return;
    const { scale } = view.current;
    const maxX = Math.max(0, (el.offsetWidth * scale - window.innerWidth) / 2);
    const maxY = Math.max(0, (el.offsetHeight * scale - window.innerHeight) / 2);
    view.current.x = Math.min(maxX, Math.max(-maxX, view.current.x));
    view.current.y = Math.min(maxY, Math.max(-maxY, view.current.y));
  };

  const setZoom = (scale: number, animated = true) => {
    view.current.scale = scale;
    if (scale <= 1) {
      view.current.x = 0;
      view.current.y = 0;
    } else {
      clampPan();
    }
    apply(animated);
    onZoomChange(scale > 1);
  };

  // Leaving a slide resets its zoom so the next visit starts clean
  useEffect(() => {
    if (!active && view.current.scale !== 1) setZoom(1, false);
  }, [active]);

  const distance = (t: React.TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onTouchStart = (e: React.TouchEvent) => {
    const g = gesture.current;
    g.moved = false;
    if (e.touches.length === 2) {
      g.mode = 'pinch';
      g.startDist = distance(e.touches);
      g.startScale = view.current.scale;
    } else if (e.touches.length === 1) {
      g.mode = view.current.scale > 1 ? 'pan' : 'swipe';
      g.startX = e.touches[0].clientX;
      g.startY = e.touches[0].clientY;
      g.originX = view.current.x;
      g.originY = view.current.y;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const g = gesture.current;
    if (g.mode === 'pinch' && e.touches.length === 2) {
      g.moved = true;
      view.current.scale = Math.min(MAX_ZOOM, Math.max(1, (g.startScale * distance(e.touches)) / g.startDist));
      clampPan();
      apply();
      return;
    }
    if (e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - g.startX;
    const dy = e.touches[0].clientY - g.startY;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) g.moved = true;
    if (g.mode === 'pan') {
      view.current.x = g.originX + dx;
      view.current.y = g.originY + dy;
      clampPan();
      apply();
    } else if (g.mode === 'swipe' && dy > 12 && dy > Math.abs(dx) * 1.4) {
      g.mode = 'dismiss';
    } else if (g.mode === 'dismiss') {
      onDismissDrag(Math.max(0, dy), false);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const g = gesture.current;
    if (g.mode === 'pinch') {
      if (e.touches.length === 0) {
        g.mode = 'none';
        setZoom(view.current.scale < 1.05 ? 1 : view.current.scale);
      }
      return;
    }
    if (g.mode === 'dismiss') {
      onDismissDrag(Math.max(0, e.changedTouches[0].clientY - g.startY), true);
      g.mode = 'none';
      return;
    }
    if (!g.moved) {
      const now = Date.now();
      if (now - lastTap.current < 280) {
        window.clearTimeout(tapTimer.current);
        lastTap.current = 0;
        setZoom(view.current.scale > 1 ? 1 : 2.5);
      } else {
        lastTap.current = now;
        tapTimer.current = window.setTimeout(onToggleChrome, 290);
      }
    }
    g.mode = 'none';
  };

  return (
    <div
      className="relative h-full w-full shrink-0 snap-center snap-always flex items-center justify-center overflow-hidden"
      style={{ touchAction: 'pan-x' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onDoubleClick={() => setZoom(view.current.scale > 1 ? 1 : 2.5)}
    >
      {!loaded && <div className="absolute inset-[12%] rounded-2xl bg-white/5 animate-pulse" aria-hidden />}
      <img
        ref={imgRef}
        src={photo.url}
        alt={photo.title || ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={`max-h-full max-w-full object-contain select-none transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};

export const PhotoViewer: React.FC<PhotoViewerProps> = ({ photos, startIndex, onClose }) => {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [drag, setDrag] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const go = useCallback((i: number, smooth = true) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: smooth ? 'smooth' : 'instant' });
  }, [photos.length]);

  // Open on the tapped photo without an animated run through the others
  useLayoutEffect(() => {
    const el = trackRef.current;
    if (el) el.scrollLeft = startIndex * el.clientWidth;
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIndex(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Keep the current photo in place when the phone rotates
  useEffect(() => {
    const onResize = () => go(index, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [index, go]);

  useEffect(() => {
    const thumb = thumbsRef.current?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, go, onClose]);

  const onDismissDrag = useCallback((dy: number, end: boolean) => {
    if (end) {
      if (dy > 110) onClose();
      else setDrag(0);
    } else {
      setDrag(dy);
    }
  }, [onClose]);

  const toggleChrome = useCallback(() => setChrome((c) => !c), []);
  const current = photos[index];
  const fade = Math.max(0.35, 1 - drag / 420);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Visor de fotos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-[70] flex flex-col text-white overflow-hidden"
      style={{ backgroundColor: `rgba(4, 12, 10, ${fade})` }}
    >
      <div
        className={`absolute top-0 inset-x-0 z-10 flex items-center justify-between px-3 pt-[max(env(safe-area-inset-top),10px)] pb-6 bg-gradient-to-b from-black/60 to-transparent transition-opacity duration-200 ${
          chrome && !drag ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-sm font-semibold tabular-nums" aria-live="polite">
          {index + 1} / {photos.length}
        </span>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Cerrar visor"
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div
        className="flex-1 min-h-0"
        style={{
          transform: drag ? `translate3d(0, ${drag}px, 0) scale(${1 - Math.min(drag, 400) / 2000})` : undefined,
          transition: drag ? 'none' : 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          ref={trackRef}
          className={`no-scrollbar flex h-full w-full snap-x snap-mandatory overscroll-x-contain ${zoomed ? 'overflow-hidden' : 'overflow-x-auto overflow-y-hidden'}`}
        >
          {photos.map((photo, i) => (
            <ZoomableSlide
              key={`${photo.url}-${i}`}
              photo={photo}
              eager={Math.abs(i - startIndex) <= 1 || Math.abs(i - index) <= 1}
              active={i === index}
              onZoomChange={setZoomed}
              onToggleChrome={toggleChrome}
              onDismissDrag={onDismissDrag}
            />
          ))}
        </div>
      </div>

      {index > 0 && !zoomed && (
        <button
          onClick={() => go(index - 1)}
          aria-label="Foto anterior"
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md items-center justify-center transition cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {index < photos.length - 1 && !zoomed && (
        <button
          onClick={() => go(index + 1)}
          aria-label="Foto siguiente"
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-md items-center justify-center transition cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <AnimatePresence initial={false}>
        {chrome && !zoomed && !drag && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent pt-8 pb-[max(env(safe-area-inset-bottom),12px)]"
          >
            {(current?.title || current?.caption) && (
              <div className="px-4 pb-3 text-center">
                {current.title && <p className="font-serif font-bold text-base leading-snug">{current.title}</p>}
                {current.caption && <p className="text-xs text-white/70 mt-0.5">{current.caption}</p>}
              </div>
            )}
            <div ref={thumbsRef} className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 sm:justify-center">
              {photos.map((photo, i) => (
                <button
                  key={`${photo.url}-thumb-${i}`}
                  onClick={() => go(i)}
                  aria-label={`Ir a la foto ${i + 1}`}
                  aria-current={i === index}
                  className={`relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-[opacity,transform] duration-200 cursor-pointer ${
                    i === index ? 'opacity-100 scale-100' : 'opacity-45 scale-90'
                  }`}
                >
                  <img src={photo.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  {i === index && <span className="absolute inset-0 rounded-lg ring-2 ring-inset ring-white" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
