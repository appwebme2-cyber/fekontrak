// Database type conversion utilities to handle Supabase Json types

import { ContractDocument, TagihanDocument, PadiDocument } from './typeUtils';

// Convert Json to ContractDocument array
export const jsonToContractDocuments = (json: any): ContractDocument[] => {
  if (!json || !Array.isArray(json)) return [];
  
  return json.map((item: any) => ({
    id: item?.id || '',
    name: item?.name || '',
    url: item?.url || '',
    type: item?.type || '',
    size: item?.size || 0,
    upload_date: item?.upload_date || ''
  }));
};

// Convert ContractDocument array to Json
export const contractDocumentsToJson = (documents: ContractDocument[]): any => {
  return documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    url: doc.url,
    type: doc.type,
    size: doc.size,
    upload_date: doc.upload_date
  }));
};

// Convert Json to TagihanDocument array
export const jsonToTagihanDocuments = (json: any): TagihanDocument[] => {
  if (!json || !Array.isArray(json)) return [];
  
  return json.map((item: any) => {
    let url = item?.url || '';
    
    // Fix URL format issues
    if (url) {
      // Case 1: Convert old dokumenkontrak bucket URLs to contract-documents
      if (url.includes('/storage/v1/object/public/dokumenkontrak/')) {
        url = url.replace('/dokumenkontrak/', '/contract-documents/');
      }
      // Case 2: Handle documents with just filenames (no full URL)
      else if (!url.startsWith('http') && !url.includes('/storage/v1/object/')) {
        // Construct full URL for documents stored in contract-documents/tagihan-documents
        const supabaseUrl = 'https://cubsudtoiqsdneecrjkw.supabase.co';
        url = `${supabaseUrl}/storage/v1/object/public/contract-documents/tagihan-documents/${encodeURIComponent(url)}`;
      }
    }
    
    return {
      id: item?.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: item?.name || 'Unknown Document',
      url: url,
      type: item?.type || 'application/pdf',
      size: item?.size || 0,
      upload_date: item?.upload_date || new Date().toISOString()
    };
  });
};

// Convert TagihanDocument array to Json
export const tagihanDocumentsToJson = (documents: TagihanDocument[]): any => {
  return documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    url: doc.url,
    type: doc.type,
    size: doc.size,
    upload_date: doc.upload_date
  }));
};

// Convert Json to PadiDocument array
export const jsonToPadiDocuments = (json: any): PadiDocument[] => {
  if (!json || !Array.isArray(json)) return [];
  
  return json.map((item: any) => ({
    id: item?.id || '',
    name: item?.name || '',
    url: item?.url || '',
    type: item?.type || '',
    size: item?.size || 0,
    upload_date: item?.upload_date || ''
  }));
};

// Convert PadiDocument array to Json
export const padiDocumentsToJson = (documents: PadiDocument[]): any => {
  return documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    url: doc.url,
    type: doc.type,
    size: doc.size,
    upload_date: doc.upload_date
  }));
};