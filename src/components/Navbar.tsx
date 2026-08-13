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

  const navItems = [
    { id: 'hero', label: 'Inicio', icon: Home },
    { id: 'gallery', label: 'Fotos', icon: ImageIcon },
    { id: 'amenities', label: 'Servicios', icon: Sparkles },
    { id: 'booking', label: 'Reservar', icon: Calendar },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed z-50 left-1/2 -translate-x-1/2 bottom-3 md:bottom-auto md:top-4 w-[96%] max-w-lg md:max-w-2xl transition-all duration-300"
    >
      <div
        className={`flex items-center justify-between px-2 sm:px-3 py-1.5 rounded-full bg-emerald-950/90 backdrop-blur-lg border border-emerald-500/30 shadow-2xl shadow-black/50 text-emerald-100 transition-all duration-300 ${
          scrolled ? 'bg-emerald-950/95 border-emerald-500/40' : ''
        }`}
      >
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('hero')}
          className="flex items-center gap-1.5 pl-1 pr-1 py-1 rounded-full hover:opacity-80 transition-opacity focus:outline-none shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-300 flex items-center justify-center text-emerald-950 font-bold text-xs shadow-md">
            VM
          </div>
          <span className="hidden md:inline font-serif text-sm font-semibold tracking-wide text-white">
            Villa María
          </span>
        </button>

        {/* Navigation Items */}
        <div className="flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onNavigate(item.id)}
                className={`min-w-[40px] sm:min-w-[44px] min-h-[44px] px-2 sm:px-3 py-1.5 rounded-full flex items-center justify-center gap-1.5 text-xs font-medium transition-all duration-200 focus:outline-none ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-emerald-950 font-bold shadow-md'
                    : 'text-emerald-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-1">
              {currentUser.role === 'ADMIN' ? (
                <button
                  onClick={onOpenAdminModal}
                  title="Panel Admin"
                  className="min-w-[40px] min-h-[44px] px-2.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 flex items-center gap-1 text-xs font-medium transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              ) : (
                <button
                  onClick={onOpenMyBookingsModal}
                  title="Mis Reservas"
                  className="min-w-[40px] min-h-[44px] px-2.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 flex items-center gap-1 text-xs font-medium transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
                </button>
              )}
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="min-w-[36px] min-h-[44px] p-2 rounded-full text-emerald-300/70 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLoginModal}
              className="min-w-[40px] min-h-[44px] px-2.5 sm:px-3.5 py-1.5 rounded-full bg-emerald-500 text-emerald-950 hover:bg-emerald-400 flex items-center gap-1 text-xs font-bold transition-all shadow-md"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Acceder</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
