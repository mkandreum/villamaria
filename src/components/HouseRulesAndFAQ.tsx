import React, { useState } from 'react';
import { HOUSE_RULES, FAQS } from '../data/mockData';
import { HelpCircle, ChevronDown, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

export const HouseRulesAndFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openRules, setOpenRules] = useState<boolean>(true);

  return (
    <section id="faq" className="py-10 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative border-b border-[#1B3B36]/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C17D5C]/15 border border-[#C17D5C]/30 text-[#C17D5C] text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Información Útil</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3B36] tracking-tight">
            Preguntas Frecuentes & Normas
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1 font-sans">
            Todo lo que necesitas saber antes de tu llegada a Villa María.
          </p>
        </div>

        <div className="space-y-6 font-sans">
          {/* House Rules Accordion Block */}
          <div className="bg-[#EAE3D8] border border-[#1B3B36]/15 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenRules(!openRules)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-serif text-base sm:text-lg italic text-[#1B3B36] bg-[#EAE3D8]"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#C17D5C]" />
                <span>Normas de la Casa & Convivencia</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-[#1B3B36] transition-transform ${
                  openRules ? 'rotate-180' : ''
                }`}
              />
            </button>

            {openRules && (
              <div className="p-4 sm:p-6 pt-0 border-t border-[#1B3B36]/10 space-y-2.5 text-xs text-[#1B3B36]/80 bg-[#F8F5F0]">
                {HOUSE_RULES.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#C17D5C] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FAQs Accordion */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-serif italic text-[#1B3B36] px-1">Preguntas Frecuentes</h3>
            {FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#1B3B36]/15 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#1B3B36]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#C17D5C] shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-3.5 sm:p-4 pt-0 text-xs text-[#1B3B36]/80 border-t border-[#1B3B36]/10 bg-[#F8F5F0]">
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
