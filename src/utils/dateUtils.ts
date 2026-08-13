import { Booking, PricingConfig } from '../types';

export function parseISO(dateStr: string): Date {
  if (!dateStr) return new Date();
  const cleanStr = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
  const [year, month, day] = cleanStr.split('-').map(Number);
  if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  }
  return new Date(year, month - 1, day);
}

export function formatISO(date: Date): string {
  if (!date || isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateSpanish(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (isNaN(date.getTime())) return '';
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
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
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

  return (bookings || []).some((b) => {
    if (b.status === 'cancelled') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;

    const bCheckIn = b.checkIn || b.startDate || '';
    const bCheckOut = b.checkOut || b.endDate || '';
    if (!bCheckIn || !bCheckOut) return false;

    const bStart = parseISO(bCheckIn).getTime();
    const bEnd = parseISO(bCheckOut).getTime();

    return candStart < bEnd && candEnd > bStart;
  });
}

/**
 * Checks if a specific date (YYYY-MM-DD) falls inside any booked range
 */
export function isDateBooked(dateStr: string, bookings: Booking[]): boolean {
  const checkTime = parseISO(dateStr).getTime();
  return (bookings || []).some((b) => {
    if (b.status === 'cancelled') return false;
    const bCheckIn = b.checkIn || b.startDate || '';
    const bCheckOut = b.checkOut || b.endDate || '';
    if (!bCheckIn || !bCheckOut) return false;

    const bStart = parseISO(bCheckIn).getTime();
    const bEnd = parseISO(bCheckOut).getTime();
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
  pricing?: PricingConfig
): PriceBreakdown {
  const safePricing: PricingConfig = {
    baseNightlyRate: pricing?.baseNightlyRate ? Number(pricing.baseNightlyRate) : 150,
    weekendRate: pricing?.weekendRate ? Number(pricing.weekendRate) : (pricing?.baseNightlyRate ? Number(pricing.baseNightlyRate) : 150),
    cleaningFee: pricing?.cleaningFee !== undefined ? Number(pricing.cleaningFee) : 50,
    securityDeposit: pricing?.securityDeposit !== undefined ? Number(pricing.securityDeposit) : 0,
    baseGuests: pricing?.baseGuests !== undefined ? Number(pricing.baseGuests) : 4,
    extraGuestFee: pricing?.extraGuestFee !== undefined ? Number(pricing.extraGuestFee) : 0,
    discountWeeklyPercent: pricing?.discountWeeklyPercent !== undefined ? Number(pricing.discountWeeklyPercent) : 0,
    currency: pricing?.currency || '€',
  };

  const totalGuests = (adults || 1) + (children || 0);
  const nights = calculateNights(checkIn, checkOut);

  if (nights <= 0) {
    return {
      nights: 0,
      weekdayNights: 0,
      weekendNights: 0,
      baseNightsSubtotal: 0,
      extraGuests: 0,
      extraGuestsSubtotal: 0,
      cleaningFee: safePricing.cleaningFee,
      discountAmount: 0,
      discountPercent: 0,
      subtotal: 0,
      totalPrice: 0,
      securityDeposit: safePricing.securityDeposit,
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
      baseNightsSubtotal += safePricing.weekendRate;
    } else {
      weekdayNights++;
      baseNightsSubtotal += safePricing.baseNightlyRate;
    }
  }

  // Extra guest fee
  const extraGuests = Math.max(0, totalGuests - safePricing.baseGuests);
  const extraGuestsSubtotal = extraGuests * safePricing.extraGuestFee * nights;

  let discountPercent = 0;
  if (nights >= 7) {
    discountPercent = safePricing.discountWeeklyPercent;
  }

  const subtotalBeforeDiscount = baseNightsSubtotal + extraGuestsSubtotal;
  const discountAmount = Math.round((subtotalBeforeDiscount * discountPercent) / 100);
  const subtotal = subtotalBeforeDiscount - discountAmount;
  const totalPrice = subtotal + safePricing.cleaningFee;

  return {
    nights,
    weekdayNights,
    weekendNights,
    baseNightsSubtotal,
    extraGuests,
    extraGuestsSubtotal,
    cleaningFee: safePricing.cleaningFee,
    discountAmount,
    discountPercent,
    subtotal,
    totalPrice: isNaN(totalPrice) ? 0 : totalPrice,
    securityDeposit: safePricing.securityDeposit,
  };
}
