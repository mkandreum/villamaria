import React, { useEffect, useState } from 'react';
import { animate, motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useCurrency } from '../context/CurrencyContext';

/** Thin gradient bar at the top showing how far the page has been read. */
export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-0 inset-x-0 h-[3px] origin-left z-[90] bg-emerald-400"
    />
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

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const;

/** Splits a title into words that rise from a mask, on load or when scrolled into view. */
export const WordReveal: React.FC<{ text: string; className?: string; delay?: number; inView?: boolean; stagger?: number }> = ({
  text,
  className,
  delay = 0,
  inView = false,
  stagger = 0.04,
}) => {
  const reduce = useReducedMotion();
  const content = String(text ?? '');
  if (reduce) return <span className={className}>{content}</span>;
  const trigger = inView
    ? { whileInView: 'show' as const, viewport: { once: true, margin: '0px 0px -8% 0px' } }
    : { animate: 'show' as const };
  return (
    <motion.span className={className} initial="hidden" {...trigger}>
      <span className="sr-only">{content}</span>
      {content.split(' ').filter(Boolean).map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em] mr-[0.25em] last:mr-0">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: '115%' }, show: { y: 0 } }}
            transition={{ delay: delay + i * stagger, duration: 0.7, ease: EASE_OUT }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
};

/** Opens a picture from its lower edge like a blind while it settles inside the frame. */
export const PhotoReveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className, delay = 0 }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -6% 0px' }}>
      <motion.div
        className="w-full h-full overflow-hidden"
        variants={{ hidden: { clipPath: 'inset(100% 0% 0% 0%)' }, show: { clipPath: 'inset(0% 0% 0% 0%)', transitionEnd: { clipPath: 'none' } } }}
        transition={{ delay, duration: 1.05, ease: EASE_IN_OUT }}
      >
        <motion.div
          className="relative w-full h-full"
          variants={{ hidden: { scale: 1.14 }, show: { scale: 1 } }}
          transition={{ delay, duration: 1.4, ease: EASE_OUT }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
