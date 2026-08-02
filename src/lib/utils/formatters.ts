// Consistent formatting utilities

import { safeNumber, safeString, DateString } from './typeUtils';

// Consistent currency formatting
export const formatCurrency = (amount: number | null | undefined): string => {
  const safeAmount = safeNumber(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(safeAmount);
};

// Consistent date formatting
export const formatDate = (dateString: DateString | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '-';
  }
};

// Format date for display in forms (YYYY-MM-DD)
export const formatDateForInput = (dateString: DateString | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

// Format percentage
export const formatPercentage = (value: number | null | undefined): string => {
  const safeValue = safeNumber(value);
  return `${safeValue.toFixed(1)}%`;
};

// Format file size
export const formatFileSize = (bytes: number | null | undefined): string => {
  const safeBytes = safeNumber(bytes);
  if (safeBytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(safeBytes) / Math.log(k));
  
  return parseFloat((safeBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format contract status for display
export const formatContractStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'Pre-KOM': 'Pre-KOM',
    'Active': 'Aktif',
    'Aktif': 'Aktif',
    'Completed': 'Selesai',
    'Selesai': 'Selesai',
    'Terminated': 'Dihentikan'
  };
  
  return statusMap[status] || status;
};

// Truncate text for display
export const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  const safeText = safeString(text);
  if (safeText.length <= maxLength) return safeText;
  return safeText.substring(0, maxLength) + '...';
};