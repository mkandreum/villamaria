import React, { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';

/** Thin gradient bar at the top showing how far the page has been read. */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-0 inset-x-0 h-[3px] origin-left z-[90] bg-gradient-to-r from-emerald-400 via-teal-300 to-[#C17D5C]"
    />
  );
};

/** Brand curtain shown once per session while the first data loads. */
export const Splash: React.FC<{ ready: boolean }> = ({ ready }) => {
  const reduce = useReducedMotion();
  const [seen] = useState(() => {
    try { return sessionStorage.getItem('vm-splash') === '1'; } catch { return false; }
  });
  const [minTime, setMinTime] = useState(seen || Boolean(reduce));
  useEffect(() => {
    if (minTime) return;
    const t = setTimeout(() => setMinTime(true), 1100);
    return () => clearTimeout(t);
  }, [minTime]);
  const done = ready && minTime;
  useEffect(() => {
    if (done) try { sessionStorage.setItem('vm-splash', '1'); } catch {}
  }, [done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[120] flex flex-col items-center justify-center bg-[#0c1a17] text-white"
          exit={{ clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-400 flex items-center justify-center font-serif text-3xl font-black shadow-[0_0_60px_rgba(52,211,153,0.45)]"
          >
            VM
          </motion.span>
          <motion.p
            initial={{ opacity: 0, y: 14, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '0.35em' }}
            transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 font-serif text-xl uppercase"
          >
            Villa María
          </motion.p>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.9, ease: 'easeInOut' }}
            className="mt-5 h-px w-28 bg-emerald-400/70 origin-left"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Price that rolls smoothly to its new value. */
export const AnimatedPrice: React.FC<{ value: number }> = ({ value }) => {
  const { formatPrice } = useCurrency();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const fromRef = React.useRef(value);
  useEffect(() => {
    if (reduce) { setShown(value); return; }
    const controls = animate(fromRef.current, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => { fromRef.current = v; setShown(Math.round(v)); },
    });
    return () => controls.stop();
  }, [value]);
  return <span className="tabular-nums">{formatPrice(shown)}</span>;
};

/** Splits a title into words that slide up from a mask, one after another. */
export const WordReveal: React.FC<{ text: string; className?: string; delay?: number }> = ({ text, className, delay = 0 }) => {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em] mr-[0.25em]">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', rotate: 4 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ delay: delay + i * 0.11, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
};
