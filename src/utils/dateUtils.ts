import { Booking, PricingConfig } from '../types';

export function parseISO(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateSpanish(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Checks if candidate range [checkIn, checkOut] overlaps with any active booking
 */
export function isRangeOccupied(
  checkIn: string,
  checkOut: string,
  bookings: Booking[],
  excludeBookingId?: string
): boolean {
  if (!checkIn || !checkOut) return false;
  const candStart = parseISO(checkIn).getTime();
  const candEnd = parseISO(checkOut).getTime();

  return bookings.some((b) => {
    if (b.status === 'cancelled') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;

    const bStart = parseISO(b.checkIn).getTime();
    const bEnd = parseISO(b.checkOut).getTime();

    // Overlap condition: start < bEnd AND end > bStart
    return candStart < bEnd && candEnd > bStart;
  });
}

/**
 * Checks if a specific date (YYYY-MM-DD) falls inside any booked range
 */
export function isDateBooked(dateStr: string, bookings: Booking[]): boolean {
  const checkTime = parseISO(dateStr).getTime();
  return bookings.some((b) => {
    if (b.status === 'cancelled') return false;
    const bStart = parseISO(b.checkIn).getTime();
    const bEnd = parseISO(b.checkOut).getTime();
    // Night is occupied if checkTime is between bStart and bEnd - 1 day
    return checkTime >= bStart && checkTime < bEnd;
  });
}

export interface PriceBreakdown {
  nights: number;
  weekdayNights: number;
  weekendNights: number;
  baseNightsSubtotal: number;
  extraGuests: number;
  extraGuestsSubtotal: number;
  cleaningFee: number;
  discountAmount: number;
  discountPercent: number;
  subtotal: number;
  totalPrice: number;
  securityDeposit: number;
}

export function calculatePriceBreakdown(
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  pricing: PricingConfig
): PriceBreakdown {
  const totalGuests = adults + children;
  const nights = calculateNights(checkIn, checkOut);

  if (nights <= 0) {
    return {
      nights: 0,
      weekdayNights: 0,
      weekendNights: 0,
      baseNightsSubtotal: 0,
      extraGuests: 0,
      extraGuestsSubtotal: 0,
      cleaningFee: pricing.cleaningFee,
      discountAmount: 0,
      discountPercent: 0,
      subtotal: 0,
      totalPrice: 0,
      securityDeposit: pricing.securityDeposit,
    };
  }

  let weekdayNights = 0;
  let weekendNights = 0;
  let baseNightsSubtotal = 0;

  const start = parseISO(checkIn);
  for (let i = 0; i < nights; i++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + i);
    const dayOfWeek = cur.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      weekendNights++;
      baseNightsSubtotal += pricing.weekendRate;
    } else {
      weekdayNights++;
      baseNightsSubtotal += pricing.baseNightlyRate;
    }
  }

  // Extra guest fee
  const extraGuests = Math.max(0, totalGuests - pricing.baseGuests);
  const extraGuestsSubtotal = extraGuests * pricing.extraGuestFee * nights;

  let discountPercent = 0;
  if (nights >= 7) {
    discountPercent = pricing.discountWeeklyPercent;
  }

  const subtotalBeforeDiscount = baseNightsSubtotal + extraGuestsSubtotal;
  const discountAmount = Math.round((subtotalBeforeDiscount * discountPercent) / 100);
  const subtotal = subtotalBeforeDiscount - discountAmount;
  const totalPrice = subtotal + pricing.cleaningFee;

  return {
    nights,
    weekdayNights,
    weekendNights,
    baseNightsSubtotal,
    extraGuests,
    extraGuestsSubtotal,
    cleaningFee: pricing.cleaningFee,
    discountAmount,
    discountPercent,
    subtotal,
    totalPrice,
    securityDeposit: pricing.securityDeposit,
  };
}
