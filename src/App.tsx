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
import { BookingFormModal } from './components/BookingFormModal';
import { BookingConfirmationModal } from './components/BookingConfirmationModal';
import { MyBookingsModal } from './components/MyBookingsModal';
const AdminModal = React.lazy(() => import('./components/AdminModal').then((m) => ({ default: m.AdminModal })));
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { PromoBanner } from './components/PromoBanner';
import { calculatePriceBreakdown } from './utils/dateUtils';
import { api, getAuthUser, setAuthToken, setAuthUser } from './api';
import { CurrencyProvider } from './context/CurrencyContext';
import { Reveal } from './components/Reveal';
import { Toast, ToastState } from './components/Toast';
import { StickyMobileBar } from './components/StickyMobileBar';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ThemeToggle } from './components/ThemeToggle';
import { ScrollProgress, Splash } from './components/Motion';
import { stripEmoji } from './utils/icons';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => getAuthUser());
  const [activeSection, setActiveSection] = useState('hero');
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = React.useCallback(() => setToast(null), []);

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

  const [loaded, setLoaded] = useState(false);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    loadPublicData().finally(() => setLoaded(true));
  }, []);

  // Scroll-spy: the section crossing the middle of the screen owns the tab.
  // A tap on the bar locks it to the destination until that scroll has finished.
  const navLock = React.useRef(false);
  const lastSpied = React.useRef('hero');

  useEffect(() => {
    const tabFor: Record<string, string> = { hero: 'hero', disponibilidad: 'booking', gallery: 'gallery', amenities: 'amenities' };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          lastSpied.current = tabFor[e.target.id] || '';
          if (!navLock.current) setActiveSection(lastSpied.current);
        });
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    document.querySelectorAll('main > section[id]').forEach((el) => io.observe(el));
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.7);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserBookings();
    }
  }, [currentUser]);

  const loadPublicData = async (): Promise<void> => {
    try {
      const [propRes, availRes] = await Promise.all([
        api.getPropertySettings().catch(() => ({ settings: {} })),
        api.getAvailability().catch(() => ({ reservations: [], blockedDates: [], googleCalendarEvents: [] })),
      ]);

      // Public copy is edited in the admin with emoji; the site draws icons instead
      const cleaned: Record<string, any> = {};
      for (const [k, v] of Object.entries(propRes.settings || {})) {
        cleaned[k] = typeof v === 'string' && !/^(https?:|\+?[\d\s()-]+$)/.test(v) && !/^[\[{]/.test(v) ? stripEmoji(v) : v;
      }
      setPropertySettings(cleaned);
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
    const el = document.getElementById(sectionId === 'booking' ? 'disponibilidad' : sectionId);
    if (!el) return;
    setActiveSection(sectionId);
    navLock.current = true;

    // Release once scrolling has been quiet for a moment; a finger on the screen ends it at once
    let quiet: number | undefined;
    const release = () => {
      window.clearTimeout(quiet);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', release);
      window.removeEventListener('wheel', release);
      navLock.current = false;
      setActiveSection(lastSpied.current);
    };
    const onScroll = () => {
      window.clearTimeout(quiet);
      quiet = window.setTimeout(release, 160);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', release, { passive: true });
    window.addEventListener('wheel', release, { passive: true });
    // A slow phone may take a moment to start the scroll, so the first wait is longer
    quiet = window.setTimeout(release, 700);

    el.scrollIntoView({ behavior: 'smooth' });
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

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const availableToday = ![...availability.reservations, ...availability.blockedDates].some((r: any) => {
    const st = String(r.startDate || '').slice(0, 10);
    const en = String(r.endDate || '').slice(0, 10);
    return st && en && st <= todayKey && todayKey < en;
  });
  const showSticky = pastHero && !isBookingModalOpen && (activeSection !== 'booking' || Boolean(checkIn && checkOut));

  const isBannerActive = propertySettings.banner_enabled !== 'false';

  return (
    <CurrencyProvider>
      <div className="min-h-screen bg-[#F8F5F0] text-[#1B3B36] font-sans antialiased selection:bg-emerald-500 selection:text-white pb-28 md:pb-0 overflow-x-clip">
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
            photoBadge={propertySettings.hero_photo_badge}
            feat1={propertySettings.hero_feat1}
            feat2={propertySettings.hero_feat2}
            feat3={propertySettings.hero_feat3}
            feat4={propertySettings.hero_feat4}
          />
        </section>

        {/* Live Reservation Calendar */}
        <section id="disponibilidad"><Reveal>
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
        </Reveal></section>

        {/* Photo Gallery */}
        <section id="gallery"><Reveal>
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
        </Reveal></section>

        {/* Amenities */}
        <section id="amenities"><Reveal>
          <AmenitiesSection
            amenities={propertySettings.amenities}
            badge={propertySettings.amenities_badge}
            title={propertySettings.amenities_title}
            subtitle={propertySettings.amenities_subtitle}
          />
        </Reveal></section>

        {/* Location */}
        <section id="location"><Reveal>
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
        </Reveal></section>

        {/* Local Attractions */}
        <section id="attractions"><Reveal>
          <AttractionsSection attractions={propertySettings.attractions} />
        </Reveal></section>

        {/* Testimonials & Reviews */}
        <section id="reviews"><Reveal>
          <ReviewsSection reviews={propertySettings.reviews} />
        </Reveal></section>
      </main>

      <Splash ready={loaded} />
      <ScrollProgress />
      <StickyMobileBar
        visible={showSticky}
        checkIn={checkIn}
        checkOut={checkOut}
        totalPrice={liveBreakdown.totalPrice}
        nights={liveBreakdown.nights}
        pricePerNight={pricePerNight}
        onOpenBooking={() => setIsBookingModalOpen(true)}
        onScrollToCalendar={() => handleNavigate('booking')}
      />
      <FloatingWhatsApp
        phone={propertySettings.whatsapp_number || propertySettings.contact_phone}
        availableToday={loaded && availableToday}
        raised={showSticky}
      />
      <ThemeToggle />
      <Toast toast={toast} onDismiss={dismissToast} />

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
          paymentZelle={propertySettings.payment_zelle_enabled !== false && propertySettings.payment_zelle_enabled !== 'false'}
          paymentPagoMovil={propertySettings.payment_pago_movil_enabled !== false && propertySettings.payment_pago_movil_enabled !== 'false'}
          paymentEfectivo={propertySettings.payment_efectivo_enabled !== false && propertySettings.payment_efectivo_enabled !== 'false'}
          paymentTransferencia={propertySettings.payment_transferencia_enabled !== false && propertySettings.payment_transferencia_enabled !== 'false'}
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
              setToast({ type: 'error', message: err.message || 'Error al crear la reserva.' });
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
          address={propertySettings.location_address}
          mapsUrl={propertySettings.location_maps_link}
          wifiSsid={propertySettings.wifi_ssid}
          wifiPass={propertySettings.wifi_password}
          hostPhone={propertySettings.whatsapp_number || propertySettings.contact_phone}
          onClose={() => setLastSubmittedBooking(null)}
        />
      )}

      {/* Client My Bookings Modal */}
      {isMyBookingsModalOpen && (
        <MyBookingsModal
          bookings={myBookings}
          propertyAddress={propertySettings.location_address}
          mapsUrl={propertySettings.location_maps_link}
          wifiSsid={propertySettings.wifi_ssid}
          wifiPass={propertySettings.wifi_password}
          hostPhone={propertySettings.whatsapp_number || propertySettings.contact_phone}
          onClose={() => setIsMyBookingsModalOpen(false)}
          onCancelBooking={async (id: string) => {
            try {
              await api.updateReservationStatus(id, { status: 'CANCELLED' });
              loadUserBookings();
              loadPublicData();
            } catch (err: any) {
              setToast({ type: 'error', message: err.message || 'Error al cancelar la reserva.' });
            }
          }}
        />
      )}

      {/* Admin Management Hub Modal */}
      {isAdminModalOpen && (
        <React.Suspense fallback={null}>
        <AdminModal
          onClose={() => setIsAdminModalOpen(false)}
          onRefreshData={() => {
            loadPublicData();
            if (currentUser) loadUserBookings();
          }}
        />
        </React.Suspense>
      )}
      </div>
    </CurrencyProvider>
  );
}
