import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { api, setAuthToken, setAuthUser } from '../api';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const data = await api.register({ email, password, name, phone });
        setAuthToken(data.token);
        setAuthUser(data.user);
        onSuccess(data.user);
      } else {
        const data = await api.login({ email, password });
        setAuthToken(data.token);
        setAuthUser(data.user);
        onSuccess(data.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-emerald-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-emerald-950 border border-emerald-500/30 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-emerald-100 font-sans">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-emerald-900/60 text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-emerald-950 flex items-center justify-center font-bold text-lg mx-auto mb-3 shadow-lg shadow-emerald-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-white">
            {isRegister ? 'Crear Cuenta de Cliente' : 'Acceso a Villa María'}
          </h3>
          <p className="text-xs text-emerald-300/70 mt-1">
            {isRegister
              ? 'Regístrate para gestionar tus reservas y consultar tu historial'
              : 'Accede con tu cuenta (el sistema detectará si eres Cliente o Administrador)'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1">Nombre Completo</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-emerald-500/60" />
                <input
                  type="text"
                  required
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-emerald-500/60" />
              <input
                type="email"
                required
                placeholder="tuemail@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-emerald-500/60" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-sm"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-emerald-300 mb-1">Teléfono (opcional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-3 text-emerald-500/60" />
                <input
                  type="tel"
                  placeholder="+34 600 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-emerald-900/40 border border-emerald-500/30 rounded-xl text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-emerald-400 text-sm"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</span>
            )}
          </button>
        </form>

        <div className="mt-5 text-center border-t border-emerald-500/20 pt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium"
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate gratis'}
          </button>
        </div>
      </div>
    </div>
  );
};
