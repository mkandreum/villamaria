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
  hasBanner?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
  currentUser,
  onOpenLoginModal,
  onOpenMyBookingsModal,
  onOpenAdminModal,
  onLogout,
  hasBanner = true,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;

      // Always visible near the top
      if (currentY < 60) {
        setVisible(true);
        setScrolled(false);
        lastY = currentY;
        return;
      }

      setScrolled(true);

      const diff = currentY - lastY;
      // Threshold to avoid micro-scroll jitter
      if (Math.abs(diff) > 6) {
        if (diff > 0) {
          // Scrolling down -> hide
          setVisible(false);
        } else {
          // Scrolling up -> show
          setVisible(true);
        }
        lastY = currentY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      aria-label="Navegación flotante principal"
      className={`fixed z-50 left-1/2 -translate-x-1/2 bottom-3 md:bottom-auto transition-all duration-300 ease-in-out w-[calc(100%-20px)] max-w-sm sm:max-w-md md:max-w-3xl lg:max-w-4xl ${
        hasBanner ? 'md:top-10' : 'md:top-4'
      } ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-24 opacity-0 pointer-events-none md:-translate-y-24'
      }`}
    >
      {/* GLASSMORPHIC PILL CONTAINER */}
      <div
        className={`w-full px-2 sm:px-3 py-2 rounded-full bg-[#1B3B36]/15 backdrop-blur-xl border border-[#1B3B36]/20 shadow-[0_8px_32px_rgba(27,59,54,0.18)] text-[#1B3B36] flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'bg-[#1B3B36]/20 backdrop-blur-2xl border-[#1B3B36]/30 shadow-lg' : ''
        }`}
      >
        {/* MOBILE NAVIGATION LAYOUT (< md screens) */}
        <div className="flex md:hidden items-center justify-around w-full gap-1">
          {/* 1. Fotos */}
          <button
            onClick={() => onNavigate('gallery')}
            title="Fotos"
            className={`relative min-w-[44px] min-h-[44px] rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              activeSection === 'gallery'
                ? 'bg-[#1B3B36] text-white shadow-md font-bold scale-105'
                : 'text-[#1B3B36] hover:text-emerald-900 hover:bg-[#1B3B36]/10'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* 2. Servicios */}
          <button
            onClick={() => onNavigate('amenities')}
            title="Servicios"
            className={`relative min-w-[44px] min-h-[44px] rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              activeSection === 'amenities'
                ? 'bg-[#1B3B36] text-white shadow-md font-bold scale-105'
                : 'text-[#1B3B36] hover:text-emerald-900 hover:bg-[#1B3B36]/10'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* 3. VM (CENTRAL - INICIO) */}
          <button
            onClick={() => onNavigate('hero')}
            title="Inicio - Villa María"
            className={`relative min-w-[46px] min-h-[46px] rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 shadow-md ${
              activeSection === 'hero'
                ? 'bg-[#1B3B36] text-white font-black shadow-emerald-950/40 scale-105 ring-2 ring-emerald-600'
                : 'bg-gradient-to-tr from-[#1B3B36] to-emerald-800 text-white font-bold shadow-sm'
            }`}
          >
            <span className="font-serif text-sm font-black tracking-tighter text-white">VM</span>
          </button>

          {/* 4. Reservar */}
          <button
            onClick={() => onNavigate('booking')}
            title="Reservar"
            className={`relative min-w-[44px] min-h-[44px] rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              activeSection === 'booking'
                ? 'bg-[#1B3B36] text-white shadow-md font-bold scale-105'
                : 'text-[#1B3B36] hover:text-emerald-900 hover:bg-[#1B3B36]/10'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </button>

          {/* 5. ACCEDER / USER / ADMIN */}
          {currentUser ? (
            currentUser.role === 'ADMIN' ? (
              <button
                onClick={onOpenAdminModal}
                title="Panel de Administración"
                className="min-w-[44px] min-h-[44px] rounded-full bg-amber-500/20 border border-amber-600/40 text-amber-900 flex items-center justify-center transition-all active:scale-90 shadow-sm"
              >
                <ShieldCheck className="w-5 h-5 text-amber-800" />
              </button>
            ) : (
              <button
                onClick={onOpenMyBookingsModal}
                title="Mis Reservas"
                className="min-w-[44px] min-h-[44px] rounded-full bg-[#1B3B36]/10 border border-[#1B3B36]/20 text-[#1B3B36] flex items-center justify-center transition-all active:scale-90 shadow-sm"
              >
                <User className="w-5 h-5 text-[#1B3B36]" />
              </button>
            )
          ) : (
            <button
              onClick={onOpenLoginModal}
              title="Iniciar Sesión"
              className="min-w-[44px] min-h-[44px] rounded-full bg-[#1B3B36] text-white flex items-center justify-center transition-all active:scale-90 shadow-md"
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
            className="flex items-center gap-2.5 pl-1 group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-[#1B3B36] flex items-center justify-center text-white font-serif font-black text-sm shadow-md group-hover:scale-105 transition-transform">
              VM
            </div>
            <span className="font-serif text-base font-bold tracking-tight text-[#1B3B36] group-hover:text-emerald-800 transition-colors">
              Villa María
            </span>
          </button>

          {/* Nav Items */}
          <div className="flex items-center space-x-1 sm:space-x-2">
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
                  className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#1B3B36] text-white shadow-md font-bold'
                      : 'text-[#1B3B36] hover:text-emerald-900 hover:bg-[#1B3B36]/10'
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
                    className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-600/40 text-amber-900 hover:bg-amber-500/30 flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span>Admin Panel</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenMyBookingsModal}
                    className="px-3.5 py-1.5 rounded-full bg-[#1B3B36]/10 border border-[#1B3B36]/20 text-[#1B3B36] hover:bg-[#1B3B36]/20 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  >
                    <User className="w-4 h-4 text-[#1B3B36]" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-2 rounded-full text-[#1B3B36]/70 hover:text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-1.5 rounded-full bg-[#1B3B36] text-white hover:bg-emerald-900 font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
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
