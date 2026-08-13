import React, { useState, useEffect } from 'react';
import { Palmtree, Calendar, MapPin, Shield, Sparkles, Menu, X, UserCheck, BookmarkCheck } from 'lucide-react';
import { PROPERTY_INFO } from '../data/mockData';

interface NavbarProps {
  onOpenBookingModal: () => void;
  onOpenMyBookings: () => void;
  onOpenAdmin: () => void;
  isAdminMode: boolean;
  activeBookingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBookingModal,
  onOpenMyBookings,
  onOpenAdmin,
  isAdminMode,
  activeBookingsCount,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Disponibilidad', href: '#disponibilidad' },
    { name: 'Galería', href: '#galeria' },
    { name: 'Comodidades', href: '#comodidades' },
    { name: 'Ubicación (Calle 15)', href: '#ubicacion' },
    { name: 'Opiniones', href: '#opiniones' },
    { name: 'Preguntas', href: '#faq' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#1B3B36]/10 shadow-sm py-3'
          : 'bg-[#F8F5F0]/80 backdrop-blur-sm border-b border-[#1B3B36]/10 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#1B3B36] text-[#F8F5F0] p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
              <Palmtree className="w-5 h-5 text-[#C17D5C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.15em] uppercase text-[#1B3B36] group-hover:text-[#C17D5C] transition-colors">
                  {PROPERTY_INFO.name}
                </span>
                <span className="bg-[#C17D5C]/15 text-[#C17D5C] text-[10px] font-sans tracking-widest uppercase font-semibold px-2 py-0.5 rounded-full border border-[#C17D5C]/30">
                  Chichiriviche
                </span>
              </div>
              <p className="text-[10px] font-sans uppercase tracking-widest text-[#1B3B36]/60 hidden sm:block">
                Calle 15 (c15) • Casa de Playa & Piscina
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-sans text-xs uppercase tracking-widest font-medium text-[#1B3B36]/80 hover:text-[#C17D5C] transition-colors py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Actions & Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* My Bookings Button */}
            <button
              onClick={onOpenMyBookings}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#EAE3D8] hover:bg-[#1B3B36] hover:text-[#F8F5F0] border border-[#1B3B36]/15 text-[#1B3B36] text-xs font-sans uppercase tracking-wider font-medium transition-colors"
              title="Ver mis reservas"
            >
              <BookmarkCheck className="w-4 h-4 text-[#C17D5C]" />
              <span>Mis Reservas</span>
              {activeBookingsCount > 0 && (
                <span className="bg-[#C17D5C] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeBookingsCount}
                </span>
              )}
            </button>

            {/* Admin Switch */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-sans uppercase tracking-wider font-medium transition-all ${
                isAdminMode
                  ? 'bg-[#C17D5C]/20 text-[#1B3B36] border-[#C17D5C]/40'
                  : 'bg-[#1B3B36]/5 text-[#1B3B36]/70 border-[#1B3B36]/15 hover:text-[#1B3B36]'
              }`}
              title="Panel de Administración / Anfitrión"
            >
              <Shield className="w-3.5 h-3.5 text-[#C17D5C]" />
              <span>{isAdminMode ? 'Modo Anfitrión' : 'Anfitrión'}</span>
            </button>

            {/* CTA Reserve Button */}
            <button
              onClick={onOpenBookingModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1B3B36] hover:bg-[#C17D5C] text-[#F8F5F0] font-sans text-xs uppercase tracking-[0.15em] font-bold shadow-md transition-all transform active:scale-95"
            >
              <Calendar className="w-4 h-4" />
              <span>Reservar Ahora</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenBookingModal}
              className="px-3 py-1.5 rounded-full bg-[#1B3B36] text-[#F8F5F0] font-sans text-xs uppercase tracking-wider font-bold"
            >
              Reservar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full bg-[#EAE3D8] text-[#1B3B36] hover:bg-[#1B3B36] hover:text-[#F8F5F0] transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#F8F5F0] border-b border-[#1B3B36]/15 px-4 py-4 space-y-3 mt-2 shadow-xl animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#1B3B36]/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMyBookings();
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#EAE3D8] text-[#1B3B36] text-xs font-sans uppercase tracking-wider font-medium"
            >
              <BookmarkCheck className="w-4 h-4 text-[#C17D5C]" />
              <span>Mis Reservas ({activeBookingsCount})</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-[#EAE3D8] text-[#1B3B36] text-xs font-sans uppercase tracking-wider font-medium"
            >
              <Shield className="w-4 h-4 text-[#C17D5C]" />
              <span>Panel Anfitrión</span>
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs uppercase tracking-widest font-medium text-[#1B3B36] hover:text-[#C17D5C] py-2 px-3 rounded-lg hover:bg-[#EAE3D8]"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
