import React, { useState } from 'react';
import { HOUSE_RULES, FAQS, PROPERTY_INFO } from '../data/mockData';
import { ShieldCheck, HelpCircle, ChevronDown, ChevronUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface HouseRulesAndFAQProps {
  rules?: string;
  cancellationPolicy?: string;
  faqs?: any;
}

export const HouseRulesAndFAQ: React.FC<HouseRulesAndFAQProps> = ({
  rules,
  cancellationPolicy = PROPERTY_INFO?.cancellationPolicy || 'Cancelación gratuita hasta 7 días antes de la llegada. Reembolso completo del depósito.',
  faqs,
}) => {
  const rulesList = React.useMemo(() => {
    if (!rules) return HOUSE_RULES;
    if (typeof rules === 'string') {
      return rules.split('\n').filter(Boolean);
    }
    return HOUSE_RULES;
  }, [rules]);

  const normalizedFaqs = React.useMemo(() => {
    if (!faqs) return FAQS;
    let list = faqs;
    if (typeof faqs === 'string') {
      try {
        list = JSON.parse(faqs);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list) || list.length === 0) return FAQS;
    return list;
  }, [faqs]);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 sm:py-20 bg-[#EAE3D8]/40 text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>📋 Normas & FAQs</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            Información & Preguntas 💡
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-2">
            Todo lo que necesitas saber para una estancia tranquila y sin sorpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Rules & Policy (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#1B3B36]/10 shadow-md space-y-4">
              <h3 className="text-lg font-serif font-bold text-[#1B3B36] flex items-center gap-2">
                <span>🔑 Normas de la Casa</span>
              </h3>
              <ul className="space-y-3">
                {rulesList.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#1B3B36]/80 leading-relaxed font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-[#1B3B36]/10 shadow-md space-y-3">
              <h3 className="text-base font-serif font-bold text-[#1B3B36] flex items-center gap-2">
                <span>🛡️ Política de Cancelación</span>
              </h3>
              <p className="text-xs text-[#1B3B36]/80 leading-relaxed font-sans">
                {cancellationPolicy}
              </p>
            </div>
          </div>

          {/* FAQs (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#1B3B36]/10 shadow-md space-y-3">
            <h3 className="text-xl font-serif font-bold text-[#1B3B36] mb-4 flex items-center gap-2">
              <span>❓ Preguntas Frecuentes</span>
            </h3>

            <div className="space-y-3">
              {normalizedFaqs.map((faq: any, idx: number) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-[#1B3B36]/10 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left font-serif font-bold text-xs sm:text-sm text-[#1B3B36] flex items-center justify-between gap-3 bg-[#F8F5F0]/60 hover:bg-[#F8F5F0] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>💡</span>
                        <span>{faq.question}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-emerald-800 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-emerald-800 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4 pt-2 text-xs text-[#1B3B36]/80 font-sans leading-relaxed border-t border-[#1B3B36]/10 bg-white">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
