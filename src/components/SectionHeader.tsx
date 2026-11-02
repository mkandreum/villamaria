import React from 'react';

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
}

/** Editorial section opener: large serif title on the left, supporting line on the right. */
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, children }) => (
  <header className="mb-8 sm:mb-14">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
      <h2 className="font-serif font-bold text-[#1B3B36] tracking-tight leading-[1.04] text-balance text-[clamp(2rem,5.5vw,3.75rem)] max-w-[18ch] lg:max-w-[20ch]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#1B3B36]/70 text-sm sm:text-base leading-relaxed text-pretty max-w-[46ch] lg:pb-2">{subtitle}</p>
      )}
    </div>
    {children}
  </header>
);
