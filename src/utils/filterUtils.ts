
// Utility functions for standardizing filter values

export const normalizeWorkDirection = (direction: string): string => {
  if (!direction) return direction;
  
  // Normalize MA variations
  const normalized = direction
    .replace(/MA\s*5/i, 'MA5')
    .replace(/MA\s*6/i, 'MA6')
    .replace(/MA\s*7/i, 'MA7')
    .trim();
  
  return normalized;
};

export const normalizeDiscipline = (discipline: string): string => {
  if (!discipline) return discipline;
  
  // Normalize discipline variations
  const normalized = discipline
    .replace(/electrical/i, 'Electric')
    .replace(/electric$/i, 'Electric')
    .trim();
  
  return normalized;
};

export const getUniqueWorkDirections = (contracts: any[]): string[] => {
  const directions = contracts
    .map(c => normalizeWorkDirection(c.direksi_pekerjaan))
    .filter(Boolean);
  
  return [...new Set(directions)].sort();
};

export const getUniqueDisciplines = (contracts: any[]): string[] => {
  const disciplines = contracts
    .map(c => normalizeDiscipline(c.disiplin))
    .filter(Boolean);
  
  return [...new Set(disciplines)].sort();
};
