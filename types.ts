export enum DomainStatus {
  OWNED = 'OWNED',
  BACKORDER = 'BACKORDER',
  WATCHLIST = 'WATCHLIST',
  EXPIRED = 'EXPIRED'
}

export interface Domain {
  id: string;
  name: string;
  registrar: string;
  registrationDate: string | null; // ISO Date String
  expirationDate: string | null; // ISO Date String
  status: DomainStatus;
  rawWhois: string;
  notes: string;
  addedAt: number;
  lastUpdated?: number; // Timestamp of last WHOIS update
  updateStatus?: 'success' | 'manual_check'; // Status of the last update attempt
}

export interface DomainStats {
  total: number;
  owned: number;
  backorder: number;
  expiringSoon: number;
}