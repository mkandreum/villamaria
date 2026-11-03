import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { EASE_OUT, WordReveal } from './Motion';

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

/** Editorial section opener: large serif title on the left, supporting line on the right. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, children }) => {
  const reduce = useReducedMotion();
  return (
  <header className="mb-8 sm:mb-14">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <h2 className="font-serif font-bold text-[#1c1c1c] tracking-tight leading-[1.04] text-balance text-[clamp(2rem,5.5vw,3.75rem)] max-w-[18ch] lg:max-w-[20ch]">
        {typeof title === 'string' ? <WordReveal text={title} inView /> : title}
      </h2>
      {subtitle && (
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ delay: 0.25, duration: 0.7, ease: EASE_OUT }}
          className="text-[#1c1c1c]/70 text-sm sm:text-base leading-relaxed text-pretty max-w-[46ch] lg:pb-2"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
    {children}
  </header>
  );
};
