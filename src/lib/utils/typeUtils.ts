// Type conversion utilities for consistent data handling

export type DateString = string;

export interface ContractDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  upload_date: string;
}

export interface TagihanDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  upload_date: string;
}

export interface PadiDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  upload_date: string;
}

// Safe number conversion
export const safeNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Safe string conversion
export const safeString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

// Safe date conversion
export const safeDate = (value: unknown): DateString => {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  return '';
};

// Check if value is valid number
export const isValidNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

// Check if value is valid date string
export const isValidDateString = (value: unknown): value is DateString => {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
};

// Type guard for contract documents
export const isContractDocument = (value: unknown): value is ContractDocument => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as any).id === 'string' &&
    typeof (value as any).name === 'string' &&
    typeof (value as any).url === 'string'
  );
};