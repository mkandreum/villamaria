import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Calendar as CalendarIcon,
  CalendarRange,
  DollarSign,
  Users,
  Settings,
  Lock,
  Mail,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Edit3,
  Send,
  Plus,
  Image as ImageIcon,
  Star,
  Eye,
  EyeOff,
} from 'lucide-react';
import { api } from '../api';
import { SmtpSettingsSection } from './admin/SmtpSettingsSection';

interface AdminModalProps {
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ onClose, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reservations' | 'property' | 'blocked' | 'templates' | 'smtp' | 'reviews'>('dashboard');

  // Data states
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [propertySettings, setPropertySettings] = useState<any>({});
  const [adminReviews, setAdminReviews] = useState<any[]>([]);

  // Form states
  const [newBlock, setNewBlock] = useState({ startDate: '', endDate: '', reason: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [manualEmail, setManualEmail] = useState({ to: '', subject: '', bodyHtml: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reschedule state: which reservation is open for rescheduling
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newStartDate: '',
    newEndDate: '',
    additionalCost: false,
    additionalCostAmount: 0,
  });
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, resRes, usersRes, blockRes, tplRes, propRes, revRes] = await Promise.all([
        api.getDashboardMetrics().catch(() => ({ metrics: null })),
        api.getAdminReservations().catch(() => ({ reservations: [] })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getBlockedDates().catch(() => ({ blockedDates: [] })),
        api.getEmailTemplates().catch(() => ({ templates: [] })),
        api.getPropertySettings().catch(() => ({ settings: {} })),
        api.getAdminReviews().catch(() => ({ reviews: [] })),
      ]);

      setMetrics(dashRes.metrics);
      setReservations(resRes.reservations || []);
      setUsers(usersRes.users || []);
      setBlockedDates(blockRes.blockedDates || []);
      setTemplates(tplRes.templates || []);
      setPropertySettings(propRes.settings || {});
      setAdminReviews(revRes.reviews || []);

      if (tplRes.templates && tplRes.templates.length > 0) {
        setSelectedTemplate(tplRes.templates[0]);
      }
    } catch (err: any) {
      console.error('Error cargando datos de administración:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateReservationStatus(id, { status: newStatus });
      setStatusAlert({ type: 'success', text: `Estado de la reserva actualizado a ${newStatus}` });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al actualizar reserva' });
    }
  };

  const handleDeleteReservation = async (id: string, guestName: string) => {
    if (!window.confirm(`¿Eliminar permanentemente la reserva de ${guestName}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteReservation(id);
      setStatusAlert({ type: 'success', text: `Reserva de ${guestName} eliminada correctamente.` });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al eliminar la reserva.' });
    }
  };

  const handleConfirmPayment = async (id: string, guestName: string) => {
    if (!window.confirm(`¿Confirmar el pago de ${guestName} y enviarle el correo de activación de reserva?`)) return;
    try {
      await api.confirmPayment(id);
      setStatusAlert({ type: 'success', text: `✅ Pago confirmado. Email enviado a ${guestName}.` });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al confirmar el pago.' });
    }
  };

  const handleReschedule = async (id: string, guestName: string) => {
    if (!rescheduleForm.newStartDate || !rescheduleForm.newEndDate) {
      setStatusAlert({ type: 'error', text: 'Selecciona las nuevas fechas de llegada y salida.' });
      return;
    }
    if (new Date(rescheduleForm.newEndDate) <= new Date(rescheduleForm.newStartDate)) {
      setStatusAlert({ type: 'error', text: 'La fecha de salida debe ser posterior a la de llegada.' });
      return;
    }
    setRescheduling(true);
    try {
      const result: any = await api.rescheduleReservation(id, {
        newStartDate: rescheduleForm.newStartDate,
        newEndDate: rescheduleForm.newEndDate,
        additionalCost: rescheduleForm.additionalCost,
        additionalCostAmount: rescheduleForm.additionalCostAmount,
      });
      const msg = result.hasAdditionalCost
        ? `✅ Reserva de ${guestName} reprogramada. Email enviado con coste adicional pendiente. Requiere re-confirmación de pago.`
        : `✅ Reserva de ${guestName} reprogramada y confirmada. Email enviado al cliente.`;
      setStatusAlert({ type: 'success', text: msg });
      setReschedulingId(null);
      setRescheduleForm({ newStartDate: '', newEndDate: '', additionalCost: false, additionalCostAmount: 0 });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al reprogramar la reserva.' });
    } finally {
      setRescheduling(false);
    }
  };

  const handleToggleReview = async (id: string, currentVisible: boolean) => {
    try {
      await api.toggleReviewVisible(id, !currentVisible);
      setAdminReviews(prev => prev.map(r => r.id === id ? { ...r, visible: !currentVisible } : r));
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al cambiar visibilidad.' });
    }
  };

  const handleDeleteReview = async (id: string, author: string) => {
    if (!window.confirm(`¿Eliminar la reseña de ${author}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteReview(id);
      setAdminReviews(prev => prev.filter(r => r.id !== id));
      setStatusAlert({ type: 'success', text: `Reseña de ${author} eliminada.` });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al eliminar la reseña.' });
    }
  };

  const handleSavePropertySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePropertySettings(propertySettings);
      setStatusAlert({ type: 'success', text: 'Configuración de la propiedad guardada con éxito.' });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al guardar la configuración.' });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await api.uploadFile(file);
      const currentImages = Array.isArray(propertySettings.gallery_images)
        ? propertySettings.gallery_images
        : typeof propertySettings.gallery_images === 'string'
        ? JSON.parse(propertySettings.gallery_images)
        : [];

      const updatedImages = [...currentImages, result.url];
      const newSettings = { ...propertySettings, gallery_images: updatedImages };

      setPropertySettings(newSettings);
      await api.updatePropertySettings(newSettings);
      setStatusAlert({ type: 'success', text: 'Imagen subida e incorporada a la galería correctamente.' });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al subir la imagen.' });
    } fontally: {
      setUploadingImage(false);
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.startDate || !newBlock.endDate) return;

    try {
      await api.addBlockedDate(newBlock);
      setNewBlock({ startDate: '', endDate: '', reason: '' });
      setStatusAlert({ type: 'success', text: 'Rango de fechas bloqueado en el calendario.' });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message || 'Error al bloquear fechas.' });
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      await api.deleteBlockedDate(id);
      setStatusAlert({ type: 'success', text: 'Bloqueo eliminado correctamente.' });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message });
    }
  };

  const handleSaveEmailTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      await api.updateEmailTemplate(selectedTemplate.code, {
        subject: selectedTemplate.subject,
        bodyHtml: selectedTemplate.bodyHtml,
      });
      setStatusAlert({ type: 'success', text: 'Plantilla de email actualizada.' });
      loadAllAdminData();
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message });
    }
  };

  const handleSendManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.sendManualEmail(manualEmail);
      setStatusAlert({ type: 'success', text: 'Correo electrónico enviado correctamente.' });
      setManualEmail({ to: '', subject: '', bodyHtml: '' });
    } catch (err: any) {
      setStatusAlert({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-emerald-950 border border-emerald-500/30 rounded-3xl max-w-5xl w-full p-5 sm:p-8 shadow-2xl relative my-6 text-emerald-100 font-sans max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 flex items-center gap-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-emerald-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-serif tracking-tight">
              Panel de Administración Villa María
            </h2>
            <p className="text-xs text-emerald-300/70">
              Gestión integral en tiempo real: reservas, precios, contenidos, fotos y configuración SMTP
            </p>
          </div>
        </div>

        {/* Alert notification */}
        {statusAlert && (
          <div
            className={`mb-4 p-3.5 rounded-xl border flex items-center justify-between text-xs shrink-0 ${
              statusAlert.type === 'success'
                ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/80 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusAlert.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{statusAlert.text}</span>
            </div>
            <button onClick={() => setStatusAlert(null)} className="text-emerald-400/60 hover:text-emerald-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex overflow-x-auto border-b border-emerald-500/20 gap-1 pb-2 mb-6 text-xs font-medium shrink-0 scrollbar-none">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: DollarSign },
            { id: 'reservations', label: `Reservas (${reservations.length})`, icon: CalendarIcon },
            { id: 'reviews', label: `Reseñas (${adminReviews.length})`, icon: Star },
            { id: 'property', label: 'Propiedad & Tarifas', icon: Settings },
            { id: 'blocked', label: 'Fechas Bloqueadas', icon: Lock },
            { id: 'templates', label: 'Plantillas Email', icon: Mail },
            { id: 'smtp', label: 'Configuración SMTP', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents Container */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 text-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-emerald-300">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Cargando datos del servidor...</span>
            </div>
          ) : (
            <>
              {/* 1. Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5">
                      <span className="text-xs text-emerald-300/70 font-semibold uppercase tracking-wider">Ingresos Este Mes</span>
                      <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics?.monthlyIncome || 0}€</p>
                    </div>

                    <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5">
                      <span className="text-xs text-emerald-300/70 font-semibold uppercase tracking-wider">Reservas Pendientes</span>
                      <p className="text-2xl font-bold text-amber-400 mt-2">{metrics?.pendingReservations || 0}</p>
                    </div>

                    <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5">
                      <span className="text-xs text-emerald-300/70 font-semibold uppercase tracking-wider">Reservas Confirmadas</span>
                      <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics?.confirmedReservations || 0}</p>
                    </div>

                    <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5">
                      <span className="text-xs text-emerald-300/70 font-semibold uppercase tracking-wider">Clientes Registrados</span>
                      <p className="text-2xl font-bold text-teal-300 mt-2">{metrics?.totalUsers || 0}</p>
                    </div>
                  </div>

                  {/* Registered Users List */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5">
                    <h3 className="text-base font-bold text-emerald-100 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      Últimos Clientes Registrados
                    </h3>
                    {users.length === 0 ? (
                      <p className="text-xs text-emerald-400/60 py-4">No hay clientes registrados.</p>
                    ) : (
                      <div className="divide-y divide-emerald-500/10">
                        {users.map((u) => (
                          <div key={u.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-emerald-100">{u.name}</p>
                              <p className="text-emerald-400/60">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                            </div>
                            <span className="text-[10px] text-emerald-400/50 font-mono">
                              {new Date(u.createdAt).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Reservations Tab */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  {reservations.length === 0 ? (
                    <p className="text-center text-xs text-emerald-400/60 py-12">No hay reservas guardadas en la base de datos.</p>
                  ) : (
                    reservations.map((resItem) => (
                      <div
                        key={resItem.id}
                        className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                              ID: {resItem.id.slice(0, 8)}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                resItem.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : resItem.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                  : 'bg-red-500/20 text-red-300 border border-red-500/40'
                              }`}
                            >
                              {resItem.status}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white">{resItem.guestName}</h4>
                          <p className="text-xs text-emerald-300/80">
                            {resItem.guestEmail} • {resItem.guestPhone} • {resItem.guestsCount} huésped(es)
                          </p>
                          <p className="text-xs text-emerald-400/90 font-medium">
                            Fechas: {new Date(resItem.startDate).toLocaleDateString('es-ES')} ➔{' '}
                            {new Date(resItem.endDate).toLocaleDateString('es-ES')} | Total: <strong>{resItem.totalPrice}€</strong>
                          </p>
                          {resItem.notes && <p className="text-xs text-emerald-300/60 italic">Notas: "{resItem.notes}"</p>}
                          {resItem.internalNotes && (
                            <p className="text-xs text-violet-300/70 italic mt-0.5">🔒 Admin: {resItem.internalNotes}</p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          {/* Confirm Payment — only shown if not already CONFIRMED */}
                          {resItem.status !== 'CONFIRMED' && resItem.status !== 'CANCELLED' && (
                            <button
                              onClick={() => handleConfirmPayment(resItem.id, resItem.guestName)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 shadow"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirmar Pago
                            </button>
                          )}

                          {/* Reprogramar — shown when not cancelled */}
                          {resItem.status !== 'CANCELLED' && (
                            <button
                              onClick={() => {
                                if (reschedulingId === resItem.id) {
                                  setReschedulingId(null);
                                } else {
                                  setReschedulingId(resItem.id);
                                  setRescheduleForm({ newStartDate: '', newEndDate: '', additionalCost: false, additionalCostAmount: 0 });
                                }
                              }}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 ${
                                reschedulingId === resItem.id
                                  ? 'bg-violet-500 text-white shadow'
                                  : 'bg-violet-500/20 hover:bg-violet-500/40 text-violet-300 border border-violet-500/30'
                              }`}
                            >
                              <CalendarRange className="w-3.5 h-3.5" />
                              Reprogramar
                            </button>
                          )}

                          {/* Cancel — only shown if pending or confirmed */}
                          {resItem.status !== 'CANCELLED' && resItem.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleUpdateStatus(resItem.id, 'CANCELLED')}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancelar
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteReservation(resItem.id, resItem.guestName)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        </div>

                        {/* Inline Reschedule Form — expands below the card */}
                        {reschedulingId === resItem.id && (
                          <div className="col-span-full mt-3 p-4 bg-violet-900/20 border border-violet-500/30 rounded-2xl space-y-3">
                            <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">📅 Reprogramar Reserva — {resItem.guestName}</p>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-violet-300/70 mb-1 uppercase">Nueva Llegada</label>
                                <input
                                  type="date"
                                  value={rescheduleForm.newStartDate}
                                  onChange={e => setRescheduleForm(f => ({ ...f, newStartDate: e.target.value }))}
                                  min={new Date().toISOString().split('T')[0]}
                                  className="w-full bg-emerald-950 border border-violet-500/30 rounded-lg px-3 py-2 text-xs text-emerald-100 focus:outline-none focus:border-violet-400"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-violet-300/70 mb-1 uppercase">Nueva Salida</label>
                                <input
                                  type="date"
                                  value={rescheduleForm.newEndDate}
                                  onChange={e => setRescheduleForm(f => ({ ...f, newEndDate: e.target.value }))}
                                  min={rescheduleForm.newStartDate || new Date().toISOString().split('T')[0]}
                                  className="w-full bg-emerald-950 border border-violet-500/30 rounded-lg px-3 py-2 text-xs text-emerald-100 focus:outline-none focus:border-violet-400"
                                />
                              </div>
                            </div>

                            {/* Additional cost toggle */}
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                              <div
                                onClick={() => setRescheduleForm(f => ({ ...f, additionalCost: !f.additionalCost }))}
                                className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${rescheduleForm.additionalCost ? 'bg-amber-500' : 'bg-emerald-800'}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${rescheduleForm.additionalCost ? 'translate-x-5' : 'translate-x-0'}`} />
                              </div>
                              <span className="text-xs text-emerald-200 font-medium">Coste adicional por reprogramación</span>
                            </label>

                            {rescheduleForm.additionalCost && (
                              <div>
                                <label className="block text-[10px] font-bold text-amber-300/70 mb-1 uppercase">Importe adicional (€)</label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={rescheduleForm.additionalCostAmount}
                                  onChange={e => setRescheduleForm(f => ({ ...f, additionalCostAmount: parseFloat(e.target.value) || 0 }))}
                                  className="w-full bg-emerald-950 border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                                  placeholder="Ej: 50"
                                />
                                <p className="text-[10px] text-amber-400/60 mt-1">
                                  La reserva volverá a estado PENDING hasta que confirmes el pago adicional.
                                </p>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReschedule(resItem.id, resItem.guestName)}
                                disabled={rescheduling}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 disabled:opacity-60"
                              >
                                {rescheduling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CalendarRange className="w-3.5 h-3.5" />}
                                {rescheduling ? 'Procesando…' : 'Confirmar Reprogramación'}
                              </button>
                              <button
                                onClick={() => setReschedulingId(null)}
                                className="px-3 py-2 rounded-xl bg-emerald-900/40 text-emerald-400 text-[11px] font-bold uppercase tracking-wide hover:bg-emerald-800/60 transition-all"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 3. Property & Pricing Tab */}
              {activeTab === 'property' && (
                <form onSubmit={handleSavePropertySettings} className="space-y-6">
                  {/* Títulos y Marca */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      1. Títulos y Textos Principales
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Nombre / Título Principal de la Propiedad</label>
                        <input
                          type="text"
                          placeholder="Ej: Villa María"
                          value={propertySettings.property_title || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, property_title: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Subtítulo Destacado</label>
                        <input
                          type="text"
                          placeholder="Ej: Tu refugio exclusivo en Chichiriviche..."
                          value={propertySettings.property_subtitle || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, property_subtitle: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Descripción Principal de la Finca</label>
                      <textarea
                        rows={3}
                        value={propertySettings.property_description || ''}
                        onChange={(e) => setPropertySettings({ ...propertySettings, property_description: e.target.value })}
                        className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="pt-2 border-t border-emerald-500/20 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Etiqueta Flotante sobre la Foto Principal (Badge Hero)</label>
                        <input
                          type="text"
                          placeholder="Ej: 🏊‍♂️ Piscina Climatizada"
                          value={propertySettings.hero_photo_badge || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, hero_photo_badge: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Píldora Destacada 1</label>
                          <input
                            type="text"
                            placeholder="🏊‍♂️ Piscina Privada"
                            value={propertySettings.hero_feat1 || ''}
                            onChange={(e) => setPropertySettings({ ...propertySettings, hero_feat1: e.target.value })}
                            className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Píldora Destacada 2</label>
                          <input
                            type="text"
                            placeholder="📶 Fibra 600Mb"
                            value={propertySettings.hero_feat2 || ''}
                            onChange={(e) => setPropertySettings({ ...propertySettings, hero_feat2: e.target.value })}
                            className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Píldora Destacada 3</label>
                          <input
                            type="text"
                            placeholder="⚡ Luz y Agua 24/7"
                            value={propertySettings.hero_feat3 || ''}
                            onChange={(e) => setPropertySettings({ ...propertySettings, hero_feat3: e.target.value })}
                            className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Píldora Destacada 4</label>
                          <input
                            type="text"
                            placeholder="🚗 Parking Privado"
                            value={propertySettings.hero_feat4 || ''}
                            onChange={(e) => setPropertySettings({ ...propertySettings, hero_feat4: e.target.value })}
                            className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tarifas y Reglas */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      2. Tarifas y Estancia
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Precio por Noche (€)</label>
                        <input
                          type="number"
                          value={propertySettings.price_per_night || 150}
                          onChange={(e) => setPropertySettings({ ...propertySettings, price_per_night: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Gastos de Limpieza (€)</label>
                        <input
                          type="number"
                          value={propertySettings.cleaning_fee || 50}
                          onChange={(e) => setPropertySettings({ ...propertySettings, cleaning_fee: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Estancia Mínima (Noches)</label>
                        <input
                          type="number"
                          value={propertySettings.minimum_stay_nights || 2}
                          onChange={(e) => setPropertySettings({ ...propertySettings, minimum_stay_nights: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ubicación y Contacto */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      3. Ubicación y Mapa Google Embed
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Dirección Completa</label>
                        <input
                          type="text"
                          value={propertySettings.location_address || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, location_address: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Teléfono / WhatsApp</label>
                        <input
                          type="text"
                          value={propertySettings.whatsapp_number || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, whatsapp_number: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Email de Contacto Principal</label>
                        <input
                          type="email"
                          value={propertySettings.contact_email || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, contact_email: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Correos de Socios (Notificaciones de Reserva)</label>
                        <input
                          type="text"
                          placeholder="socio1@gmail.com, socio2@gmail.com"
                          value={propertySettings.partner_emails || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, partner_emails: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                        <span className="text-[10px] text-emerald-300/70 block mt-0.5">Separados por comas. Recibirán copia automática de cada reserva.</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Enlace a Google Maps GPS (Botón)</label>
                        <input
                          type="text"
                          value={propertySettings.location_maps_link || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, location_maps_link: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Google Maps Iframe / URL de Mapa (Embed)</label>
                      <input
                        type="text"
                        placeholder="Ej: https://maps.google.com/maps?q=Chichiriviche,Venezuela&t=&z=14&ie=UTF8&iwloc=&output=embed o pegue el <iframe> entero"
                        value={propertySettings.location_embed_url || ''}
                        onChange={(e) => setPropertySettings({ ...propertySettings, location_embed_url: e.target.value })}
                        className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-emerald-500/20">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Punto 1 Ubicación</label>
                        <input
                          type="text"
                          placeholder="Ej: 5 minutos de los embarcaderos a Cayo Sombrero"
                          value={propertySettings.location_bullet_1 || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, location_bullet_1: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Punto 2 Ubicación</label>
                        <input
                          type="text"
                          placeholder="Ej: Condominio privado con vigilancia las 24 horas"
                          value={propertySettings.location_bullet_2 || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, location_bullet_2: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Punto 3 Ubicación</label>
                        <input
                          type="text"
                          placeholder="Ej: Supermercados y servicios a 3 minutos"
                          value={propertySettings.location_bullet_3 || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, location_bullet_3: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Descripción de la Ubicación</label>
                      <textarea
                        rows={2}
                        value={propertySettings.location_description || ''}
                        onChange={(e) => setPropertySettings({ ...propertySettings, location_description: e.target.value })}
                        className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Banner Config */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      4. Banner Promocional Superior
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Banner Promocional Activo</label>
                        <select
                          value={propertySettings.banner_enabled ?? 'true'}
                          onChange={(e) => setPropertySettings({ ...propertySettings, banner_enabled: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        >
                          <option value="true">Sí (Activado)</option>
                          <option value="false">No (Desactivado)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Texto Destacado del Banner</label>
                        <input
                          type="text"
                          placeholder="Ej: Suministro constante de agua, planta eléctrica 24/7..."
                          value={propertySettings.banner_text || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, banner_text: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visual Gallery Images Manager */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      5. Galería de Fotos, Títulos y Etiquetas
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-emerald-500/20">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Título de la Sección Galería</label>
                        <input
                          type="text"
                          placeholder="Ej: Fotos de Villa María 🌴"
                          value={propertySettings.gallery_title || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, gallery_title: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Subtítulo de la Galería</label>
                        <input
                          type="text"
                          placeholder="Ej: Galería dinámica de la propiedad..."
                          value={propertySettings.gallery_subtitle || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, gallery_subtitle: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-3 border-b border-emerald-500/20">
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Pestaña 1</label>
                        <input
                          type="text"
                          placeholder="Todas 📸"
                          value={propertySettings.gallery_cat1 || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, gallery_cat1: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Pestaña 2</label>
                        <input
                          type="text"
                          placeholder="Fachada & Porche 🏡"
                          value={propertySettings.gallery_cat2 || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, gallery_cat2: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Pestaña 3</label>
                        <input
                          type="text"
                          placeholder="Piscina & Jardines 🏊‍♂️"
                          value={propertySettings.gallery_cat3 || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, gallery_cat3: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-emerald-300 mb-1">Pestaña 4</label>
                        <input
                          type="text"
                          placeholder="Habitaciones & Salón 🛋️"
                          value={propertySettings.gallery_cat4 || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, gallery_cat4: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                        />
                      </div>
                    </div>

                    {/* Image Grid with Delete Option */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(Array.isArray(propertySettings.gallery_images)
                        ? propertySettings.gallery_images
                        : typeof propertySettings.gallery_images === 'string'
                        ? (() => { try { return JSON.parse(propertySettings.gallery_images); } catch { return []; } })()
                        : []
                      ).map((imgUrl: any, idx: number) => {
                        const src = typeof imgUrl === 'string' ? imgUrl : imgUrl.url || imgUrl.imageUrl;
                        return (
                          <div key={idx} className="relative rounded-xl overflow-hidden group border border-emerald-500/30 aspect-[4/3] bg-emerald-950">
                            <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                let currentList = Array.isArray(propertySettings.gallery_images)
                                  ? propertySettings.gallery_images
                                  : typeof propertySettings.gallery_images === 'string'
                                  ? JSON.parse(propertySettings.gallery_images)
                                  : [];
                                const updated = currentList.filter((_: any, i: number) => i !== idx);
                                setPropertySettings({ ...propertySettings, gallery_images: updated });
                              }}
                              className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                              title="Eliminar esta foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Upload File Input */}
                    <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                      <label className="block text-xs font-semibold text-emerald-300">Subir Nueva Foto desde tu Dispositivo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="text-xs text-emerald-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-emerald-950 hover:file:bg-emerald-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Normas y Cancelación */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      6. Normas de la Casa y Política de Cancelación
                    </h4>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Normas de la Casa (1 por línea)</label>
                      <textarea
                        rows={4}
                        value={propertySettings.house_rules || ''}
                        onChange={(e) => setPropertySettings({ ...propertySettings, house_rules: e.target.value })}
                        className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Política de Cancelación</label>
                      <input
                        type="text"
                        value={propertySettings.cancellation_policy || ''}
                        onChange={(e) => setPropertySettings({ ...propertySettings, cancellation_policy: e.target.value })}
                        className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* Activar/Desactivar Métodos de Pago Individualmente */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      7. Métodos de Pago Aceptados (Opciones de Reserva)
                    </h4>
                    <p className="text-xs text-emerald-300/70">
                      Puedes activar o desactivar individualmente cada opción. Si desactivas todas, se ofrecerá la opción de coordinación directa por WhatsApp.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Zelle (USD)</label>
                        <select
                          value={propertySettings.payment_zelle_enabled ?? 'true'}
                          onChange={(e) => setPropertySettings({ ...propertySettings, payment_zelle_enabled: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        >
                          <option value="true">Activo ✅</option>
                          <option value="false">Desactivado ❌</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Pago Móvil (Bs)</label>
                        <select
                          value={propertySettings.payment_pago_movil_enabled ?? 'true'}
                          onChange={(e) => setPropertySettings({ ...propertySettings, payment_pago_movil_enabled: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        >
                          <option value="true">Activo ✅</option>
                          <option value="false">Desactivado ❌</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Efectivo (USD)</label>
                        <select
                          value={propertySettings.payment_efectivo_enabled ?? 'true'}
                          onChange={(e) => setPropertySettings({ ...propertySettings, payment_efectivo_enabled: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        >
                          <option value="true">Activo ✅</option>
                          <option value="false">Desactivado ❌</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Transferencia Bancaria</label>
                        <select
                          value={propertySettings.payment_transferencia_enabled ?? 'true'}
                          onChange={(e) => setPropertySettings({ ...propertySettings, payment_transferencia_enabled: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400"
                        >
                          <option value="true">Activo ✅</option>
                          <option value="false">Desactivado ❌</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:from-emerald-400 hover:to-teal-300 transition-all min-h-[44px]"
                  >
                    Guardar Todos los Cambios de Propiedad
                  </button>
                </form>
              )}

              {/* 4. Blocked Dates Tab */}
              {activeTab === 'blocked' && (
                <div className="space-y-6">
                  <form onSubmit={handleAddBlockedDate} className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Bloquear Nuevo Rango de Fechas</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Fecha Inicio</label>
                        <input
                          type="date"
                          required
                          value={newBlock.startDate}
                          onChange={(e) => setNewBlock({ ...newBlock, startDate: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Fecha Fin</label>
                        <input
                          type="date"
                          required
                          value={newBlock.endDate}
                          onChange={(e) => setNewBlock({ ...newBlock, endDate: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Motivo del Bloqueo</label>
                      <input
                        type="text"
                        placeholder="Ej. Mantenimiento de piscina / Uso del propietario"
                        value={newBlock.reason}
                        onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                        className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-500 text-emerald-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Añadir Bloqueo</span>
                    </button>
                  </form>

                  {/* List of Blocked Dates */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Rangos Bloqueados Actualmente</h4>
                    {blockedDates.length === 0 ? (
                      <p className="text-xs text-emerald-400/60 py-4">No hay fechas bloqueadas manualmente.</p>
                    ) : (
                      blockedDates.map((item) => (
                        <div
                          key={item.id}
                          className="bg-emerald-900/30 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-emerald-100">
                              {new Date(item.startDate).toLocaleDateString('es-ES')} ➔ {new Date(item.endDate).toLocaleDateString('es-ES')}
                            </p>
                            {item.reason && <p className="text-emerald-400/70 text-[11px]">{item.reason}</p>}
                          </div>
                          <button
                            onClick={() => handleDeleteBlockedDate(item.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* 5. Email Templates Tab */}
              {activeTab === 'templates' && (
                <div className="space-y-6">
                  {/* Select Template */}
                  <div className="flex gap-2">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.code}
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedTemplate?.code === tpl.code
                            ? 'bg-emerald-500 text-emerald-950 font-bold'
                            : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800'
                        }`}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>

                  {selectedTemplate && (
                    <form onSubmit={handleSaveEmailTemplate} className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Asunto del Correo</label>
                        <input
                          type="text"
                          value={selectedTemplate.subject}
                          onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">
                          Cuerpo HTML (Variables disponibles: {selectedTemplate.variables})
                        </label>
                        <textarea
                          rows={8}
                          value={selectedTemplate.bodyHtml}
                          onChange={(e) => setSelectedTemplate({ ...selectedTemplate, bodyHtml: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2.5 text-xs text-emerald-100 font-mono focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-500 text-emerald-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition-all"
                      >
                        Guardar Plantilla
                      </button>
                    </form>
                  )}

                  {/* Send Manual Email Card */}
                  <form onSubmit={handleSendManualEmail} className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
                      <Send className="w-4 h-4 text-emerald-400" />
                      Enviar Email Personalizado Manualmente
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        required
                        placeholder="Email del huésped"
                        value={manualEmail.to}
                        onChange={(e) => setManualEmail({ ...manualEmail, to: e.target.value })}
                        className="bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Asunto"
                        value={manualEmail.subject}
                        onChange={(e) => setManualEmail({ ...manualEmail, subject: e.target.value })}
                        className="bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Mensaje HTML o Texto..."
                      value={manualEmail.bodyHtml}
                      onChange={(e) => setManualEmail({ ...manualEmail, bodyHtml: e.target.value })}
                      className="w-full bg-emerald-950 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-100"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Enviar Email Manual</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 6. SMTP Settings Tab */}
              {activeTab === 'smtp' && <SmtpSettingsSection />}

              {/* 7. Reviews Management Tab */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-emerald-100">Gestión de Reseñas ⭐</h3>
                      <p className="text-xs text-emerald-400/60 mt-0.5">
                        Activa o desactiva cada reseña para que aparezca en la web. Las nuevas reseñas llegan desactivadas por defecto.
                      </p>
                    </div>
                    <button
                      onClick={loadAllAdminData}
                      className="p-2 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  {adminReviews.length === 0 ? (
                    <div className="text-center py-12 text-emerald-400/40 text-sm">
                      <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Aún no hay reseñas. Aparecerán aquí cuando los huéspedes envíen sus opiniones.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminReviews.map((rev: any) => (
                        <div
                          key={rev.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            rev.visible
                              ? 'bg-emerald-900/30 border-emerald-500/30'
                              : 'bg-emerald-950/60 border-emerald-500/10 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-emerald-100">{rev.author}</span>
                                {rev.location && (
                                  <span className="text-xs text-emerald-400/60">{rev.location}</span>
                                )}
                                <span className="text-xs text-emerald-400/40">{rev.date}</span>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-emerald-800'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-emerald-200/70 mt-1.5 leading-relaxed italic">
                                "{rev.comment}"
                              </p>
                            </div>

                            <div className="flex flex-col gap-2 shrink-0">
                              {/* Toggle visibility */}
                              <button
                                onClick={() => handleToggleReview(rev.id, rev.visible)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 ${
                                  rev.visible
                                    ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow'
                                    : 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-800/60'
                                }`}
                                title={rev.visible ? 'Ocultar de la web' : 'Publicar en la web'}
                              >
                                {rev.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                {rev.visible ? 'Visible' : 'Oculta'}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteReview(rev.id, rev.author)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Borrar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
