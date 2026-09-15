import React, { useState, useEffect, useMemo } from 'react';
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
  Search,
  Download,
  CheckSquare,
  Square,
  MessageCircle,
  FileSpreadsheet,
  Check,
  Copy,
  Sparkles,
  Ticket,
  Wifi,
} from 'lucide-react';
import { api } from '../api';
import { AMENITIES } from '../data/mockData';
import { SmtpSettingsSection } from './admin/SmtpSettingsSection';
import { AdminCalendarView } from './admin/AdminCalendarView';
import { AdminCreateReservationModal } from './admin/AdminCreateReservationModal';
import { AdminWhatsAppQuickModal, QuickMessageReservation } from './admin/AdminWhatsAppQuickModal';
import { CheckInVoucherModal, VoucherReservationData } from './CheckInVoucherModal';

interface AdminModalProps {
  onClose: () => void;
  onRefreshData?: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ onClose, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'calendar' | 'reservations' | 'property' | 'templates' | 'smtp' | 'reviews'
  >('dashboard');

  // Data states
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [propertySettings, setPropertySettings] = useState<any>({});
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<any>(null);
  const [refreshingRate, setRefreshingRate] = useState(false);

  // Notifications & Modals
  const [statusAlert, setStatusAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [quickWaReservation, setQuickWaReservation] = useState<QuickMessageReservation | null>(null);
  const [adminVoucherReservation, setAdminVoucherReservation] = useState<VoucherReservationData | null>(null);

  // Multi-reservations management states
  const [selectedResIds, setSelectedResIds] = useState<string[]>([]);
  const [resSearchQuery, setResSearchQuery] = useState('');
  const [resStatusFilter, setResStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'>('ALL');
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newStartDate: '',
    newEndDate: '',
    additionalCost: false,
    additionalCostAmount: 0,
  });
  const [rescheduling, setRescheduling] = useState(false);

  // Form states
  const [newBlock, setNewBlock] = useState({ startDate: '', endDate: '', reason: '' });
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [manualEmail, setManualEmail] = useState({ to: '', subject: '', bodyHtml: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('fachada');
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, resRes, usersRes, blockRes, tplRes, propRes, revRes, exchRes] = await Promise.all([
        api.getDashboardMetrics().catch(() => ({ metrics: null })),
        api.getAdminReservations().catch(() => ({ reservations: [] })),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getBlockedDates().catch(() => ({ blockedDates: [] })),
        api.getEmailTemplates().catch(() => ({ templates: [] })),
        api.getPropertySettings().catch(() => ({ settings: {} })),
        api.getAdminReviews().catch(() => ({ reviews: [] })),
        api.getExchangeRate().catch(() => ({})),
      ]);

      setMetrics(dashRes.metrics);
      setReservations(resRes.reservations || []);
      setUsers(usersRes.users || []);
      setBlockedDates(blockRes.blockedDates || []);
      setTemplates(tplRes.templates || []);
      setPropertySettings(propRes.settings || {});
      setAdminReviews(revRes.reviews || []);
      setExchangeRate(exchRes || null);

      if (tplRes.templates && tplRes.templates.length > 0 && !selectedTemplate) {
        setSelectedTemplate(tplRes.templates[0]);
      }
    } catch (err: any) {
      console.error('Error cargando datos de administración:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAlert = (alert: { type: 'success' | 'error'; text: string }) => {
    setStatusAlert(alert);
    setTimeout(() => {
      setStatusAlert((curr) => (curr?.text === alert.text ? null : curr));
    }, 6000);
  };

  // ----------------------------------------------------
  // Single Reservation Handlers
  // ----------------------------------------------------
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateReservationStatus(id, { status: newStatus });
      handleShowAlert({ type: 'success', text: `Estado de la reserva actualizado a ${newStatus}` });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al actualizar reserva' });
    }
  };

  const handleDeleteReservation = async (id: string, guestName: string) => {
    if (!window.confirm(`¿Eliminar permanentemente la reserva de ${guestName}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteReservation(id);
      handleShowAlert({ type: 'success', text: `Reserva de ${guestName} eliminada correctamente.` });
      setSelectedResIds((prev) => prev.filter((item) => item !== id));
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al eliminar la reserva.' });
    }
  };

  const handleConfirmPayment = async (id: string, guestName: string) => {
    if (!window.confirm(`¿Confirmar el pago de ${guestName} y enviarle el correo de activación de reserva?`)) return;
    try {
      await api.confirmPayment(id);
      handleShowAlert({ type: 'success', text: `✅ Pago confirmado. Email enviado a ${guestName}.` });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al confirmar el pago.' });
    }
  };

  const handleReschedule = async (id: string, guestName: string) => {
    if (!rescheduleForm.newStartDate || !rescheduleForm.newEndDate) {
      handleShowAlert({ type: 'error', text: 'Selecciona las nuevas fechas de llegada y salida.' });
      return;
    }
    if (new Date(rescheduleForm.newEndDate) <= new Date(rescheduleForm.newStartDate)) {
      handleShowAlert({ type: 'error', text: 'La fecha de salida debe ser posterior a la de llegada.' });
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
        ? `✅ Reserva de ${guestName} reprogramada. Email enviado con coste adicional pendiente.`
        : `✅ Reserva de ${guestName} reprogramada y confirmada. Email enviado al cliente.`;
      handleShowAlert({ type: 'success', text: msg });
      setReschedulingId(null);
      setRescheduleForm({ newStartDate: '', newEndDate: '', additionalCost: false, additionalCostAmount: 0 });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al reprogramar la reserva.' });
    } finally {
      setRescheduling(false);
    }
  };

  // ----------------------------------------------------
  // Bulk Multi-Reservation Actions
  // ----------------------------------------------------
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Filter by status
      if (resStatusFilter !== 'ALL' && r.status !== resStatusFilter) {
        return false;
      }
      // Filter by search query
      if (resSearchQuery.trim()) {
        const query = resSearchQuery.toLowerCase();
        const matchesName = r.guestName?.toLowerCase().includes(query);
        const matchesEmail = r.guestEmail?.toLowerCase().includes(query);
        const matchesPhone = r.guestPhone?.toLowerCase().includes(query);
        const matchesId = r.id?.toLowerCase().includes(query);
        return matchesName || matchesEmail || matchesPhone || matchesId;
      }
      return true;
    });
  }, [reservations, resStatusFilter, resSearchQuery]);

  const handleToggleSelectAll = () => {
    if (selectedResIds.length === filteredReservations.length && filteredReservations.length > 0) {
      setSelectedResIds([]);
    } else {
      setSelectedResIds(filteredReservations.map((r) => r.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedResIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedResIds.length === 0) return;
    if (!window.confirm(`¿Cambiar el estado de ${selectedResIds.length} reservas seleccionadas a "${status}"?`)) return;

    setBulkActionLoading(true);
    try {
      await api.bulkUpdateReservationStatus(selectedResIds, status);
      handleShowAlert({ type: 'success', text: `✅ ${selectedResIds.length} reservas actualizadas a ${status}.` });
      setSelectedResIds([]);
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error en acción masiva.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedResIds.length === 0) return;
    if (!window.confirm(`⚠️ ¿ELIMINAR DEFINITIVAMENTE ${selectedResIds.length} reservas seleccionadas? Esta acción no se puede deshacer.`)) return;

    setBulkActionLoading(true);
    try {
      await api.bulkDeleteReservations(selectedResIds);
      handleShowAlert({ type: 'success', text: `🗑️ ${selectedResIds.length} reservas eliminadas correctamente.` });
      setSelectedResIds([]);
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al eliminar reservas seleccionadas.' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredReservations.length === 0) {
      handleShowAlert({ type: 'error', text: 'No hay reservas para exportar.' });
      return;
    }

    const headers = ['ID Reserva', 'Huésped', 'Email', 'Teléfono', 'Llegada', 'Salida', 'Huéspedes', 'Precio Total USD', 'Estado', 'Notas', 'Fecha Registro'];
    const rows = filteredReservations.map((r) => [
      r.id,
      `"${(r.guestName || '').replace(/"/g, '""')}"`,
      `"${(r.guestEmail || '').replace(/"/g, '""')}"`,
      `"${(r.guestPhone || '').replace(/"/g, '""')}"`,
      new Date(r.startDate).toISOString().split('T')[0],
      new Date(r.endDate).toISOString().split('T')[0],
      r.guestsCount || 1,
      r.totalPrice,
      r.status,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
      new Date(r.createdAt).toISOString().split('T')[0],
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reservas_villamaria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // Reviews Handlers
  // ----------------------------------------------------
  const handleToggleReview = async (id: string, currentVisible: boolean) => {
    try {
      await api.toggleReviewVisible(id, !currentVisible);
      setAdminReviews((prev) => prev.map((r) => (r.id === id ? { ...r, visible: !currentVisible } : r)));
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al cambiar visibilidad.' });
    }
  };

  const handleDeleteReview = async (id: string, author: string) => {
    if (!window.confirm(`¿Eliminar la reseña de ${author}? Esta acción no se puede deshacer.`)) return;
    try {
      await api.deleteReview(id);
      setAdminReviews((prev) => prev.filter((r) => r.id !== id));
      handleShowAlert({ type: 'success', text: `Reseña de ${author} eliminada.` });
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al eliminar la reseña.' });
    }
  };

  // ----------------------------------------------------
  // Exchange Rate & Property Handlers
  // ----------------------------------------------------
  const handleRefreshExchangeRate = async () => {
    setRefreshingRate(true);
    try {
      const result: any = await api.refreshExchangeRate();
      setExchangeRate(result);
      const rateVal = result?.rate != null ? `Bs. ${result.rate}` : 'no disponible';
      handleShowAlert({ type: 'success', text: `Tasa BCV actualizada: ${rateVal}` });
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al actualizar la tasa BCV.' });
    } finally {
      setRefreshingRate(false);
    }
  };

  const handleSavePropertySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updatePropertySettings(propertySettings);
      handleShowAlert({ type: 'success', text: 'Configuración de la propiedad guardada con éxito.' });
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al guardar la configuración.' });
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

      const updatedImages = [...currentImages, { url: result.url, category: uploadCategory }];
      const newSettings = { ...propertySettings, gallery_images: updatedImages };

      setPropertySettings(newSettings);
      await api.updatePropertySettings(newSettings);
      handleShowAlert({ type: 'success', text: 'Imagen subida e incorporada a la galería correctamente.' });
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al subir la imagen.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const setGalleryImageCategory = (idx: number, category: string) => {
    let list = Array.isArray(propertySettings.gallery_images)
      ? propertySettings.gallery_images
      : typeof propertySettings.gallery_images === 'string'
      ? (() => {
          try {
            return JSON.parse(propertySettings.gallery_images);
          } catch {
            return [];
          }
        })()
      : [];
    const updated = list.map((item: any, i: number) => {
      if (i !== idx) return item;
      const url = typeof item === 'string' ? item : item.url || item.imageUrl;
      return { url, category };
    });
    setPropertySettings({ ...propertySettings, gallery_images: updated });
  };

  // ----------------------------------------------------
  // Amenities / Services Management
  // ----------------------------------------------------
  const getAmenitiesList = (): Array<{ id: string; title: string; emoji: string; description: string }> => {
    const am = propertySettings.amenities;
    if (!am) return AMENITIES;
    if (Array.isArray(am)) return am;
    if (typeof am === 'string') {
      try {
        const parsed = JSON.parse(am);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : AMENITIES;
      } catch {
        return AMENITIES;
      }
    }
    return AMENITIES;
  };

  const handleUpdateAmenity = (index: number, field: string, value: string) => {
    const current = [...getAmenitiesList()];
    if (current[index]) {
      current[index] = { ...current[index], [field]: value };
      setPropertySettings({ ...propertySettings, amenities: current });
    }
  };

  const handleAddAmenity = () => {
    const current = [...getAmenitiesList()];
    current.push({
      id: `am-${Date.now()}`,
      title: 'Nuevo Servicio',
      emoji: '✨',
      description: 'Detalles del servicio incluido para los huéspedes.',
    });
    setPropertySettings({ ...propertySettings, amenities: current });
  };

  const handleDeleteAmenity = (index: number) => {
    const current = getAmenitiesList().filter((_, i) => i !== index);
    setPropertySettings({ ...propertySettings, amenities: current });
  };

  const handleResetDefaultAmenities = () => {
    if (window.confirm('¿Restablecer la lista a los servicios sugeridos por defecto de Villa María?')) {
      setPropertySettings({ ...propertySettings, amenities: AMENITIES });
    }
  };

  // Blocked Dates
  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.startDate || !newBlock.endDate) return;

    try {
      await api.addBlockedDate(newBlock);
      setNewBlock({ startDate: '', endDate: '', reason: '' });
      handleShowAlert({ type: 'success', text: 'Rango de fechas bloqueado en el calendario.' });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message || 'Error al bloquear fechas.' });
    }
  };

  const handleDeleteBlockedDate = async (id: string) => {
    try {
      await api.deleteBlockedDate(id);
      handleShowAlert({ type: 'success', text: 'Bloqueo eliminado correctamente.' });
      loadAllAdminData();
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message });
    }
  };

  // Email Templates
  const handleSaveEmailTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    try {
      await api.updateEmailTemplate(selectedTemplate.code, {
        subject: selectedTemplate.subject,
        bodyHtml: selectedTemplate.bodyHtml,
      });
      handleShowAlert({ type: 'success', text: 'Plantilla de email actualizada con éxito.' });
      loadAllAdminData();
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message });
    }
  };

  const handleSendManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.sendManualEmail(manualEmail);
      handleShowAlert({ type: 'success', text: 'Correo electrónico enviado correctamente.' });
      setManualEmail({ to: '', subject: '', bodyHtml: '' });
    } catch (err: any) {
      handleShowAlert({ type: 'error', text: err.message });
    }
  };

  // Counts for tabs
  const pendingCount = useMemo(() => reservations.filter((r) => r.status === 'PENDING').length, [reservations]);
  const unapprovedReviewsCount = useMemo(() => adminReviews.filter((r) => !r.visible).length, [adminReviews]);

  const handleCopyVariable = (varName: string) => {
    navigator.clipboard.writeText(varName);
    setCopiedVariable(varName);
    setTimeout(() => {
      setCopiedVariable((curr) => (curr === varName ? null : curr));
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 overflow-y-auto">
      <div className="bg-emerald-950 sm:border sm:border-emerald-500/30 sm:rounded-3xl max-w-6xl w-full p-3.5 sm:p-5 lg:p-7 shadow-2xl relative text-emerald-100 font-sans h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden max-w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors z-20"
          aria-label="Cerrar panel de administración"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3 shrink-0 pr-12 sm:pr-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-300 text-emerald-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20 shrink-0">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-base sm:text-2xl font-bold text-white font-serif tracking-tight truncate">
              Panel de Administración
            </h2>
          </div>
        </div>

        {/* Alert notification banner */}
        {statusAlert && (
          <div
            className={`mb-3 sm:mb-4 p-3 sm:p-3.5 rounded-xl border flex items-center justify-between text-xs shrink-0 animate-fadeIn min-h-[44px] ${
              statusAlert.type === 'success'
                ? 'bg-emerald-900/70 border-emerald-500/40 text-emerald-200'
                : 'bg-red-950/80 border-red-500/40 text-red-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              {statusAlert.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span className="break-words">{statusAlert.text}</span>
            </div>
            <button
              onClick={() => setStatusAlert(null)}
              className="min-w-[36px] min-h-[36px] flex items-center justify-center text-emerald-400/60 hover:text-emerald-200 ml-1 shrink-0"
              aria-label="Cerrar alerta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="flex items-center overflow-x-auto border-b border-emerald-500/20 gap-1 sm:gap-1.5 pb-2 mb-3 sm:mb-5 text-xs font-medium shrink-0 scrollbar-none touch-pan-x">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: DollarSign, shortLabel: '$' },
            {
              id: 'calendar',
              label: 'Calendario',
              icon: CalendarIcon,
              highlight: true,
              shortLabel: '📅',
            },
            {
              id: 'reservations',
              label: `Reservas (${reservations.length})`,
              icon: CalendarRange,
              badge: pendingCount > 0 ? `${pendingCount}` : undefined,
              badgeColor: 'bg-amber-500 text-emerald-950',
              shortLabel: '',
            },
            {
              id: 'reviews',
              label: `Reseñas (${adminReviews.length})`,
              icon: Star,
              badge: unapprovedReviewsCount > 0 ? `${unapprovedReviewsCount}` : undefined,
              badgeColor: 'bg-teal-400 text-emerald-950',
              shortLabel: '',
            },
            { id: 'property', label: 'Propiedad', icon: Settings, shortLabel: '' },
            { id: 'templates', label: 'Email', icon: Mail, shortLabel: '' },
            { id: 'smtp', label: 'SMTP', icon: Shield, shortLabel: '' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                title={tab.label}
                aria-label={tab.label}
                className={`px-3 sm:px-3.5 py-2.5 sm:py-2.5 rounded-xl flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 whitespace-nowrap transition-all select-none min-h-[44px] min-w-[44px] shrink-0 ${
                  isActive
                    ? 'bg-emerald-500 text-emerald-950 font-bold shadow-md shadow-emerald-500/25'
                    : tab.highlight
                    ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-500/30 hover:bg-emerald-800'
                    : 'text-emerald-300/70 hover:text-emerald-100 hover:bg-emerald-900/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-xs">{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none shrink-0 ${tab.badgeColor || 'bg-emerald-900 text-white'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents Scrollable Body */}
        <div className="flex-1 overflow-y-auto pr-0.5 sm:pr-1 space-y-4 sm:space-y-5 text-sm scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-emerald-300 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              <span className="text-sm font-semibold">Cargando base de datos de Villa María...</span>
            </div>
          ) : (
            <>
              {/* 1. DASHBOARD TAB */}
              {activeTab === 'dashboard' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-950 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs text-emerald-300/80 font-semibold uppercase tracking-wider truncate">Ingresos Este Mes</span>
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-300 font-serif mt-1 sm:mt-2 truncate">
                        US$ {Number(metrics?.monthlyIncome || 0).toLocaleString('en-US')}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-emerald-400/60 mt-1">De reservas con pago confirmado</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-950 border border-amber-500/30 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs text-amber-300/80 font-semibold uppercase tracking-wider truncate">Reservas Pendientes</span>
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                      </div>
                      <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-amber-300 font-serif mt-1 sm:mt-2 truncate">
                        {metrics?.pendingReservations || 0}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-amber-400/60 mt-1">Requieren verificación de pago</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-950 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs text-emerald-300/80 font-semibold uppercase tracking-wider truncate">Reservas Confirmadas</span>
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                      </div>
                      <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-400 font-serif mt-1 sm:mt-2 truncate">
                        {metrics?.confirmedReservations || 0}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-emerald-400/60 mt-1">Total de estancias activadas</p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/60 to-emerald-950 border border-teal-500/30 rounded-2xl p-3.5 sm:p-5 shadow-lg relative overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs text-teal-300/80 font-semibold uppercase tracking-wider truncate">Clientes Registrados</span>
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400 shrink-0" />
                      </div>
                      <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-teal-300 font-serif mt-1 sm:mt-2 truncate">
                        {metrics?.totalUsers || 0}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-teal-400/60 mt-1">Cuentas creadas en la web</p>
                    </div>
                  </div>

                  {/* Quick Shortcuts & Registered Users List */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-5">
                    {/* Left: Quick Actions */}
                    <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
                      <h3 className="text-xs sm:text-sm font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-emerald-400" />
                        Acciones Rápidas
                      </h3>
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => setActiveTab('calendar')}
                          className="w-full text-left p-3 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-500/20 transition-all flex items-center justify-between min-h-[44px]"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">📅 Ver Calendario Mensual</span>
                            <span className="text-[10px] text-emerald-300/70">Visualiza la ocupación de Villa María</span>
                          </div>
                          <span className="text-emerald-400 font-bold ml-2">➔</span>
                        </button>

                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="w-full text-left p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 transition-all flex items-center justify-between min-h-[44px]"
                        >
                          <div>
                            <span className="text-xs font-bold text-emerald-300 block">➕ Crear Reserva Manual</span>
                            <span className="text-[10px] text-emerald-300/70">Para llamadas o clientes directos</span>
                          </div>
                          <span className="text-emerald-400 font-bold ml-2">➔</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('property')}
                          className="w-full text-left p-3 rounded-xl bg-emerald-900/50 hover:bg-emerald-800/70 border border-emerald-500/20 transition-all flex items-center justify-between min-h-[44px]"
                        >
                          <div>
                            <span className="text-xs font-bold text-white block">⚙️ Ajustar Precios & Fotos</span>
                            <span className="text-[10px] text-emerald-300/70">Tarifas por noche y fotos de la galería</span>
                          </div>
                          <span className="text-emerald-400 font-bold ml-2">➔</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Registered Users */}
                    <div className="lg:col-span-2 bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5">
                      <h3 className="text-xs sm:text-sm font-bold text-emerald-100 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        Últimos Clientes Registrados
                      </h3>
                      {users.length === 0 ? (
                        <p className="text-xs text-emerald-400/60 py-6 text-center">No hay clientes registrados en la base de datos.</p>
                      ) : (
                        <div className="divide-y divide-emerald-500/10 max-h-[220px] overflow-y-auto pr-1">
                          {users.map((u) => (
                            <div key={u.id} className="py-2.5 flex items-center justify-between text-xs gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-emerald-100 truncate">{u.name}</p>
                                <p className="text-emerald-400/60 text-[11px] truncate">{u.email} {u.phone ? `• ${u.phone}` : ''}</p>
                              </div>
                              <span className="text-[10px] text-emerald-400/50 font-mono shrink-0">
                                {new Date(u.createdAt).toLocaleDateString('es-ES')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. INTERACTIVE CALENDAR TAB */}
              {activeTab === 'calendar' && (
                <AdminCalendarView
                  reservations={reservations}
                  blockedDates={blockedDates}
                  propertySettings={propertySettings}
                  onRefresh={loadAllAdminData}
                  onShowAlert={handleShowAlert}
                />
              )}

              {/* 3. RESERVATIONS LIST & ADVANCED MULTI-MANAGEMENT TAB */}
              {activeTab === 'reservations' && (
                <div className="space-y-4">
                  {/* Action Bar: Search, Status Filters, Bulk Bar, CSV Export, Create Button */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-3.5 sm:p-4 space-y-3">
                    {/* Top Row: Search & Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                      <div className="relative flex-1 min-w-0">
                        <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, correo, teléfono o ID..."
                          value={resSearchQuery}
                          onChange={(e) => setResSearchQuery(e.target.value)}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl pl-9 pr-8 py-2.5 text-xs text-emerald-100 focus:outline-none focus:border-emerald-400 placeholder-emerald-700 min-h-[44px]"
                        />
                        {resSearchQuery && (
                          <button
                            onClick={() => setResSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 min-w-[32px] min-h-[32px] flex items-center justify-center text-emerald-400/60 hover:text-white"
                            aria-label="Limpiar búsqueda"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleExportCSV}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all min-h-[44px]"
                          title="Descargar lista de reservas en formato CSV / Excel"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Exportar CSV</span>
                        </button>

                        <button
                          onClick={() => setIsCreateModalOpen(true)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 min-h-[44px]"
                        >
                          <Plus className="w-4 h-4 shrink-0" />
                          <span>Nueva Reserva</span>
                        </button>
                      </div>
                    </div>

                    {/* Filter Pills & Selection Counter */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/10 text-xs">
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full touch-pan-x">
                        {[
                          { id: 'ALL', label: `Todas (${reservations.length})` },
                          { id: 'PENDING', label: `Pendientes (${reservations.filter((r) => r.status === 'PENDING').length})` },
                          { id: 'CONFIRMED', label: `Confirmadas (${reservations.filter((r) => r.status === 'CONFIRMED').length})` },
                          { id: 'CANCELLED', label: `Canceladas (${reservations.filter((r) => r.status === 'CANCELLED').length})` },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setResStatusFilter(tab.id as any)}
                            className={`px-3 py-2 rounded-lg font-semibold text-[11px] transition-all whitespace-nowrap min-h-[40px] shrink-0 ${
                              resStatusFilter === tab.id
                                ? 'bg-emerald-500 text-emerald-950 font-bold shadow'
                                : 'bg-emerald-950/60 text-emerald-300/80 hover:bg-emerald-900'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Select All Toggle */}
                      {filteredReservations.length > 0 && (
                        <button
                          onClick={handleToggleSelectAll}
                          className="flex items-center gap-1.5 text-xs text-emerald-300/80 hover:text-emerald-100 font-semibold min-h-[40px] py-1 px-2 rounded-lg"
                        >
                          {selectedResIds.length === filteredReservations.length ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-emerald-500/60" />
                          )}
                          <span>
                            {selectedResIds.length === filteredReservations.length ? 'Deseleccionar todas' : 'Seleccionar todas'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bulk Actions Floating Bar (Visible when 1+ selected) */}
                  {selectedResIds.length > 0 && (
                    <div className="p-3 sm:p-3.5 bg-emerald-900/95 border border-emerald-400/40 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xl animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold text-xs shrink-0">
                          {selectedResIds.length}
                        </span>
                        <span className="text-xs font-bold text-white">
                          reserva{selectedResIds.length > 1 ? 's' : ''} seleccionada{selectedResIds.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleBulkStatusChange('CONFIRMED')}
                          disabled={bulkActionLoading}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs transition-all shadow min-h-[44px]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Confirmar</span>
                        </button>

                        <button
                          onClick={() => handleBulkStatusChange('CANCELLED')}
                          disabled={bulkActionLoading}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all min-h-[44px]"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Cancelar</span>
                        </button>

                        <button
                          onClick={handleBulkDelete}
                          disabled={bulkActionLoading}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/40 font-bold text-xs transition-all min-h-[44px]"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Eliminar</span>
                        </button>

                        <button
                          onClick={() => setSelectedResIds([])}
                          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-emerald-400 hover:text-white bg-emerald-950/40"
                          title="Limpiar selección"
                          aria-label="Limpiar selección"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Reservations Cards List */}
                  {filteredReservations.length === 0 ? (
                    <div className="text-center text-xs text-emerald-400/60 py-16 bg-emerald-900/20 rounded-3xl border border-emerald-500/10">
                      <CalendarRange className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No se encontraron reservas con los filtros aplicados.</p>
                    </div>
                  ) : (
                    filteredReservations.map((resItem) => {
                      const isSelected = selectedResIds.includes(resItem.id);
                      return (
                        <div
                          key={resItem.id}
                          className={`rounded-2xl p-3.5 sm:p-5 transition-all border ${
                            isSelected
                              ? 'bg-emerald-900/60 border-emerald-400/50 shadow-md ring-1 ring-emerald-400/30'
                              : 'bg-emerald-900/40 border-emerald-500/20 hover:border-emerald-500/40'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4">
                            {/* Left: Checkbox + Guest Information */}
                            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                              <button
                                onClick={() => handleToggleSelectOne(resItem.id)}
                                className="mt-0.5 min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center text-emerald-400 hover:text-white transition-colors shrink-0"
                                aria-label={isSelected ? "Deseleccionar reserva" : "Seleccionar reserva"}
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                                ) : (
                                  <Square className="w-5 h-5 text-emerald-500/40" />
                                )}
                              </button>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
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

                                <h4 className="text-sm sm:text-base font-bold text-white break-words">{resItem.guestName}</h4>
                                <p className="text-xs text-emerald-300/80 break-words">
                                  {resItem.guestEmail} • {resItem.guestPhone} • {resItem.guestsCount} huésped(es)
                                </p>
                                <p className="text-xs text-emerald-400 font-medium break-words">
                                  Fechas: <strong>{new Date(resItem.startDate).toLocaleDateString('es-ES')}</strong> ➔{' '}
                                  <strong>{new Date(resItem.endDate).toLocaleDateString('es-ES')}</strong> | Total:{' '}
                                  <span className="text-emerald-300 font-bold font-serif">US$ {resItem.totalPrice}</span>
                                </p>
                                {resItem.notes && <p className="text-xs text-emerald-300/60 italic break-words">Notas: "{resItem.notes}"</p>}
                                {resItem.internalNotes && (
                                  <p className="text-xs text-violet-300/80 italic mt-0.5 break-words">🔒 Admin: {resItem.internalNotes}</p>
                                )}
                              </div>
                            </div>

                            {/* Right: Actions Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto justify-start md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-emerald-500/10">
                              {/* Confirm Payment */}
                              {resItem.status !== 'CONFIRMED' && resItem.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => handleConfirmPayment(resItem.id, resItem.guestName)}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 shadow min-h-[44px]"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>Confirmar Pago</span>
                                </button>
                              )}

                              {/* Quick WhatsApp Templates Button */}
                              {resItem.guestPhone && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuickWaReservation({
                                      id: resItem.id,
                                      guestName: resItem.guestName,
                                      guestPhone: resItem.guestPhone,
                                      startDate: resItem.startDate,
                                      endDate: resItem.endDate,
                                      totalPrice: resItem.totalPrice,
                                      status: resItem.status,
                                    })
                                  }
                                  className="min-h-[44px] px-3 flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-[11px] font-bold uppercase tracking-wide transition-colors"
                                  title="Enviar mensajes rápidos (GPS, Wi-Fi, Check-out, etc.)"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>WhatsApp 💬</span>
                                </button>
                              )}

                              {/* View / Download Guest Voucher */}
                              <button
                                type="button"
                                onClick={() =>
                                  setAdminVoucherReservation({
                                    id: resItem.id,
                                    guestName: resItem.guestName,
                                    guestEmail: resItem.guestEmail,
                                    guestPhone: resItem.guestPhone,
                                    checkIn: resItem.startDate,
                                    checkOut: resItem.endDate,
                                    guestsCount: resItem.guestsCount,
                                    totalPrice: resItem.totalPrice,
                                    status: resItem.status,
                                    propertyAddress: propertySettings.location_address,
                                    mapsUrl: propertySettings.location_maps_link,
                                    wifiSsid: propertySettings.wifi_ssid,
                                    wifiPass: propertySettings.wifi_password,
                                    hostPhone: propertySettings.whatsapp_number || propertySettings.contact_phone,
                                  })
                                }
                                className="min-h-[44px] px-2.5 flex items-center justify-center gap-1 rounded-xl bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold uppercase tracking-wide transition-colors"
                                title="Ver Pase Digital con QR"
                              >
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Pase QR</span>
                              </button>

                              {/* Reprogramar */}
                              {resItem.status !== 'CANCELLED' && (
                                <button
                                  onClick={() => {
                                    if (reschedulingId === resItem.id) {
                                      setReschedulingId(null);
                                    } else {
                                      setReschedulingId(resItem.id);
                                      setRescheduleForm({
                                        newStartDate: new Date(resItem.startDate).toISOString().split('T')[0],
                                        newEndDate: new Date(resItem.endDate).toISOString().split('T')[0],
                                        additionalCost: false,
                                        additionalCostAmount: 0,
                                      });
                                    }
                                  }}
                                  className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 min-h-[44px] ${
                                    reschedulingId === resItem.id
                                      ? 'bg-violet-500 text-white shadow'
                                      : 'bg-violet-500/20 hover:bg-violet-500/40 text-violet-300 border border-violet-500/30'
                                  }`}
                                >
                                  <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                                  <span>Reprogramar</span>
                                </button>
                              )}

                              {/* Cancel */}
                              {resItem.status !== 'CANCELLED' && resItem.status !== 'COMPLETED' && (
                                <button
                                  onClick={() => handleUpdateStatus(resItem.id, 'CANCELLED')}
                                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 min-h-[44px]"
                                >
                                  <X className="w-3.5 h-3.5 shrink-0" />
                                  <span>Cancelar</span>
                                </button>
                              )}

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteReservation(resItem.id, resItem.guestName)}
                                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 font-bold text-[11px] uppercase tracking-wide transition-all active:scale-95 min-h-[44px]"
                              >
                                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          </div>

                          {/* Inline Reschedule Form */}
                          {reschedulingId === resItem.id && (
                            <div className="mt-3 p-3.5 sm:p-4 bg-violet-950/40 border border-violet-500/30 rounded-2xl space-y-3 animate-fadeIn">
                              <p className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                                📅 Reprogramar Reserva — {resItem.guestName}
                              </p>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-violet-300/70 mb-1 uppercase">Nueva Llegada</label>
                                  <input
                                    type="date"
                                    value={rescheduleForm.newStartDate}
                                    onChange={(e) => setRescheduleForm((f) => ({ ...f, newStartDate: e.target.value }))}
                                    className="w-full bg-emerald-950 border border-violet-500/30 rounded-lg px-3 py-2.5 text-xs text-emerald-100 focus:outline-none focus:border-violet-400 min-h-[44px]"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-violet-300/70 mb-1 uppercase">Nueva Salida</label>
                                  <input
                                    type="date"
                                    value={rescheduleForm.newEndDate}
                                    onChange={(e) => setRescheduleForm((f) => ({ ...f, newEndDate: e.target.value }))}
                                    min={rescheduleForm.newStartDate}
                                    className="w-full bg-emerald-950 border border-violet-500/30 rounded-lg px-3 py-2.5 text-xs text-emerald-100 focus:outline-none focus:border-violet-400 min-h-[44px]"
                                  />
                                </div>
                              </div>

                              <label className="flex items-center gap-2.5 cursor-pointer select-none min-h-[40px]">
                                <input
                                  type="checkbox"
                                  checked={rescheduleForm.additionalCost}
                                  onChange={(e) => setRescheduleForm((f) => ({ ...f, additionalCost: e.target.checked }))}
                                  className="w-4 h-4 rounded border-violet-500 text-violet-500 focus:ring-0"
                                />
                                <span className="text-xs text-emerald-200 font-medium">Coste adicional por reprogramación</span>
                              </label>

                              {rescheduleForm.additionalCost && (
                                <div>
                                  <label className="block text-[10px] font-bold text-amber-300/70 mb-1 uppercase">Importe adicional (US$)</label>
                                  <input
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    value={rescheduleForm.additionalCostAmount}
                                    onChange={(e) =>
                                      setRescheduleForm((f) => ({ ...f, additionalCostAmount: parseFloat(e.target.value) || 0 }))
                                    }
                                    className="w-full bg-emerald-950 border border-amber-500/40 rounded-lg px-3 py-2.5 text-xs text-amber-200 focus:outline-none min-h-[44px]"
                                    placeholder="Ej: 50"
                                  />
                                </div>
                              )}

                              <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-1">
                                <button
                                  onClick={() => setReschedulingId(null)}
                                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-900/40 text-emerald-400 text-xs font-bold uppercase min-h-[44px] flex items-center justify-center"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => handleReschedule(resItem.id, resItem.guestName)}
                                  disabled={rescheduling}
                                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-bold text-xs uppercase tracking-wide transition-all active:scale-95 disabled:opacity-60 min-h-[44px]"
                                >
                                  {rescheduling ? <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" /> : <CalendarRange className="w-3.5 h-3.5 shrink-0" />}
                                  <span>{rescheduling ? 'Procesando…' : 'Confirmar Reprogramación'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* 4. REVIEWS MANAGEMENT TAB */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-emerald-100">Gestión de Reseñas de Huéspedes ⭐</h3>
                      <p className="text-xs text-emerald-400/60 mt-0.5">
                        Activa o desactiva cada reseña para que aparezca publicada en la web.
                      </p>
                    </div>
                  </div>

                  {adminReviews.length === 0 ? (
                    <div className="text-center py-16 text-emerald-400/40 text-sm bg-emerald-900/20 rounded-3xl border border-emerald-500/10">
                      <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>Aún no hay reseñas registradas.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminReviews.map((rev: any) => (
                        <div
                          key={rev.id}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                            rev.visible
                              ? 'bg-emerald-900/30 border-emerald-500/30'
                              : 'bg-emerald-950/60 border-emerald-500/10 opacity-70'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-bold text-emerald-100">{rev.author}</span>
                                {rev.location && <span className="text-[11px] sm:text-xs text-emerald-400/60">{rev.location}</span>}
                                <span className="text-[11px] sm:text-xs text-emerald-400/40">{rev.date}</span>
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-emerald-800'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-emerald-200/90 leading-relaxed italic break-words">"{rev.comment}"</p>
                            </div>

                            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-500/10">
                              <button
                                onClick={() => handleToggleReview(rev.id, rev.visible)}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all active:scale-95 min-h-[44px] ${
                                  rev.visible
                                    ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow'
                                    : 'bg-emerald-900/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-800/60'
                                }`}
                                title={rev.visible ? 'Ocultar de la web' : 'Publicar en la web'}
                              >
                                {rev.visible ? <Eye className="w-4 h-4 shrink-0" /> : <EyeOff className="w-4 h-4 shrink-0" />}
                                <span>{rev.visible ? 'Visible' : 'Oculta'}</span>
                              </button>

                              <button
                                onClick={() => handleDeleteReview(rev.id, rev.author)}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 font-bold text-xs uppercase tracking-wide transition-all active:scale-95 min-h-[44px]"
                              >
                                <Trash2 className="w-4 h-4 shrink-0" />
                                <span>Borrar</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. PROPERTY & PRICING TAB */}
              {activeTab === 'property' && (
                <form onSubmit={handleSavePropertySettings} className="space-y-4 sm:space-y-6">
                  {/* Títulos y Marca */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      1. Títulos y Textos Principales
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Nombre / Título Principal de la Propiedad</label>
                        <input
                          type="text"
                          placeholder="Ej: Villa María"
                          value={propertySettings.property_title || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, property_title: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Subtítulo Destacado</label>
                        <input
                          type="text"
                          placeholder="Ej: Tu refugio exclusivo en Chichiriviche..."
                          value={propertySettings.property_subtitle || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, property_subtitle: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-emerald-300 mb-1">Descripción Principal de la Finca</label>
                      <textarea
                        rows={3}
                        value={propertySettings.property_description || ''}
                        onChange={(e) => setPropertySettings({ ...propertySettings, property_description: e.target.value })}
                        className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Tarifas y Reglas */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                      2. Tarifas y Estancia
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Precio por Noche (US$)</label>
                        <input
                          type="number"
                          value={propertySettings.price_per_night || 150}
                          onChange={(e) => setPropertySettings({ ...propertySettings, price_per_night: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Gastos de Limpieza (US$)</label>
                        <input
                          type="number"
                          value={propertySettings.cleaning_fee || 50}
                          onChange={(e) => setPropertySettings({ ...propertySettings, cleaning_fee: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Estancia Mínima (Noches)</label>
                        <input
                          type="number"
                          value={propertySettings.minimum_stay_nights || 2}
                          onChange={(e) => setPropertySettings({ ...propertySettings, minimum_stay_nights: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Tasa BCV automática */}
                    <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-emerald-950/60 border border-amber-500/30 space-y-2">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">Tasa Oficial del Día (BCV) — Bs/US$</span>
                          <p className="text-lg sm:text-xl font-serif font-bold text-amber-200 leading-none mt-1">
                            {exchangeRate?.rate != null ? `Bs. ${exchangeRate.rate}` : 'No disponible'}
                          </p>
                          {exchangeRate?.date && (
                            <p className="text-[10px] sm:text-[11px] text-emerald-300/60 mt-1">
                              Actualizada: {exchangeRate.date}
                              {exchangeRate.updatedAt ? ` · ${new Date(exchangeRate.updatedAt).toLocaleString('es-VE')}` : ''}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={handleRefreshExchangeRate}
                          disabled={refreshingRate}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs uppercase tracking-wide transition-all active:scale-95 disabled:opacity-60 min-h-[44px]"
                        >
                          <RefreshCw className={`w-4 h-4 shrink-0 ${refreshingRate ? 'animate-spin' : ''}`} />
                          <span>{refreshingRate ? 'Actualizando…' : 'Actualizar ahora'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación, Contacto & Wi-Fi */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-emerald-400" />
                      3. Ubicación, Contacto & Wi-Fi para Huéspedes
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Dirección Completa</label>
                        <input
                          type="text"
                          value={propertySettings.location_address || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, location_address: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Teléfono / WhatsApp</label>
                        <input
                          type="text"
                          value={propertySettings.whatsapp_number || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, whatsapp_number: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Email Principal de Contacto</label>
                        <input
                          type="email"
                          value={propertySettings.contact_email || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, contact_email: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Correos de Socios (Notificaciones)</label>
                        <input
                          type="text"
                          placeholder="socio1@gmail.com, socio2@gmail.com"
                          value={propertySettings.partner_emails || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, partner_emails: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px]"
                        />
                      </div>
                    </div>

                    {/* Wi-Fi Huéspedes Configuration Sub-block */}
                    <div className="pt-3 border-t border-emerald-500/20">
                      <p className="text-[11px] text-emerald-300/80 mb-3">
                        📶 Configuración de Red Wi-Fi para el <strong>Pase Digital QR</strong> y las <strong>Plantillas de WhatsApp</strong>:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-emerald-300 mb-1">Nombre de Red Wi-Fi (SSID)</label>
                          <input
                            type="text"
                            placeholder="Ej: VillaMaria_Privada_5G"
                            value={propertySettings.wifi_ssid || ''}
                            onChange={(e) => setPropertySettings({ ...propertySettings, wifi_ssid: e.target.value })}
                            className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-emerald-300 mb-1">Contraseña del Wi-Fi</label>
                          <input
                            type="text"
                            placeholder="Ej: MorrocoySol2026!"
                            value={propertySettings.wifi_password || ''}
                            onChange={(e) => setPropertySettings({ ...propertySettings, wifi_password: e.target.value })}
                            className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Galería de Fotos */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                    <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-400" />
                      4. Galería de Fotos
                    </h4>

                    {/* Image Grid with Delete Option */}
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {(Array.isArray(propertySettings.gallery_images)
                        ? propertySettings.gallery_images
                        : typeof propertySettings.gallery_images === 'string'
                        ? (() => {
                            try {
                              return JSON.parse(propertySettings.gallery_images);
                            } catch {
                              return [];
                            }
                          })()
                        : []
                      ).map((imgUrl: any, idx: number) => {
                        const src = typeof imgUrl === 'string' ? imgUrl : imgUrl.url || imgUrl.imageUrl;
                        const cat = typeof imgUrl === 'object' && imgUrl ? imgUrl.category || 'exteriores' : 'exteriores';
                        return (
                          <div key={idx} className="relative rounded-xl overflow-hidden group border border-emerald-500/30 aspect-[4/3] bg-emerald-950">
                            <img src={src} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1.5">
                              <select
                                value={cat}
                                onChange={(e) => setGalleryImageCategory(idx, e.target.value)}
                                className="w-full text-[11px] rounded-lg px-1.5 py-1.5 bg-emerald-900 text-emerald-100 border border-emerald-500/40 font-semibold cursor-pointer min-h-[36px]"
                              >
                                <option value="fachada">Fachada & Porche 🏡</option>
                                <option value="piscina">Piscina & Jardines 🏊‍♂️</option>
                                <option value="interiores">Habitaciones & Salón 🛋️</option>
                                <option value="exteriores">Solo en "Todas"</option>
                              </select>
                            </div>
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
                              className="absolute top-2 right-2 min-w-[36px] min-h-[36px] flex items-center justify-center p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
                              title="Eliminar esta foto"
                              aria-label="Eliminar esta foto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Upload File Input */}
                    <div className="pt-2 border-t border-emerald-500/20 space-y-2.5">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        <label className="block text-xs font-semibold text-emerald-300">Subir Nueva Foto</label>
                        <select
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value)}
                          className="text-xs rounded-xl px-3 py-2 bg-emerald-900/50 text-emerald-100 border border-emerald-500/30 font-semibold min-h-[44px]"
                        >
                          <option value="fachada">Fachada & Porche 🏡</option>
                          <option value="piscina">Piscina & Jardines 🏊‍♂️</option>
                          <option value="interiores">Habitaciones & Salón 🛋️</option>
                          <option value="exteriores">Solo en "Todas"</option>
                        </select>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="text-xs text-emerald-300 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-emerald-950 hover:file:bg-emerald-400 cursor-pointer min-h-[44px] w-full max-w-full"
                      />
                    </div>
                  </div>

                  {/* 5. Servicios y Comodidades */}
                  <div className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-emerald-200 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        5. Servicios y Comodidades Incluidas
                      </h4>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetDefaultAmenities}
                          className="text-[11px] text-emerald-400/80 hover:text-emerald-300 underline font-medium"
                        >
                          Restaurar sugeridos
                        </button>
                      </div>
                    </div>

                    {/* Section Header Text Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-300 mb-1">Insignia / Badge Superior</label>
                        <input
                          type="text"
                          placeholder="Ej: ✨ Servicios de la Propiedad"
                          value={propertySettings.amenities_badge || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, amenities_badge: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-100 min-h-[40px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-300 mb-1">Título de la Sección</label>
                        <input
                          type="text"
                          placeholder="Ej: Comodidades Incluidas 🏡"
                          value={propertySettings.amenities_title || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, amenities_title: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-100 min-h-[40px]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-emerald-300 mb-1">Subtítulo Descriptivo</label>
                        <input
                          type="text"
                          placeholder="Ej: Instalaciones preparadas para tu máximo confort..."
                          value={propertySettings.amenities_subtitle || ''}
                          onChange={(e) => setPropertySettings({ ...propertySettings, amenities_subtitle: e.target.value })}
                          className="w-full bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-emerald-100 min-h-[40px]"
                        />
                      </div>
                    </div>

                    {/* Amenities List */}
                    <div className="space-y-3 pt-2">
                      {getAmenitiesList().map((item, idx) => {
                        const commonEmojis = ['📶', '🏊‍♂️', '🚗', '❄️', '🍖', '🍳', '⚡', '📺', '🚿', '🌴', '☕', '🧺', '✨'];
                        return (
                          <div
                            key={item.id || idx}
                            className="bg-emerald-950/60 border border-emerald-500/25 rounded-xl p-3 sm:p-4 space-y-2.5 transition-all hover:border-emerald-500/40"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                              {/* Emoji Picker / Input */}
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/30 rounded-xl p-1 shrink-0">
                                  <input
                                    type="text"
                                    value={item.emoji || '✨'}
                                    onChange={(e) => handleUpdateAmenity(idx, 'emoji', e.target.value)}
                                    className="w-9 h-9 text-center text-xl bg-transparent border-none text-white focus:outline-none"
                                    title="Escribe cualquier emoji"
                                  />
                                </div>
                                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none max-w-full">
                                  {commonEmojis.map((em) => (
                                    <button
                                      type="button"
                                      key={em}
                                      onClick={() => handleUpdateAmenity(idx, 'emoji', em)}
                                      className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                                        item.emoji === em
                                          ? 'bg-emerald-500 text-emerald-950 font-bold shadow'
                                          : 'hover:bg-emerald-800/60 text-emerald-200'
                                      }`}
                                    >
                                      {em}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteAmenity(idx)}
                                className="self-end sm:self-center flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 text-xs font-semibold transition-all min-h-[36px]"
                                title="Eliminar servicio"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 mb-0.5">
                                  Nombre del Servicio *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Planta Eléctrica 24/7"
                                  value={item.title || (item as any).name || ''}
                                  onChange={(e) => handleUpdateAmenity(idx, 'title', e.target.value)}
                                  className="w-full bg-emerald-900/50 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-emerald-400 min-h-[40px]"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 mb-0.5">
                                  Descripción para el Huésped *
                                </label>
                                <input
                                  type="text"
                                  placeholder="Ej: Generador automático para respaldo de energía continuo..."
                                  value={item.description || ''}
                                  onChange={(e) => handleUpdateAmenity(idx, 'description', e.target.value)}
                                  className="w-full bg-emerald-900/50 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 min-h-[40px]"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Amenity Button */}
                    <button
                      type="button"
                      onClick={handleAddAmenity}
                      className="w-full py-2.5 px-4 bg-emerald-900/50 hover:bg-emerald-800/80 border border-dashed border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-300 uppercase tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Agregar Nuevo Servicio / Comodidad</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold rounded-xl text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:from-emerald-400 hover:to-teal-300 transition-all min-h-[48px] flex items-center justify-center"
                  >
                    Guardar Todos los Cambios de Propiedad
                  </button>
                </form>
              )}

              {/* 6. EMAIL TEMPLATES & DIRECT SEND TAB */}
              {activeTab === 'templates' && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Select Template */}
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap overflow-x-auto pb-1.5 touch-pan-x">
                    {templates.map((tpl) => (
                      <button
                        key={tpl.code}
                        onClick={() => setSelectedTemplate(tpl)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all min-h-[44px] shrink-0 ${
                          selectedTemplate?.code === tpl.code
                            ? 'bg-emerald-500 text-emerald-950 font-bold shadow'
                            : 'bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800'
                        }`}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>

                  {selectedTemplate && (
                    <form onSubmit={handleSaveEmailTemplate} className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-emerald-300 mb-1">Asunto del Correo</label>
                        <input
                          type="text"
                          value={selectedTemplate.subject}
                          onChange={(e) => setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 focus:outline-none focus:border-emerald-400 min-h-[44px]"
                        />
                      </div>

                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-1.5">
                          <label className="block text-xs font-semibold text-emerald-300">
                            Cuerpo HTML de la Plantilla
                          </label>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-[10px] text-emerald-400/70 font-mono">Variables (toca para copiar):</span>
                            {selectedTemplate.variables?.split(',').map((v: string) => {
                              const trimmed = v.trim();
                              const isCopied = copiedVariable === trimmed;
                              return (
                                <button
                                  key={trimmed}
                                  type="button"
                                  onClick={() => handleCopyVariable(trimmed)}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-all flex items-center gap-1 min-h-[28px] ${
                                    isCopied
                                      ? 'bg-emerald-400 text-emerald-950 border-emerald-300 font-bold'
                                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900'
                                  }`}
                                  title="Copiar variable"
                                >
                                  {isCopied ? <Check className="w-3 h-3 shrink-0" /> : <Copy className="w-2.5 h-2.5 shrink-0 opacity-70" />}
                                  <span>{trimmed}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <textarea
                          rows={8}
                          value={selectedTemplate.bodyHtml}
                          onChange={(e) => setSelectedTemplate({ ...selectedTemplate, bodyHtml: e.target.value })}
                          className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-emerald-100 font-mono focus:outline-none focus:border-emerald-400 leading-relaxed min-h-[200px]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 text-emerald-950 font-bold rounded-xl text-xs hover:bg-emerald-400 transition-all min-h-[44px] flex items-center justify-center"
                      >
                        Guardar Plantilla
                      </button>
                    </form>
                  )}

                  {/* Send Manual Email Card */}
                  <form onSubmit={handleSendManualEmail} className="bg-emerald-900/30 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 space-y-3.5 sm:space-y-4">
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
                        className="bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px] focus:outline-none focus:border-emerald-400"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Asunto"
                        value={manualEmail.subject}
                        onChange={(e) => setManualEmail({ ...manualEmail, subject: e.target.value })}
                        className="bg-emerald-950 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-emerald-100 min-h-[44px] focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Mensaje HTML o Texto..."
                      value={manualEmail.bodyHtml}
                      onChange={(e) => setManualEmail({ ...manualEmail, bodyHtml: e.target.value })}
                      className="w-full bg-emerald-950 border border-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-emerald-100 min-h-[90px] focus:outline-none focus:border-emerald-400 leading-relaxed"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      <Send className="w-4 h-4 shrink-0" />
                      <span>Enviar Email Manual</span>
                    </button>
                  </form>
                </div>
              )}

              {/* 8. SMTP CONFIGURATION TAB */}
              {activeTab === 'smtp' && <SmtpSettingsSection />}
            </>
          )}
        </div>

        {/* Global Admin Manual Create Reservation Modal */}
        {isCreateModalOpen && (
          <AdminCreateReservationModal
            initialStartDate={new Date().toISOString().split('T')[0]}
            initialEndDate=""
            pricePerNight={propertySettings?.price_per_night ? Number(propertySettings.price_per_night) : 150}
            cleaningFee={propertySettings?.cleaning_fee ? Number(propertySettings.cleaning_fee) : 50}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={(newRes) => {
              setIsCreateModalOpen(false);
              handleShowAlert({ type: 'success', text: `✅ Reserva creada con éxito para ${newRes.guestName}.` });
              loadAllAdminData();
              if (onRefreshData) onRefreshData();
            }}
          />
        )}

        {/* Quick Predefined WhatsApp Modal */}
        {quickWaReservation && (
          <AdminWhatsAppQuickModal
            reservation={quickWaReservation}
            propertyAddress={propertySettings.location_address}
            mapsUrl={propertySettings.location_maps_link}
            wifiSsid={propertySettings.wifi_ssid}
            wifiPass={propertySettings.wifi_password}
            onClose={() => setQuickWaReservation(null)}
          />
        )}

        {/* Guest Check-in Pass / Voucher Modal */}
        {adminVoucherReservation && (
          <CheckInVoucherModal
            reservation={adminVoucherReservation}
            onClose={() => setAdminVoucherReservation(null)}
          />
        )}
      </div>
    </div>
  );
};
