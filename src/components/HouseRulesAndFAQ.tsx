import React, { useState } from 'react';
import { HOUSE_RULES, FAQS } from '../data/mockData';
import { HelpCircle, ChevronDown, FileText, CheckCircle2 } from 'lucide-react';

interface HouseRulesAndFAQProps {
  rules?: string;
  cancellationPolicy?: string;
}

export const HouseRulesAndFAQ: React.FC<HouseRulesAndFAQProps> = ({ rules, cancellationPolicy }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openRules, setOpenRules] = useState<boolean>(true);

  const parsedRules = React.useMemo(() => {
    if (!rules) return HOUSE_RULES;
    return rules
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);
  }, [rules]);

  return (
    <section id="faq" className="py-10 sm:py-20 bg-emerald-950/90 text-emerald-100 relative border-b border-emerald-500/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Información Útil</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
            Preguntas Frecuentes & Normas
          </h2>
          <p className="text-emerald-300/70 text-xs sm:text-sm mt-1 font-sans">
            Información y políticas de la propiedad Villa María.
          </p>
        </div>

        <div className="space-y-6 font-sans">
          {/* House Rules Block */}
          <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl sm:rounded-3xl overflow-hidden shadow-md">
            <button
              onClick={() => setOpenRules(!openRules)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif text-base sm:text-lg italic text-white bg-emerald-900/60"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span>Normas de la Casa & Políticas</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-emerald-300 transition-transform ${openRules ? 'rotate-180' : ''}`}
              />
            </button>

            {openRules && (
              <div className="p-4 sm:p-6 border-t border-emerald-500/20 space-y-3 text-xs text-emerald-200/90 bg-emerald-950">
                {cancellationPolicy && (
                  <div className="p-3 bg-emerald-900/40 border border-emerald-500/30 rounded-xl mb-2">
                    <span className="font-bold text-white block mb-1">Política de Cancelación:</span>
                    <p>{cancellationPolicy}</p>
                  </div>
                )}
                {parsedRules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-serif italic text-white px-1">Preguntas Frecuentes</h3>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-emerald-900/40 border border-emerald-500/20 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-emerald-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-3.5 sm:p-4 pt-0 text-xs text-emerald-300/80 border-t border-emerald-500/10 bg-emerald-950">
                      <p className="leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
