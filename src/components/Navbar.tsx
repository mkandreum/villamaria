import React, { useState, useEffect } from 'react';
import { Home, Image as ImageIcon, Sparkles, Calendar, User, ShieldCheck, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import { useSite } from '../context/SiteContext';

const mobileTabs = [
  { id: 'hero', labelKey: 'txt_nav_home', Icon: Home },
  { id: 'gallery', labelKey: 'txt_nav_photos', Icon: ImageIcon },
  { id: 'amenities', labelKey: 'txt_nav_services', Icon: Sparkles },
  { id: 'booking', labelKey: 'txt_nav_dates', Icon: Calendar },
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
  hasBanner,
}) => {
  const { t, siteName } = useSite();
  const site = useSite();
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
      className={`fixed z-50 left-1/2 -translate-x-1/2 bottom-[calc(12px+env(safe-area-inset-bottom))] md:bottom-auto transition duration-300 ease-in-out w-max max-w-[calc(100%-16px)] md:w-[calc(100%-20px)] md:max-w-3xl lg:max-w-4xl ${
        hasBanner ? 'md:top-10' : 'md:top-4'
      } ${
        visible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'max-md:translate-y-0 md:-translate-y-24 md:opacity-0 md:pointer-events-none'
      }`}
    >
      {/* GLASSMORPHIC PILL CONTAINER */}
      <div
        className={`w-full px-1 py-1 md:px-3 md:py-2 rounded-full bg-white md:bg-[#1c1c1c]/15 backdrop-blur-xl border border-[#1c1c1c]/10 md:border-[#1c1c1c]/20 shadow-[0_10px_40px_rgba(27,59,54,0.22)] md:shadow-[0_8px_32px_rgba(27,59,54,0.18)] text-[#1c1c1c] flex items-center justify-between transition duration-300 ${
          scrolled ? 'md:bg-[#1c1c1c]/20 md:backdrop-blur-2xl md:border-[#1c1c1c]/30 shadow-lg' : ''
        }`}
      >
        {/* MOBILE NAVIGATION LAYOUT (< md screens): labelled tab bar */}
        <div className="flex md:hidden items-stretch justify-center">
          {mobileTabs.filter((tab) => site.isVisible(tab.id)).map(({ id, labelKey, Icon }) => {
            const label = t(labelKey);
            const active = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? 'page' : undefined}
                className="relative w-[58px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-full cursor-pointer active:scale-90 transition-transform"
              >
                {active && (
                  <motion.span
                    layoutId="mobile-tab-pill"
                    className="absolute inset-x-0 inset-y-0.5 rounded-full bg-[#1c1c1c]"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon className={`relative w-5 h-5 transition ${active ? 'text-white' : 'text-[#1c1c1c]/70'}`} />
                <span className={`relative text-[11px] font-bold leading-none transition ${active ? 'text-white' : 'text-[#1c1c1c]/70'}`}>
                  {label}
                </span>
              </button>
            );
          })}
          <button
            onClick={onAccountClick}
            className="relative w-[58px] min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-full cursor-pointer active:scale-90 transition-transform"
          >
            {currentUser?.role === 'ADMIN' ? (
              <ShieldCheck className="w-5 h-5 text-amber-700" />
            ) : (
              <User className="w-5 h-5 text-[#1c1c1c]/70" />
            )}
            <span className="text-[11px] font-bold leading-none text-[#1c1c1c]/70">
              {currentUser ? (currentUser.role === 'ADMIN' ? 'Admin' : t('txt_nav_mybookings')) : t('txt_nav_login_mobile')}
            </span>
          </button>
        </div>

        {/* DESKTOP / TABLET NAVIGATION LAYOUT (>= md screens) */}
        <div className="hidden md:flex items-center justify-between gap-3 w-full px-2">
          {/* Brand Logo & Name */}
          <button
            onClick={() => onNavigate('hero')}
            className="flex items-center gap-2.5 pl-1 shrink-0 group focus:outline-none cursor-pointer"
          >
            {site.logoUrl ? (
              <img src={site.logoUrl} alt="" className="w-9 h-9 rounded-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#1c1c1c] flex items-center justify-center text-white font-serif font-black text-sm group-hover:scale-105 transition-transform">
                {site.siteName.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-serif text-base font-bold tracking-tight text-[#1c1c1c] group-hover:text-emerald-800 transition max-w-[130px] xl:max-w-none truncate">
              {site.siteName}
            </span>
          </button>

          {/* Nav Items */}
          <div className="flex items-center gap-1 xl:gap-2">
            {[
              { id: 'hero', label: t('txt_nav_home'), icon: Home },
              { id: 'gallery', label: t('txt_nav_photos'), icon: ImageIcon },
              { id: 'amenities', label: t('txt_nav_services'), icon: Sparkles },
              { id: 'booking', label: t('txt_nav_book'), icon: Calendar },
            ].filter((item) => site.isVisible(item.id)).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  aria-label={item.label}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-2.5 xl:px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition duration-200 cursor-pointer ${
                    isActive ? 'text-white' : 'text-[#1c1c1c] hover:bg-[#1c1c1c]/10'
                  }`}
                >
                  {isActive && (
                    <motion.span layoutId="desktop-tab-pill" className="absolute inset-0 rounded-full bg-[#1c1c1c]" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />
                  )}
                  <span className="relative flex items-center gap-1.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
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
                    className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-600/40 text-amber-900 hover:bg-amber-500/30 flex items-center gap-1.5 text-xs font-bold transition shadow-sm cursor-pointer active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-800" />
                    <span><span className="xl:hidden">Admin</span><span className="hidden xl:inline">Admin Panel</span></span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenMyBookingsModal}
                    className="px-3.5 py-1.5 rounded-full bg-[#1c1c1c]/10 border border-[#1c1c1c]/20 text-[#1c1c1c] hover:bg-[#1c1c1c]/20 flex items-center gap-1.5 text-xs font-bold transition cursor-pointer active:scale-95"
                  >
                    <User className="w-4 h-4 text-[#1c1c1c]" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                  </button>
                )}
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="p-2 rounded-full text-[#1c1c1c]/70 hover:text-red-600 hover:bg-red-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-1.5 rounded-full bg-[#1c1c1c] text-white hover:bg-emerald-900 font-bold text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>{t('txt_nav_login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
