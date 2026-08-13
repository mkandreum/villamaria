import React, { useState, useEffect } from 'react';
import { Booking, PricingConfig } from './types';
import { INITIAL_BOOKINGS, INITIAL_PRICING } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BookingCalendar } from './components/BookingCalendar';
import { GallerySection } from './components/GallerySection';
import { AmenitiesSection } from './components/AmenitiesSection';
import { LocationSection } from './components/LocationSection';
import { AttractionsSection } from './components/AttractionsSection';
import { ReviewsSection } from './components/ReviewsSection';
import { HouseRulesAndFAQ } from './components/HouseRulesAndFAQ';
import { BookingFormModal } from './components/BookingFormModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { MyBookingsModal } from './components/MyBookingsModal';
import { AdminModal } from './components/AdminModal';
import { Footer } from './components/Footer';
import { StickyMobileBar } from './components/StickyMobileBar';
import { calculatePriceBreakdown } from './utils/dateUtils';

export default function App() {
  // Persistence state
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('villa_maria_bookings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading bookings from localStorage', e);
    }
    return INITIAL_BOOKINGS;
  });

  const [pricing, setPricing] = useState<PricingConfig>(() => {
    try {
      const saved = localStorage.getItem('villa_maria_pricing');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading pricing from localStorage', e);
    }
    return INITIAL_PRICING;
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('villa_maria_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.error('Error saving bookings to localStorage', e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('villa_maria_pricing', JSON.stringify(pricing));
    } catch (e) {
      console.error('Error saving pricing to localStorage', e);
    }
  }, [pricing]);

  // Date selection state
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [adults, setAdults] = useState<number>(4);
  const [childrenCount, setChildrenCount] = useState<number>(2);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [lastSubmittedBooking, setLastSubmittedBooking] = useState<Booking | null>(null);
  const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Search trigger from Hero
  const handleHeroSearch = () => {
    const el = document.getElementById('disponibilidad');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handlers for bookings
  const handleInitiateBooking = () => {
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona las fechas de llegada y salida en el calendario.');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    setIsBookingModalOpen(false);
    setLastSubmittedBooking(newBooking);
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleAddBlockDates = (start: string, end: string, reason: string) => {
    const blockedBooking: Booking = {
      id: `BLOCK-${Math.floor(1000 + Math.random() * 9000)}`,
      guestName: reason || 'Bloqueo por el Propietario',
      guestEmail: 'admin@villamaria.com',
      guestPhone: 'Propietario',
      checkIn: start,
      checkOut: end,
      adults: 0,
      children: 0,
      totalPrice: 0,
      status: 'blocked_by_owner',
      createdAt: new Date().toISOString().split('T')[0],
      paymentMethod: 'efectivo',
    };
    setBookings((prev) => [blockedBooking, ...prev]);
  };

  const handleUpdatePricing = (newPricing: PricingConfig) => {
    setPricing(newPricing);
  };

  const userActiveBookingsCount = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  ).length;

  const liveBreakdown = calculatePriceBreakdown(checkIn, checkOut, adults, childrenCount, pricing);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1B3B36] font-sans antialiased selection:bg-[#C17D5C] selection:text-white pb-20 sm:pb-0">
      {/* Navigation Header */}
      <Navbar
        onOpenBookingModal={() => {
          if (!checkIn || !checkOut) {
            handleHeroSearch();
          } else {
            setIsBookingModalOpen(true);
          }
        }}
        onOpenMyBookings={() => setIsMyBookingsModalOpen(true)}
        onOpenAdmin={() => {
          setIsAdminModalOpen(true);
          setIsAdminMode(true);
        }}
        isAdminMode={isAdminMode}
        activeBookingsCount={userActiveBookingsCount}
      />

      {/* Main Sections */}
      <main>
        {/* Hero Section */}
        <Hero
          checkIn={checkIn}
          checkOut={checkOut}
          guests={adults + childrenCount}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
          onGuestsChange={(total) => {
            setAdults(Math.max(1, total));
            setChildrenCount(0);
          }}
          onSearch={handleHeroSearch}
        />

        {/* Live Reservation Calendar & Price Calculator */}
        <BookingCalendar
          checkIn={checkIn}
          checkOut={checkOut}
          adults={adults}
          childrenCount={childrenCount}
          bookings={bookings}
          pricing={pricing}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
          onAdultsChange={setAdults}
          onChildrenChange={setChildrenCount}
          onInitiateBooking={handleInitiateBooking}
        />

        {/* Photo Gallery & Lightbox */}
        <GallerySection />

        {/* Amenities & Property Specs */}
        <AmenitiesSection />

        {/* Location & Google Maps Link Integration */}
        <LocationSection />

        {/* Morrocoy Tourist Attractions */}
        <AttractionsSection />

        {/* Guest Testimonials & Review Submission */}
        <ReviewsSection />

        {/* House Rules & Accordion FAQ */}
        <HouseRulesAndFAQ />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Bar for Quick Booking & WhatsApp */}
      <StickyMobileBar
        checkIn={checkIn}
        checkOut={checkOut}
        totalPrice={liveBreakdown.totalPrice}
        nights={liveBreakdown.nights}
        onOpenBooking={() => setIsBookingModalOpen(true)}
        onScrollToCalendar={handleHeroSearch}
      />

      {/* Modals */}
      {isBookingModalOpen && (
        <BookingFormModal
          checkIn={checkIn}
          checkOut={checkOut}
          adults={adults}
          childrenCount={childrenCount}
          pricing={pricing}
          onClose={() => setIsBookingModalOpen(false)}
          onSubmitBooking={handleSubmitBooking}
        />
      )}

      {lastSubmittedBooking && (
        <BookingConfirmationModal
          booking={lastSubmittedBooking}
          onClose={() => setLastSubmittedBooking(null)}
        />
      )}

      {isMyBookingsModalOpen && (
        <MyBookingsModal
          bookings={bookings}
          onClose={() => setIsMyBookingsModalOpen(false)}
          onCancelBooking={handleCancelBooking}
        />
      )}

      {isAdminModalOpen && (
        <AdminModal
          bookings={bookings}
          pricing={pricing}
          onClose={() => setIsAdminModalOpen(false)}
          onAddBlockDates={handleAddBlockDates}
          onDeleteBooking={handleDeleteBooking}
          onUpdatePricing={handleUpdatePricing}
        />
      )}
    </div>
  );
}
