import React, { useState, useEffect } from 'react';
import { Home, Image as ImageIcon, Sparkles, Calendar, User, ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

const mobileTabs = [
  { id: 'hero', label: 'Inicio', Icon: Home },
  { id: 'gallery', label: 'Fotos', Icon: ImageIcon },
  { id: 'amenities', label: 'Servicios', Icon: Sparkles },
  { id: 'booking', label: 'Fechas', Icon: Calendar },
];

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
  const onAccountClick = () => {
    if (!currentUser) onOpenLoginModal();
    else if (currentUser.role === 'ADMIN') onOpenAdminModal();
    else onOpenMyBookingsModal();
  };

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
      className={`fixed z-50 left-0 right-0 bottom-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-auto transition-all duration-300 ease-in-out w-full md:w-[calc(100%-20px)] md:max-w-3xl lg:max-w-4xl ${
        hasBanner ? 'md:top-10' : 'md:top-4'
      } ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'max-md:translate-y-0 md:-translate-y-24 md:opacity-0 md:pointer-events-none'
      }`}
    >
      {/* GLASSMORPHIC PILL CONTAINER */}
      <div
        className={`w-full px-1.5 pt-1.5 pb-[max(env(safe-area-inset-bottom),6px)] md:px-3 md:py-2 max-md:rounded-t-3xl max-md:bg-[#F8F5F0]/90 md:rounded-full md:bg-[#1B3B36]/15 backdrop-blur-xl border border-[#1B3B36]/20 max-md:border-b-0 shadow-[0_-8px_32px_rgba(27,59,54,0.12)] md:shadow-[0_8px_32px_rgba(27,59,54,0.18)] text-[#1B3B36] flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'md:bg-[#1B3B36]/20 md:backdrop-blur-2xl md:border-[#1B3B36]/30 shadow-lg' : ''
        }`}
      >
        {/* MOBILE NAVIGATION LAYOUT (< md screens): labelled tab bar */}
        <div className="flex md:hidden items-stretch justify-around w-full">
          {mobileTabs.map(({ id, label, Icon }) => {
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className="relative flex-1 min-h-[56px] flex flex-col items-center justify-center gap-0.5 rounded-2xl cursor-pointer active:scale-90 transition-transform"
              >
                {active && (
                  <motion.span
                    layoutId="mobile-tab-pill"
                    className="absolute inset-x-2 inset-y-1 rounded-2xl bg-[#1B3B36]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className={`relative w-5 h-5 transition-colors ${active ? 'text-white' : 'text-[#1B3B36]/70'}`} />
                <span className={`relative text-[11px] font-bold leading-none transition-colors ${active ? 'text-white' : 'text-[#1B3B36]/70'}`}>
                  {label}
                </span>
              </button>
            );
          })}
          <button
            onClick={onAccountClick}
            className="relative flex-1 min-h-[56px] flex flex-col items-center justify-center gap-0.5 rounded-2xl cursor-pointer active:scale-90 transition-transform"
          >
            {currentUser?.role === 'ADMIN' ? (
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            ) : (
              <User className="w-5 h-5 text-[#1B3B36]/70" />
            )}
            <span className="text-[11px] font-bold leading-none text-[#1B3B36]/70">
              {currentUser ? (currentUser.role === 'ADMIN' ? 'Admin' : 'Mis reservas') : 'Entrar'}
            </span>
          </button>
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
