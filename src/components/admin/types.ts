import type React from 'react';
export interface AdminCtx {
  reservations: any[];
  blockedDates: any[];
  users: any[];
  reviews: any[];
  templates: any[];
  exchangeRate: any;
  settings: Record<string, any>;
  setSetting: (key: string, value: any) => void;
  notify: (type: 'success' | 'error', text: string) => void;
  confirm: (message: string, opts?: { confirmLabel?: string; danger?: boolean }) => Promise<boolean>;
  reload: () => Promise<void>;
  refreshPublic: () => void;
  goTab: (tab: 'today' | 'reservations' | 'calendar' | 'web' | 'more', sub?: string) => void;
  openCreate: (date?: string) => void;
  openMessages: (reservation: any) => void;
  openVoucher: (reservation: any) => void;
  setReviews: React.Dispatch<React.SetStateAction<any[]>>;
  setExchangeRate: (v: any) => void;
}
