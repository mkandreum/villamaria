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
    <section id="reviews" className="py-10 sm:py-20 bg-emerald-950 text-emerald-100 relative border-b border-emerald-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-sans uppercase tracking-[0.2em] font-bold mb-2">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>4.96 de 5 estrellas</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-white tracking-tight">
            Opiniones de Huéspedes
          </h2>
          <p className="text-emerald-300/70 text-xs sm:text-sm mt-1 font-sans">
            Experiencias reales de familias que han disfrutado de su estancia en Villa María.
          </p>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500 text-emerald-950 text-xs font-bold font-sans uppercase tracking-wider hover:bg-emerald-400 transition-all min-h-[44px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dejar una Opinión</span>
            </button>
          )}
        </div>

        {/* Add Review Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mb-8 bg-emerald-900/60 border border-emerald-500/30 rounded-2xl p-4 sm:p-6 shadow-xl font-sans space-y-3"
          >
            <h3 className="text-sm font-serif italic text-white">Escribe tu experiencia</h3>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Tu Nombre"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-emerald-950 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-100 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Ciudad / Origen"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-emerald-950 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-emerald-300 block mb-1">
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
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-emerald-800'
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
              className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-100 focus:outline-none"
            />

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-500 text-emerald-950 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
              >
                Publicar
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="bg-emerald-900 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider min-h-[44px]"
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
              className="min-w-[260px] sm:min-w-0 w-[82vw] sm:w-auto snap-center bg-emerald-900/40 border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md flex flex-col justify-between shrink-0 sm:shrink"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.avatarUrl}
                      alt={rev.author}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500/30"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{rev.author}</h4>
                      <p className="text-[10px] text-emerald-300/60">{rev.location}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400/50">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-emerald-800'
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs text-emerald-200/90 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-500/10 mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                <UserCheck className="w-3 h-3" />
                <span>Estadía Verificada</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
