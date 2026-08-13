import React, { useState } from 'react';
import { Booking } from '../types';
import { formatDateSpanish } from '../utils/dateUtils';
import { X, BookmarkCheck, Calendar, Users, DollarSign, Search, Trash2 } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

interface MyBookingsModalProps {
  bookings: Booking[];
  onClose: () => void;
  onCancelBooking: (id: string) => void;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  bookings,
  onClose,
  onCancelBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { formatPrice } = useCurrency();

  const userBookings = bookings.filter((b) => b.status !== 'blocked_by_owner');

  const filtered = userBookings.filter(
    (b) =>
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestPhone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#1B3B36]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1B3B36] text-[#F8F5F0] flex items-center justify-center">
            <BookmarkCheck className="w-5 h-5 text-[#C17D5C]" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#1B3B36]">
              Mis Reservas en Villa María
            </h2>
            <p className="text-xs text-[#1B3B36]/70 font-sans">
              Consulta o gestiona tus estadías registradas
            </p>
          </div>
        </div>

        {/* Search filter */}
        <div className="relative mb-5 font-sans">
          <Search className="w-4 h-4 text-[#1B3B36]/50 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#1B3B36]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
          />
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-[#EAE3D8]/50 rounded-2xl border border-dashed border-[#1B3B36]/20 space-y-2 font-sans">
            <BookmarkCheck className="w-8 h-8 text-[#1B3B36]/40 mx-auto" />
            <p className="text-xs font-semibold text-[#1B3B36]">No hay reservas registradas</p>
            <p className="text-[11px] text-[#1B3B36]/60">
              Usa el calendario principal para seleccionar tus fechas y realizar una reserva.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 font-sans">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-[#1B3B36]/15 rounded-2xl p-4 space-y-2 relative shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#1B3B36] bg-[#EAE3D8] px-2 py-0.5 rounded border border-[#1B3B36]/10">
                      {b.id}
                    </span>
                    <h3 className="text-sm font-bold text-[#1B3B36] mt-1">{b.guestName}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : b.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {b.status === 'confirmed' ? 'Confirmada' : b.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#1B3B36]/80 pt-2 border-t border-[#1B3B36]/10">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C17D5C]" />
                    <span>{formatDateSpanish(b.checkIn)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C17D5C]" />
                    <span>{formatDateSpanish(b.checkOut)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1B3B36]" />
                    <span>{b.adults} adultos, {b.children} niños</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[#1B3B36]">
                  <DollarSign className="w-3.5 h-3.5 text-[#C17D5C]" />
                  <span>{formatPrice(b.totalPrice)}</span>
                </div>
                </div>

                {b.status !== 'cancelled' && (
                  <div className="pt-2 border-t border-[#1B3B36]/10 flex justify-end">
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de cancelar esta reserva?')) {
                          onCancelBooking(b.id);
                        }
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Cancelar Reserva</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
