import React, { useState } from 'react';
import { Booking } from '../types';
import { formatDateSpanish } from '../utils/dateUtils';
import { X, BookmarkCheck, Calendar, Users, DollarSign, Search, Trash2, Ticket } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { CheckInVoucherModal, VoucherReservationData } from './CheckInVoucherModal';

interface MyBookingsModalProps {
  bookings: Booking[];
  onClose: () => void;
  onCancelBooking: (id: string) => void;
  propertyAddress?: string;
  mapsUrl?: string;
  wifiSsid?: string;
  wifiPass?: string;
  hostPhone?: string;
}

export const MyBookingsModal: React.FC<MyBookingsModalProps> = ({
  bookings,
  onClose,
  onCancelBooking,
  propertyAddress,
  mapsUrl,
  wifiSsid,
  wifiPass,
  hostPhone,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherReservationData | null>(null);
  const { formatPrice } = useCurrency();

  const userBookings = bookings.filter((b) => b.status !== 'blocked_by_owner');

  const filtered = userBookings.filter(
    (b) =>
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestPhone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#1B3B36]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-8 shadow-2xl relative my-auto max-h-[94vh] flex flex-col font-sans overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#1B3B36] hover:text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 sm:mb-6 flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-full bg-[#1B3B36] text-[#F8F5F0] flex items-center justify-center shrink-0">
            <BookmarkCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-serif text-[#1B3B36] font-bold">
              Mis Reservas en Villa María
            </h2>
            <p className="text-xs text-[#1B3B36]/70 font-sans">
              Consulta o gestiona tus estadías registradas
            </p>
          </div>
        </div>

        {/* Search filter */}
        <div className="relative mb-4 font-sans shrink-0">
          <Search className="w-4 h-4 text-[#1B3B36]/50 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#1B3B36]/15 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#1B3B36] focus:outline-none focus:border-emerald-700 min-h-[44px]"
          />
        </div>

        {/* Bookings List */}
        {filtered.length === 0 ? (
          <div className="p-6 sm:p-8 text-center bg-[#EAE3D8]/50 rounded-2xl border border-dashed border-[#1B3B36]/20 space-y-2 font-sans flex-1 flex flex-col items-center justify-center">
            <BookmarkCheck className="w-8 h-8 text-[#1B3B36]/40 mx-auto" />
            <p className="text-xs font-semibold text-[#1B3B36]">No hay reservas registradas</p>
            <p className="text-[11px] text-[#1B3B36]/60 max-w-xs">
              Usa el calendario principal para seleccionar tus fechas y realizar una reserva.
            </p>
          </div>
        ) : (
          <div className="space-y-3 flex-1 overflow-y-auto pr-1 font-sans">
            {filtered.map((b) => (
              <div
                key={b.id}
                className="bg-white border border-[#1B3B36]/15 rounded-2xl p-3.5 sm:p-4 space-y-2 relative shadow-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#1B3B36] bg-[#EAE3D8] px-2 py-0.5 rounded border border-[#1B3B36]/10">
                      {b.id}
                    </span>
                    <h3 className="text-sm font-bold text-[#1B3B36] mt-1 truncate">{b.guestName}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1B3B36]/80 pt-2 border-t border-[#1B3B36]/10">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">Llegada: {formatDateSpanish((b.checkIn || b.startDate || '') as string)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">Salida: {formatDateSpanish((b.checkOut || b.endDate || '') as string)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1B3B36] shrink-0" />
                    <span>{b.adults || b.guestsCount || 1} huésped(es)</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-[#1B3B36]">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Total: {formatPrice(b.totalPrice)}</span>
                  </div>
                </div>

                {b.status !== 'cancelled' && (
                  <div className="pt-2.5 border-t border-[#1B3B36]/10 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        setSelectedVoucher({
                          id: b.id,
                          guestName: b.guestName,
                          guestEmail: b.guestEmail,
                          guestPhone: b.guestPhone,
                          checkIn: (b.checkIn || b.startDate || '') as string,
                          checkOut: (b.checkOut || b.endDate || '') as string,
                          guestsCount: b.adults || b.guestsCount || 1,
                          totalPrice: b.totalPrice,
                          status: b.status,
                          propertyAddress,
                          mapsUrl,
                          wifiSsid,
                          wifiPass,
                          hostPhone,
                        })
                      }
                      className="text-xs text-emerald-950 font-bold bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all min-h-[36px] cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>🎟️ Pase de Entrada & QR</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de cancelar esta reserva?')) {
                          onCancelBooking(b.id);
                        }
                      }}
                      className="text-xs text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-colors min-h-[36px] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Check-In Voucher Modal */}
      {selectedVoucher && (
        <CheckInVoucherModal
          reservation={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
};
