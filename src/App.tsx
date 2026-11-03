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
const BookingFormModal = React.lazy(() => import('./components/BookingFormModal').then((m) => ({ default: m.BookingFormModal })));
const BookingConfirmationModal = React.lazy(() => import('./components/BookingConfirmationModal').then((m) => ({ default: m.BookingConfirmationModal })));
const MyBookingsModal = React.lazy(() => import('./components/MyBookingsModal').then((m) => ({ default: m.MyBookingsModal })));
const AdminModal = React.lazy(() => import('./components/AdminModal').then((m) => ({ default: m.AdminModal })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
import { Footer } from './components/Footer';
import { HouseRulesAndFAQ } from './components/HouseRulesAndFAQ';
import { PromoBanner } from './components/PromoBanner';
import { calculatePriceBreakdown } from './utils/dateUtils';
import { api, getAuthUser, setAuthToken, setAuthUser } from './api';
import { CurrencyProvider } from './context/CurrencyContext';
import { SiteProvider, orderedSections, hiddenSections } from './context/SiteContext';
import { Reveal } from './components/Reveal';
import { Toast, ToastState } from './components/Toast';
import { StickyMobileBar } from './components/StickyMobileBar';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ScrollProgress } from './components/Motion';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { stripEmoji } from './utils/icons';

/** Lets a modal fade out when it closes; opening is handled by .modal-backdrop in the stylesheet. */
const ModalExit: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div className="relative z-50" exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: 'easeIn' }}>
    {children}
  </motion.div>
);

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(() => getAuthUser());
  const [activeSection, setActiveSection] = useState('hero');
  const [toast, setToast] = useState<ToastState | null>(null);
  const dismissToast = React.useCallback(() => setToast(null), []);

  // Dynamic Property Settings & Availability from Database
  const [propertySettings, setPropertySettings] = useState<any>(() => {
    // Last saved settings paint the first frame; the fresh copy replaces them when it arrives
    try { return JSON.parse(localStorage.getItem('vm-settings') || '{}'); } catch { return {}; }
  });
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
      try { localStorage.setItem('vm-settings', JSON.stringify(cleaned)); } catch {}
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

  const pricePerNight = Number(propertySettings.price_per_night) || 0;
  const cleaningFee = Number(propertySettings.cleaning_fee) || 0;

  const mockPricing: PricingConfig = {
    baseNightlyRate: pricePerNight,
    weekendRate: pricePerNight,
    cleaningFee: cleaningFee,
    currency: '€',
  };

  const liveBreakdown = calculatePriceBreakdown(checkIn, checkOut, adults, childrenCount, mockPricing);

  useEffect(() => {
    const s = propertySettings;
    const setMeta = (sel: string, attr: string, key: string, value: string) => {
      if (!value) return;
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', value);
    };
    const title = String(s.seo_title || '').trim();
    const desc = String(s.seo_description || '').trim();
    const image = String(s.seo_image || '').trim();
    if (title) document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image);
  }, [propertySettings]);

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const availableToday = ![...availability.reservations, ...availability.blockedDates].some((r: any) => {
    const st = String(r.startDate || '').slice(0, 10);
    const en = String(r.endDate || '').slice(0, 10);
    return st && en && st <= todayKey && todayKey < en;
  });
  const showSticky = pastHero && !isBookingModalOpen && (activeSection !== 'booking' || Boolean(checkIn && checkOut));

  const isOff = (v: any) => v === false || v === 'false';
  const isBannerActive = !isOff(propertySettings.banner_enabled);
  const showWeather = !isOff(propertySettings.weather_enabled);
  const bannerItems = (() => {
    const raw = propertySettings.banner_items;
    if (Array.isArray(raw)) return raw;
    try { return typeof raw === 'string' ? JSON.parse(raw) : []; } catch { return []; }
  })();

  const sectionOrder = orderedSections(propertySettings.sections_order);
  const hiddenIds = hiddenSections(propertySettings.sections_hidden);
  const sections: Record<string, React.ReactNode> = {
    disponibilidad: (
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
    ),
    gallery: (
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
    ),
    amenities: (
        <section id="amenities">
          <AmenitiesSection
            amenities={propertySettings.amenities}
            badge={propertySettings.amenities_badge}
            title={propertySettings.amenities_title}
            subtitle={propertySettings.amenities_subtitle}
          />
        </section>
    ),
    location: (
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
    ),
    attractions: (
        <section id="attractions">
          <AttractionsSection
            attractions={propertySettings.attractions}
            title={propertySettings.attractions_title}
            subtitle={propertySettings.attractions_subtitle}
          />
        </section>
    ),
    faq: (
        <HouseRulesAndFAQ
          rules={propertySettings.house_rules}
          cancellationPolicy={propertySettings.cancellation_policy}
          faqs={propertySettings.faqs}
          title={propertySettings.faq_title}
          subtitle={propertySettings.faq_subtitle}
        />
    ),
    reviews: (
        <section id="reviews">
          <ReviewsSection reviews={propertySettings.reviews} />
        </section>
    ),
  };

  return (
    <SiteProvider settings={propertySettings}>
    <CurrencyProvider>
      <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#efeeea] text-[#1c1c1c] font-sans antialiased selection:bg-emerald-500 selection:text-white pb-28 md:pb-0 overflow-x-clip">
      {/* Top Announcement Promo Banner */}
      <PromoBanner enabled={isBannerActive} text={propertySettings.banner_text} items={bannerItems} />

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
            rating={propertySettings.hero_rating}
            reviewsCount={propertySettings.hero_reviews_count}
            priceLabel={propertySettings.hero_price_label}
            whatsappGreeting={propertySettings.whatsapp_greeting}
            showWeather={showWeather}
          />
        </section>

        {sectionOrder.filter((id) => !hiddenIds.includes(id)).map((id) => (
          <React.Fragment key={id}>
            {sections[id]}
          </React.Fragment>
        ))}
      </main>

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
      <Toast toast={toast} onDismiss={dismissToast} />

      {/* Footer */}
      <Footer
        address={propertySettings.location_address}
        phone={propertySettings.contact_phone}
        email={propertySettings.contact_email}
        mapsLink={propertySettings.location_maps_link}
        description={propertySettings.footer_description}
        tagline={propertySettings.footer_tagline}
      />

      <React.Suspense fallback={null}>
      {/* Auth Modal */}
      <AnimatePresence>
      {isAuthModalOpen && (
        <ModalExit key="AuthModal">
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            loadUserBookings();
          }}
        />
        </ModalExit>
      )}
      </AnimatePresence>

      {/* Booking Form Modal */}
      <AnimatePresence>
      {isBookingModalOpen && (
        <ModalExit key="BookingFormModal">
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
        </ModalExit>
      )}
      </AnimatePresence>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
      {lastSubmittedBooking && (
        <ModalExit key="BookingConfirmationModal">
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
        </ModalExit>
      )}
      </AnimatePresence>

      {/* Client My Bookings Modal */}
      <AnimatePresence>
      {isMyBookingsModalOpen && (
        <ModalExit key="MyBookingsModal">
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
              await api.cancelMyBooking(id);
              setToast({ type: 'success', message: 'Reserva cancelada.' });
              loadUserBookings();
              loadPublicData();
            } catch (err: any) {
              setToast({ type: 'error', message: err.message || 'Error al cancelar la reserva.' });
            }
          }}
        />
        </ModalExit>
      )}
      </AnimatePresence>

      {/* Admin Management Hub Modal */}
      <AnimatePresence>
      {isAdminModalOpen && (
        <ModalExit key="AdminModal">
        <AdminModal
          onClose={() => setIsAdminModalOpen(false)}
          onRefreshData={() => {
            loadPublicData();
            if (currentUser) loadUserBookings();
          }}
        />
        </ModalExit>
      )}
      </AnimatePresence>
      </React.Suspense>
      </div>
      </MotionConfig>
    </CurrencyProvider>
    </SiteProvider>
  );
}
