import React, { useState } from 'react';
import { REVIEWS } from '../data/mockData';
import { Star, Plus, UserCheck } from 'lucide-react';

interface ReviewsSectionProps {
  reviews?: any;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  const normalizedReviews = React.useMemo(() => {
    if (!reviews) return REVIEWS;
    let list = reviews;
    if (typeof reviews === 'string') {
      try {
        list = JSON.parse(reviews);
      } catch {
        list = [];
      }
    }
    if (!Array.isArray(list) || list.length === 0) return REVIEWS;

    return list.map((item, idx) => ({
      id: item.id || `rev-${idx}`,
      author: item.author || 'Huésped',
      location: item.location || 'Huésped verificado',
      date: item.date || 'Reciente',
      rating: Number(item.rating) || 5,
      comment: item.comment || '',
      avatarUrl: item.avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
    }));
  }, [reviews]);

  const [reviewsList, setReviewsList] = useState(normalizedReviews);
  const [isAdding, setIsAdding] = useState(false);
  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  React.useEffect(() => {
    setReviewsList(normalizedReviews);
  }, [normalizedReviews]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !comment) return;

    const newRev = {
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
    <section id="reviews" className="py-12 sm:py-20 bg-[#F8F5F0] text-[#1B3B36] relative font-sans border-b border-[#1B3B36]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 text-xs font-bold font-sans uppercase tracking-wider mb-2">
            <span>⭐ Valoraciones 4.96/5.0</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif text-[#1B3B36] font-bold tracking-tight">
            Opiniones de Huéspedes 💬
          </h2>
          <p className="text-[#1B3B36]/70 text-xs sm:text-sm mt-2">
            Experiencias reales de familias que han disfrutado de su estancia en Villa María.
          </p>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#1B3B36] text-white hover:bg-emerald-900 text-xs font-bold font-sans uppercase tracking-wider transition-all min-h-[44px] shadow-md"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Dejar una Opinión ✍️</span>
            </button>
          )}
        </div>

        {/* Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mb-8 bg-white border border-[#1B3B36]/15 rounded-3xl p-6 shadow-xl font-sans space-y-4"
          >
            <h3 className="text-base font-serif font-bold text-[#1B3B36]">Escribe tu experiencia ✍️</h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tu Nombre"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Ciudad / Origen"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none"
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
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
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
              className="w-full bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#1B3B36] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
              >
                Publicar Reseña
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-[#EAE3D8] text-[#1B3B36] px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Reviews Cards */}
        <div className="flex sm:grid sm:grid-cols-3 gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none no-scrollbar font-sans">
          {reviewsList.map((rev: any) => (
            <div
              key={rev.id}
              className="min-w-[270px] sm:min-w-0 w-[84vw] sm:w-auto snap-center bg-white border border-[#1B3B36]/10 rounded-3xl p-6 shadow-md flex flex-col justify-between shrink-0 sm:shrink"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.avatarUrl}
                      alt={rev.author}
                      className="w-9 h-9 rounded-full object-cover border border-[#1B3B36]/20"
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
                        i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-[#1B3B36]/80 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#1B3B36]/10 mt-3 flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Estadía Verificada 🏡</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
