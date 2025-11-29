import { Domain, DomainStatus } from '../types';

const STORAGE_KEY = 'domain_master_data_v1';

export const getDomains = (): Domain[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load domains', error);
    return [];
  }
};

export const saveDomains = (domains: Domain[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
  } catch (error) {
    console.error('Failed to save domains', error);
  }
};

export const createDomain = (name: string): Domain => {
  return {
    id: crypto.randomUUID(),
    name: name.toLowerCase().trim(),
    registrar: 'Unknown',
    registrationDate: null,
    expirationDate: null,
    status: DomainStatus.WATCHLIST,
    rawWhois: '',
    notes: '',
    addedAt: Date.now(),
  };
};