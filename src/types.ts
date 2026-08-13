export interface Booking {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  adults: number;
  children: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'blocked_by_owner' | 'cancelled';
  createdAt: string;
  specialRequests?: string;
  paymentMethod: 'zelle' | 'pago_movil' | 'efectivo' | 'transferencia';
}

export interface Amenity {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'confort' | 'instalaciones' | 'seguridad' | 'servicios';
  highlighted?: boolean;
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  category: 'exteriores' | 'piscina' | 'habitaciones' | 'sala_cocina' | 'entorno';
  description?: string;
}

export interface Review {
  id: string;
  author: string;
  date: string;
  rating: number;
  comment: string;
  location: string;
  avatarUrl?: string;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  travelTime: string;
  imageUrl: string;
  tag: string;
  locationQuery: string;
}

export interface PricingConfig {
  baseNightlyRate: number; // USD per night
  weekendRate: number; // USD for Fri/Sat nights
  cleaningFee: number; // USD fixed
  securityDeposit: number; // USD refundable
  maxGuests: number;
  extraGuestFee: number; // USD per person per night above baseGuests
  baseGuests: number;
  discountWeeklyPercent: number; // 7+ nights discount %
}
