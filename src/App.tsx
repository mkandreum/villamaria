import React, { useState, useEffect } from 'react';
import { Booking, PricingConfig } from './types';
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
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { PromoBanner } from './components/PromoBanner';
import { calculatePriceBreakdown } from './utils/dateUtils';
import { api, getAuthUser, setAuthToken, setAuthUser } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => getAuthUser());
  const [activeSection, setActiveSection] = useState('hero');

  // Dynamic Property Settings & Availability from Database
  const [propertySettings, setPropertySettings] = useState<any>({});
  const [availability, setAvailability] = useState<{ reservations: any[]; blockedDates: any[]; googleCalendarEvents: any[] }>({
    reservations: [],
    blockedDates: [],
    googleCalendarEvents: [],
  });

  // Client Bookings
  const [myBookings, setMyBookings] = useState<any[]>([]);

  // Selection state
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [lastSubmittedBooking, setLastSubmittedBooking] = useState<any | null>(null);
  const [isMyBookingsModalOpen, setIsMyBookingsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    loadPublicData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserBookings();
    }
  }, [currentUser]);

  const loadPublicData = async () => {
    try {
      const [propRes, availRes] = await Promise.all([
        api.getPropertySettings().catch(() => ({ settings: {} })),
        api.getAvailability().catch(() => ({ reservations: [], blockedDates: [], googleCalendarEvents: [] })),
      ]);

      setPropertySettings(propRes.settings || {});
      setAvailability(availRes);
    } catch (err) {
      console.error('Error cargando datos públicos:', err);
    }
  };

  const loadUserBookings = async () => {
    try {
      const res = await api.getMyBookings();
      setMyBookings(res.bookings || []);
    } catch (err) {
      setAuthToken(null);
      setAuthUser(null);
      setCurrentUser(null);
      setMyBookings([]);
    }
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'booking') {
      const el = document.getElementById('disponibilidad');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setAuthUser(null);
    setCurrentUser(null);
  };

  const pricePerNight = propertySettings.price_per_night ? Number(propertySettings.price_per_night) : 150;
  const cleaningFee = propertySettings.cleaning_fee ? Number(propertySettings.cleaning_fee) : 50;

  const mockPricing: PricingConfig = {
    baseNightlyRate: pricePerNight,
    weekendRate: pricePerNight,
    cleaningFee: cleaningFee,
    currency: '€',
  };

  const liveBreakdown = calculatePriceBreakdown(checkIn, checkOut, adults, childrenCount, mockPricing);

  const isBannerActive = propertySettings.banner_enabled !== 'false';

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1B3B36] font-sans antialiased selection:bg-emerald-500 selection:text-white pb-20 md:pb-0 overflow-x-hidden">
      {/* Top Announcement Promo Banner */}
      <PromoBanner enabled={isBannerActive} text={propertySettings.banner_text} />

      {/* Floating Pill Navigation */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsAuthModalOpen(true)}
        onOpenMyBookingsModal={() => setIsMyBookingsModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onLogout={handleLogout}
        hasBanner={isBannerActive}
      />

      {/* Main Sections */}
      <main className="relative">
        <section id="hero">
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
            onSearch={() => handleNavigate('booking')}
            title={propertySettings.property_title}
            subtitle={propertySettings.property_subtitle}
            description={propertySettings.property_description}
            pricePerNight={pricePerNight}
            whatsappNumber={propertySettings.whatsapp_number}
            images={propertySettings.gallery_images}
          />
        </section>

        {/* Live Reservation Calendar */}
        <section id="disponibilidad">
          <BookingCalendar
            checkIn={checkIn}
            checkOut={checkOut}
            adults={adults}
            childrenCount={childrenCount}
            bookings={availability.reservations}
            pricing={mockPricing}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            onAdultsChange={setAdults}
            onChildrenChange={setChildrenCount}
            onInitiateBooking={() => setIsBookingModalOpen(true)}
          />
        </section>

        {/* Photo Gallery */}
        <section id="gallery">
          <GallerySection
            images={propertySettings.gallery_images}
            badge={propertySettings.gallery_badge}
            title={propertySettings.gallery_title}
            subtitle={propertySettings.gallery_subtitle}
            cat1Label={propertySettings.gallery_cat1}
            cat2Label={propertySettings.gallery_cat2}
            cat3Label={propertySettings.gallery_cat3}
            cat4Label={propertySettings.gallery_cat4}
          />
        </section>

        {/* Amenities */}
        <section id="amenities">
          <AmenitiesSection
            amenities={propertySettings.amenities}
            badge={propertySettings.amenities_badge}
            title={propertySettings.amenities_title}
            subtitle={propertySettings.amenities_subtitle}
          />
        </section>

        {/* Location */}
        <section id="location">
          <LocationSection
            badge={propertySettings.location_badge}
            title={propertySettings.location_title}
            subtitle={propertySettings.location_subtitle}
            address={propertySettings.location_address}
            description={propertySettings.location_description}
            mapsLink={propertySettings.location_maps_link}
            embedUrl={propertySettings.location_embed_url}
            bullet1={propertySettings.location_bullet_1}
            bullet2={propertySettings.location_bullet_2}
            bullet3={propertySettings.location_bullet_3}
          />
        </section>

        {/* Local Attractions */}
        <section id="attractions">
          <AttractionsSection attractions={propertySettings.attractions} />
        </section>

        {/* Testimonials & Reviews */}
        <section id="reviews">
          <ReviewsSection reviews={propertySettings.reviews} />
        </section>

        {/* House Rules & FAQ */}
        <section id="faq">
          <HouseRulesAndFAQ rules={propertySettings.house_rules} cancellationPolicy={propertySettings.cancellation_policy} />
        </section>
      </main>

      {/* Footer */}
      <Footer
        address={propertySettings.location_address}
        phone={propertySettings.contact_phone}
        email={propertySettings.contact_email}
        mapsLink={propertySettings.location_maps_link}
      />

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            loadUserBookings();
          }}
        />
      )}

      {/* Booking Form Modal */}
      {isBookingModalOpen && (
        <BookingFormModal
          checkIn={checkIn}
          checkOut={checkOut}
          adults={adults}
          childrenCount={childrenCount}
          pricing={mockPricing}
          onClose={() => setIsBookingModalOpen(false)}
          onSubmitBooking={async (formData: any) => {
            try {
              const res = await api.createReservation({
                guestName: formData.guestName,
                guestEmail: formData.guestEmail,
                guestPhone: formData.guestPhone,
                startDate: checkIn,
                endDate: checkOut,
                guestsCount: adults + childrenCount,
                notes: formData.notes,
              });

              setIsBookingModalOpen(false);
              setLastSubmittedBooking(res.reservation);
              loadPublicData();
              if (currentUser) loadUserBookings();
            } catch (err: any) {
              alert(err.message || 'Error al crear la reserva.');
            }
          }}
        />
      )}

      {/* Booking Confirmation Modal */}
      {lastSubmittedBooking && (
        <BookingConfirmationModal
          booking={{
            id: lastSubmittedBooking.id,
            guestName: lastSubmittedBooking.guestName,
            guestEmail: lastSubmittedBooking.guestEmail,
            guestPhone: lastSubmittedBooking.guestPhone,
            checkIn: lastSubmittedBooking.startDate,
            checkOut: lastSubmittedBooking.endDate,
            adults,
            children: childrenCount,
            totalPrice: lastSubmittedBooking.totalPrice,
            status: 'confirmed',
            createdAt: lastSubmittedBooking.createdAt,
            paymentMethod: 'transferencia',
          }}
          onClose={() => setLastSubmittedBooking(null)}
        />
      )}

      {/* Client My Bookings Modal */}
      {isMyBookingsModalOpen && (
        <MyBookingsModal
          bookings={myBookings}
          onClose={() => setIsMyBookingsModalOpen(false)}
          onCancelBooking={async (id: string) => {
            try {
              await api.updateReservationStatus(id, { status: 'CANCELLED' });
              loadUserBookings();
              loadPublicData();
            } catch (err: any) {
              alert(err.message || 'Error al cancelar la reserva.');
            }
          }}
        />
      )}

      {/* Admin Management Hub Modal */}
      {isAdminModalOpen && (
        <AdminModal
          onClose={() => setIsAdminModalOpen(false)}
          onRefreshData={() => {
            loadPublicData();
            if (currentUser) loadUserBookings();
          }}
        />
      )}
    </div>
  );
}
