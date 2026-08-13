// Centralized API Client for Villa María Backend

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('villamaria_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('villamaria_token', token);
  } else {
    localStorage.removeItem('villamaria_token');
  }
}

export function getAuthUser(): any | null {
  const data = localStorage.getItem('villamaria_user');
  return data ? JSON.parse(data) : null;
}

export function setAuthUser(user: any | null): void {
  if (user) {
    localStorage.setItem('villamaria_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('villamaria_user');
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      setAuthToken(null);
      setAuthUser(null);
    }
    throw new Error(data.error || data.message || `Error HTTP ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Property
  getPropertySettings: () => request('/property'),
  updatePropertySettings: (settings: any) => request('/admin/property', { method: 'PUT', body: JSON.stringify(settings) }),

  // Uploads
  uploadFile: async (file: File) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al subir la imagen');
    return data;
  },

  // Reservations
  getAvailability: () => request('/reservations/availability'),
  createReservation: (bookingData: any) => request('/reservations', { method: 'POST', body: JSON.stringify(bookingData) }),
  getMyBookings: () => request('/reservations/my-bookings'),

  // Admin
  getDashboardMetrics: () => request('/admin/dashboard'),
  getAdminReservations: () => request('/admin/reservations'),
  updateReservationStatus: (id: string, payload: { status: string; internalNotes?: string }) =>
    request(`/admin/reservations/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteReservation: (id: string) => request(`/admin/reservations/${id}`, { method: 'DELETE' }),
  confirmPayment: (id: string) => request(`/admin/reservations/${id}/confirm-payment`, { method: 'POST' }),
  rescheduleReservation: (id: string, payload: { newStartDate: string; newEndDate: string; additionalCost: boolean; additionalCostAmount: number }) =>
    request(`/admin/reservations/${id}/reschedule`, { method: 'POST', body: JSON.stringify(payload) }),
  getAdminUsers: () => request('/admin/users'),

  // Blocked Dates
  getBlockedDates: () => request('/admin/blocked-dates'),
  addBlockedDate: (payload: { startDate: string; endDate: string; reason?: string }) =>
    request('/admin/blocked-dates', { method: 'POST', body: JSON.stringify(payload) }),
  deleteBlockedDate: (id: string) => request(`/admin/blocked-dates/${id}`, { method: 'DELETE' }),

  // Email Templates
  getEmailTemplates: () => request('/admin/email-templates'),
  updateEmailTemplate: (code: string, payload: { subject: string; bodyHtml: string }) =>
    request(`/admin/email-templates/${code}`, { method: 'PUT', body: JSON.stringify(payload) }),
  sendManualEmail: (payload: { to: string; subject: string; bodyHtml: string }) =>
    request('/admin/send-email', { method: 'POST', body: JSON.stringify(payload) }),

  // SMTP GUI
  getSmtpSettings: () => request('/admin/smtp'),
  saveSmtpSettings: (payload: any) => request('/admin/smtp', { method: 'POST', body: JSON.stringify(payload) }),
  testSmtpConnection: (payload: any) => request('/admin/smtp/test-connection', { method: 'POST', body: JSON.stringify(payload) }),
  sendTestEmail: (payload: any) => request('/admin/smtp/test-email', { method: 'POST', body: JSON.stringify(payload) }),

  // Reviews (public)
  getPublicReviews: () => request('/reviews'),
  submitReview: (payload: { author: string; location?: string; rating: number; comment: string }) =>
    request('/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  // Reviews (admin)
  getAdminReviews: () => request('/admin/reviews'),
  toggleReviewVisible: (id: string, visible: boolean) =>
    request(`/admin/reviews/${id}/visible`, { method: 'PATCH', body: JSON.stringify({ visible }) }),
  deleteReview: (id: string) => request(`/admin/reviews/${id}`, { method: 'DELETE' }),
};
