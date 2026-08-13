import React, { useState } from 'react';
import { REVIEWS } from '../data/mockData';
import { Review } from '../types';
import { Star, MessageSquare, Plus, CheckCircle2, UserCheck } from 'lucide-react';

export const ReviewsSection: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<Review[]>(REVIEWS);
  const [isAdding, setIsAdding] = useState(false);
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !comment) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author,
      location: location || 'Huésped registrado',
      date: 'Reciente',
      rating,
      comment,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
    };

    setReviewsList([newRev, ...reviewsList]);
    setIsAdding(false);
    setAuthor('');
    setLocation('');
    setComment('');
  };

  return (
    <section id="opiniones" className="py-10 sm:py-20 bg-[#EAE3D8] text-[#1B3B36] relative border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B3B36]/10 border border-[#1B3B36]/20 text-[#1B3B36] text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <Star className="w-3.5 h-3.5 text-[#C17D5C] fill-[#C17D5C]" />
            <span>4.96 de 5 estrellas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-[#1B3B36] tracking-tight">
            Opiniones de Huéspedes
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-1 font-sans">
            Experiencias reales de familias que han disfrutado de sus vacaciones en Villa María.
          </p>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1B3B36] text-[#F8F5F0] text-xs font-bold font-sans uppercase tracking-wider hover:bg-[#C17D5C] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dejar una Opinión</span>
            </button>
          )}
        </div>

        {/* Add Review Drawer Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mb-8 bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-2xl p-4 sm:p-6 shadow-md font-sans space-y-3"
          >
            <h3 className="text-sm font-serif italic text-[#1B3B36]">Escribe tu experiencia</h3>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tu Nombre"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
              />
              <input
                type="text"
                placeholder="Ciudad / Origen"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[#1B3B36]/70 block mb-1">
                Calificación
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating
                          ? 'text-[#C17D5C] fill-[#C17D5C]'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              required
              placeholder="¿Qué tal tu estancia en Villa María?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#1B3B36] text-[#F8F5F0] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Publicar
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-[#EAE3D8] text-[#1B3B36] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Mobile Horizontal Scroll-Snap / Desktop Grid */}
        <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none no-scrollbar font-sans">
          {reviewsList.map((rev) => (
            <div
              key={rev.id}
              className="min-w-[260px] sm:min-w-0 w-[82vw] sm:w-auto snap-center bg-[#F8F5F0] border border-[#1B3B36]/15 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col justify-between shrink-0 sm:shrink"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.avatarUrl}
                      alt={rev.author}
                      className="w-8 h-8 rounded-full object-cover border border-[#1B3B36]/20"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#1B3B36]">{rev.author}</h4>
                      <p className="text-[10px] text-[#1B3B36]/60">{rev.location}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#1B3B36]/50">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating
                          ? 'text-[#C17D5C] fill-[#C17D5C]'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-[#1B3B36]/80 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#1B3B36]/10 mt-3 flex items-center gap-1.5 text-[10px] text-[#C17D5C] font-semibold uppercase tracking-wider">
                <UserCheck className="w-3 h-3" />
                <span>Estadía Verificada</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-center text-[#1B3B36]/50 sm:hidden font-sans mt-1">
          ← Desliza para leer más testimonios →
        </p>
      </div>
    </section>
  );
};
