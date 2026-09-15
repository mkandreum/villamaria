import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw, Send, ShieldAlert, Key } from 'lucide-react';
import { api } from '../../api';

export const SmtpSettingsSection: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    user: '',
    password: '',
    fromEmail: '',
    fromName: 'Villa María Reservas',
    security: 'STARTTLS',
    replyTo: '',
  });

  const [testTargetEmail, setTestTargetEmail] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    loadSmtpSettings();
  }, []);

  const loadSmtpSettings = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const data = await api.getSmtpSettings();
      if (data.configured && data.settings) {
        setIsConfigured(true);
        setFormData({
          host: data.settings.host || 'smtp.gmail.com',
          port: data.settings.port || 587,
          user: data.settings.user || '',
          password: '********',
          fromEmail: data.settings.fromEmail || '',
          fromName: data.settings.fromName || 'Villa María Reservas',
          security: data.settings.security || 'STARTTLS',
          replyTo: data.settings.replyTo || '',
        });
        setTestTargetEmail(data.settings.fromEmail || '');
        setUpdatedAt(data.settings.updatedAt);
      } else {
        setIsConfigured(false);
      }
    } catch (err: any) {
      console.error('Error cargando SMTP:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await api.saveSmtpSettings(formData);
      setStatusMessage({ type: 'success', text: res.message || 'Configuración SMTP guardada correctamente.' });
      setIsConfigured(true);
      setFormData((prev) => ({ ...prev, password: '********' }));
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al guardar la configuración SMTP.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setStatusMessage(null);
    try {
      const res = await api.testSmtpConnection(formData);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error durante la prueba de conexión.' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testTargetEmail) {
      setStatusMessage({ type: 'error', text: 'Por favor, introduce un correo electrónico para la prueba.' });
      return;
    }
    setSendingTestEmail(true);
    setStatusMessage(null);
    try {
      const res = await api.sendTestEmail({ ...formData, targetEmail: testTargetEmail });
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al enviar el email de prueba.' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-emerald-300">
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Cargando configuración SMTP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-900/40 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-emerald-100 flex items-center gap-2 flex-wrap">
              Configuración de Servidor SMTP
              {isConfigured ? (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Activo
                </span>
              ) : (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">
                  No configurado
                </span>
              )}
            </h3>
            <p className="text-xs text-emerald-300/70 mt-0.5">
              Gestiona el servidor de envío de correos sin necesidad de reiniciar la aplicación.
            </p>
          </div>
        </div>

        {updatedAt && (
          <span className="text-[11px] text-emerald-400/60 font-mono">
            Actualizado: {new Date(updatedAt).toLocaleString('es-ES')}
          </span>
        )}
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/80 border-red-500/40 text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          )}
          <span className="break-words">{statusMessage.text}</span>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSave} className="bg-emerald-950/60 border border-emerald-500/20 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-5">
          {/* Host */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Servidor SMTP (Host)</label>
            <input
              type="text"
              required
              placeholder="smtp.gmail.com"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Port */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Puerto</label>
            <input
              type="number"
              required
              placeholder="587"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value, 10) || 587 })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          {/* User */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Usuario SMTP / Correo de envío</label>
            <input
              type="text"
              required
              placeholder="ejemplo@gmail.com"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1 flex items-center justify-between">
              <span>Contraseña SMTP</span>
              <span className="text-[10px] text-emerald-400/60 font-normal flex items-center gap-1">
                <Key className="w-3 h-3" /> Cifrado AES-256 en BD
              </span>
            </label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          {/* From Name */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Nombre del Remitente</label>
            <input
              type="text"
              required
              placeholder="Villa María Reservas"
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          {/* From Email */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Email Remitente (From)</label>
            <input
              type="email"
              required
              placeholder="reservas@villamaria.com"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            />
          </div>

          {/* Security */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Tipo de Seguridad</label>
            <select
              value={formData.security}
              onChange={(e) => setFormData({ ...formData, security: e.target.value as any })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            >
              <option value="STARTTLS" className="bg-emerald-950 text-emerald-100">
                STARTTLS (Puerto 587 - Recomendado)
              </option>
              <option value="TLS" className="bg-emerald-950 text-emerald-100">
                SSL / TLS (Puerto 465)
              </option>
              <option value="NONE" className="bg-emerald-950 text-emerald-100">
                Sin Cifrado (Puerto 25)
              </option>
            </select>
          </div>

          {/* Reply To */}
          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Dirección de Respuesta (Reply-To opcional)</label>
            <input
              type="email"
              placeholder="contacto@villamaria.com"
              value={formData.replyTo}
              onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testingConnection}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 min-h-[44px]"
          >
            {testingConnection ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Verificando...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Probar Conexión SMTP</span>
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 text-xs font-bold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Guardar Configuración SMTP</span>
            )}
          </button>
        </div>
      </form>

      {/* Test Email Card */}
      <div className="bg-emerald-950/60 border border-emerald-500/20 rounded-2xl p-4 sm:p-6 space-y-3.5 sm:space-y-4">
        <h4 className="text-xs sm:text-sm font-bold text-emerald-100 flex items-center gap-2">
          <Send className="w-4 h-4 text-emerald-400" />
          Enviar Email de Prueba
        </h4>
        <p className="text-xs text-emerald-300/70">
          Introduce una dirección de correo para verificar el envío de un mensaje de prueba en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <input
            type="email"
            placeholder="destinatario@ejemplo.com"
            value={testTargetEmail}
            onChange={(e) => setTestTargetEmail(e.target.value)}
            className="w-full sm:flex-1 px-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-xs sm:text-sm min-h-[44px]"
          />
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={sendingTestEmail || !testTargetEmail}
            className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md min-h-[44px]"
          >
            {sendingTestEmail ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Email de Prueba</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
