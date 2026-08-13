import React, { useState, useEffect } from 'react';
import { Home, Image as ImageIcon, Sparkles, Calendar, User, ShieldCheck, LogOut } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  currentUser: { name: string; role: 'ADMIN' | 'CLIENT'; email: string } | null;
  onOpenLoginModal: () => void;
  onOpenMyBookingsModal: () => void;
  onOpenAdminModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  currentUser,
  onOpenLoginModal,
  onOpenMyBookingsModal,
  onOpenAdminModal,
  onLogout,
}) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      aria-label="Navegación flotante principal"
      className="fixed z-50 left-1/2 -translate-x-1/2 bottom-4 md:bottom-auto md:top-4 w-[92%] max-w-sm md:max-w-2xl transition-all duration-300"
    >
      {/* GLASSMORPHIC PILL CONTAINER */}
      <div
        className={`w-full px-3 py-2 rounded-full bg-emerald-950/85 backdrop-blur-xl border border-emerald-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-emerald-100 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-emerald-950/95 border-emerald-400/40 shadow-emerald-950/80' : ''
        }`}
      >
        {/* MOBILE NAVIGATION LAYOUT (< md screens) */}
        {/* 5 Equal Targets: [Fotos] [Servicios] [ VM (Inicio) - CENTRO ] [Reservar] [Acceder/User] */}
        <div className="flex md:hidden items-center justify-between w-full px-1">
          {/* 1. Fotos */}
          <button
            onClick={() => onNavigate('gallery')}
            title="Fotos"
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
              activeSection === 'gallery'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-emerald-950 shadow-md shadow-emerald-500/30 scale-105'
                : 'text-emerald-300/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* 2. Servicios */}
          <button
            onClick={() => onNavigate('amenities')}
            title="Servicios"
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
              activeSection === 'amenities'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-emerald-950 shadow-md shadow-emerald-500/30 scale-105'
                : 'text-emerald-300/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* 3. VM / INICIO (BOTÓN CENTRAL FUSIONADO - HACE LA FUNCIÓN DE HOME) */}
          <button
            onClick={() => onNavigate('hero')}
            title="Inicio - Villa María"
            className={`relative w-11 h-11 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-xl ${
              activeSection === 'hero'
                ? 'bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-500 text-emerald-950 font-black shadow-emerald-400/60 scale-110 ring-2 ring-emerald-300'
                : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-emerald-950 font-bold shadow-emerald-600/30'
            }`}
          >
            <span className="font-serif text-xs font-black tracking-tighter leading-none">VM</span>
            <Home className="w-3 h-3 text-emerald-950 mt-0.5" />
          </button>

          {/* 4. Reservar */}
          <button
            onClick={() => onNavigate('booking')}
            title="Reservar"
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 ${
              activeSection === 'booking'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-emerald-950 shadow-md shadow-emerald-500/30 scale-105'
                : 'text-emerald-300/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </button>

          {/* 5. ACCEDER / USER / ADMIN (UN SOLO ICONO CIRCULAR LIMPIO) */}
          {currentUser ? (
            currentUser.role === 'ADMIN' ? (
              <button
                onClick={onOpenAdminModal}
                title="Panel de Administración"
                className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </button>
            ) : (
              <button
                onClick={onOpenMyBookingsModal}
                title="Mis Reservas"
                className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              >
                <User className="w-5 h-5" />
              </button>
            )
          ) : (
            <button
              onClick={onOpenLoginModal}
              title="Iniciar Sesión"
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-emerald-950 flex items-center justify-center transition-all active:scale-90 shadow-md shadow-emerald-500/30"
            >
              <User className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* DESKTOP / TABLET NAVIGATION LAYOUT (>= md screens) */}
        <div className="hidden md:flex items-center justify-between w-full px-2">
          {/* Brand Logo & Name */}
          <button
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-2.5 pl-1 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-emerald-950 font-serif font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              VM
            </div>
            <span className="font-serif text-base font-bold tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              Villa María
            </span>
          </button>

          {/* Nav Items */}
          <div className="flex items-center space-x-1.5">
            {[
              { id: 'hero', label: 'Inicio', icon: Home },
              { id: 'gallery', label: 'Fotos', icon: ImageIcon },
              { id: 'amenities', label: 'Servicios', icon: Sparkles },
              { id: 'booking', label: 'Reservar', icon: Calendar },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'text-emerald-200/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'ADMIN' ? (
                  <button
                    onClick={onOpenAdminModal}
                    className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Panel</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenMyBookingsModal}
                    className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/30 flex items-center gap-1.5 text-xs font-bold transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-2 rounded-full text-emerald-300/70 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-emerald-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-300 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Acceder</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
