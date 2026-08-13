import React, { useState } from 'react';
import { Booking, PricingConfig } from '../types';
import { formatDateSpanish } from '../utils/dateUtils';
import { X, Shield, Lock, Plus, Calendar, DollarSign, Check, Trash2, Edit3, Settings } from 'lucide-react';

interface AdminModalProps {
  bookings: Booking[];
  pricing: PricingConfig;
  onClose: () => void;
  onAddBlockDates: (checkIn: string, checkOut: string, reason: string) => void;
  onDeleteBooking: (id: string) => void;
  onUpdatePricing: (newPricing: PricingConfig) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  bookings,
  pricing,
  onClose,
  onAddBlockDates,
  onDeleteBooking,
  onUpdatePricing,
}) => {
  const [blockCheckIn, setBlockCheckIn] = useState('');
  const [blockCheckOut, setBlockCheckOut] = useState('');
  const [blockReason, setBlockReason] = useState('Uso familiar / Mantenimiento');

  const [baseRate, setBaseRate] = useState(pricing.baseNightlyRate);
  const [weekendRate, setWeekendRate] = useState(pricing.weekendRate);
  const [activeTab, setActiveTab] = useState<'bookings' | 'block' | 'pricing'>('bookings');

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockCheckIn || !blockCheckOut) return;
    onAddBlockDates(blockCheckIn, blockCheckOut, blockReason);
    setBlockCheckIn('');
    setBlockCheckOut('');
    alert('¡Fechas bloqueadas con éxito en el calendario!');
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePricing({
      ...pricing,
      baseNightlyRate: Number(baseRate),
      weekendRate: Number(weekendRate),
    });
    alert('¡Tarifas actualizadas correctamente!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1B3B36]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F8F5F0] border border-[#1B3B36]/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#C17D5C] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1B3B36] text-[#F8F5F0] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#C17D5C]" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#1B3B36]">
              Panel de Administración / Anfitrión
            </h2>
            <p className="text-xs text-[#1B3B36]/70 font-sans">
              Gestión de fechas, bloqueos del propietario y tarifas de Villa María
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1B3B36]/15 gap-2 mb-6 text-xs font-sans">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 font-bold uppercase tracking-wider transition-all px-3 border-b-2 ${
              activeTab === 'bookings'
                ? 'border-[#C17D5C] text-[#C17D5C]'
                : 'border-transparent text-[#1B3B36]/60 hover:text-[#1B3B36]'
            }`}
          >
            Todas las Reservas ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('block')}
            className={`pb-3 font-bold uppercase tracking-wider transition-all px-3 border-b-2 ${
              activeTab === 'block'
                ? 'border-[#C17D5C] text-[#C17D5C]'
                : 'border-transparent text-[#1B3B36]/60 hover:text-[#1B3B36]'
            }`}
          >
            Bloquear Fechas
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`pb-3 font-bold uppercase tracking-wider transition-all px-3 border-b-2 ${
              activeTab === 'pricing'
                ? 'border-[#C17D5C] text-[#C17D5C]'
                : 'border-transparent text-[#1B3B36]/60 hover:text-[#1B3B36]'
            }`}
          >
            Ajustar Tarifas
          </button>
        </div>

        {/* Tab 1: All Bookings List */}
        {activeTab === 'bookings' && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 font-sans">
            {bookings.length === 0 ? (
              <p className="text-center text-xs text-[#1B3B36]/60 py-8">No hay reservas registradas.</p>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-[#1B3B36]/15 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#1B3B36] font-bold bg-[#EAE3D8] px-2 py-0.5 rounded border border-[#1B3B36]/10">
                        {b.id}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          b.status === 'blocked_by_owner'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {b.status === 'blocked_by_owner' ? 'Bloqueo Dueño' : 'Huésped'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-[#1B3B36] mt-1">{b.guestName}</h4>
                    <p className="text-[11px] text-[#1B3B36]/70 mt-0.5">
                      {formatDateSpanish(b.checkIn)} ➔ {formatDateSpanish(b.checkOut)} (${b.totalPrice} USD)
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la reserva ${b.id}?`)) {
                        onDeleteBooking(b.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-[#EAE3D8] hover:bg-rose-100 text-rose-700 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Block Dates */}
        {activeTab === 'block' && (
          <form onSubmit={handleCreateBlock} className="space-y-4 font-sans">
            <p className="text-xs text-[#1B3B36]/80">
              Selecciona las fechas que deseas marcar como <strong>Ocupadas / Bloqueadas</strong> en el calendario para evitar reservas de usuarios.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                  Fecha Inicio (Desde)
                </label>
                <input
                  type="date"
                  required
                  value={blockCheckIn}
                  onChange={(e) => setBlockCheckIn(e.target.value)}
                  className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                  Fecha Fin (Hasta)
                </label>
                <input
                  type="date"
                  required
                  value={blockCheckOut}
                  onChange={(e) => setBlockCheckOut(e.target.value)}
                  className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                Motivo del Bloqueo
              </label>
              <input
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ej. Mantenimiento de piscina, Uso familiar"
                className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Bloquear Fechas en Calendario</span>
            </button>
          </form>
        )}

        {/* Tab 3: Pricing */}
        {activeTab === 'pricing' && (
          <form onSubmit={handleSaveRates} className="space-y-4 font-sans">
            <p className="text-xs text-[#1B3B36]/80">
              Modifica la tarifa nocturna base y de fin de semana para ajustar las cotizaciones automáticas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                  Tarifa Noche Normal (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={baseRate}
                  onChange={(e) => setBaseRate(Number(e.target.value))}
                  className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1B3B36]/70 block mb-1">
                  Tarifa Fin de Semana (Vier-Sáb USD)
                </label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  value={weekendRate}
                  onChange={(e) => setWeekendRate(Number(e.target.value))}
                  className="w-full bg-white border border-[#1B3B36]/15 rounded-xl p-2.5 text-xs text-[#1B3B36] focus:outline-none focus:border-[#C17D5C]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Guardar Nuevas Tarifas</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
