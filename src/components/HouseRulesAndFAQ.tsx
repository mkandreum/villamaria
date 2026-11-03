import { useSite } from '../context/SiteContext';
import { SectionHeader } from './SectionHeader';
import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Reveal, Stagger, StaggerItem } from './Reveal';
import { EASE_OUT } from './Motion';

interface HouseRulesAndFAQProps {
  rules?: string;
  cancellationPolicy?: string;
  faqs?: any;
  title?: string;
  subtitle?: string;
}

export const HouseRulesAndFAQ: React.FC<HouseRulesAndFAQProps> = ({
  rules,
  cancellationPolicy,
  faqs,
  title,
  subtitle,
}) => {
  const { t, siteName } = useSite();
  const rulesList = React.useMemo(() => String(rules ?? '').split('\n').map((r) => r.trim()).filter(Boolean), [rules]);

  const normalizedFaqs = React.useMemo(() => {
    let list: any = faqs;
    if (typeof faqs === 'string') {
      try {
        list = JSON.parse(faqs);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list)) return [];
    return list.map((f: any) => ({ question: f.question || f.q || '', answer: f.answer || f.a || '' })).filter((f: any) => f.question);
  }, [faqs]);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const policy = String(cancellationPolicy ?? '').trim();

  if (rulesList.length === 0 && !policy && normalizedFaqs.length === 0) return null;

  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#e1dfd8]/40 text-[#1c1c1c] relative font-sans ">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <SectionHeader title={title} subtitle={subtitle} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Rules & Policy (5 cols) */}
          <Reveal className="lg:col-span-5 space-y-4 sm:space-y-6">
            {rulesList.length > 0 && (<div className="bg-[#efeeea] rounded-2xl sm:rounded-3xl p-4 sm:p-6   space-y-3.5 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#1c1c1c] flex items-center gap-2">
                <span>{t('txt_faq_rules')}</span>
              </h3>
              <Stagger gap={0.06} className="space-y-2.5 sm:space-y-3">
                {rulesList.map((r, i) => (
                  <StaggerItem key={i} className="flex items-start gap-2.5 text-xs text-[#1c1c1c]/80 leading-relaxed font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>)}

            {policy && (<div className="bg-[#efeeea] rounded-2xl sm:rounded-3xl p-4 sm:p-6   space-y-2.5 sm:space-y-3">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#1c1c1c] flex items-center gap-2">
                <span>{t('txt_faq_cancel')}</span>
              </h3>
              <p className="text-xs text-[#1c1c1c]/80 leading-relaxed font-sans">
                {policy}
              </p>
            </div>)}
          </Reveal>

          {/* FAQs (7 cols) */}
          {normalizedFaqs.length > 0 && (<Reveal delay={0.12} className="lg:col-span-7 bg-[#efeeea] rounded-2xl sm:rounded-3xl p-4 sm:p-8   space-y-3">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-[#1c1c1c] mb-3 sm:mb-4 flex items-center gap-2">
              <span>{t('txt_faq_faq')}</span>
            </h3>

            <div className="space-y-2.5 sm:space-y-3">
              {normalizedFaqs.map((faq: any, idx: number) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className=" rounded-xl sm:rounded-2xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3.5 sm:p-4 text-left font-serif font-bold text-xs sm:text-sm text-[#1c1c1c] flex items-center justify-between gap-3 bg-[#efeeea]/60 hover:bg-[#efeeea] transition min-h-[48px] cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>{faq.question}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-emerald-800 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: EASE_OUT }}
                          className="overflow-hidden"
                        >
                          <div className="p-3.5 sm:p-4 pt-2 text-xs text-[#1c1c1c]/80 font-sans leading-relaxed  bg-[#efeeea]">{faq.answer}</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>)}
        </div>
      </div>
    </section>
  );
};
