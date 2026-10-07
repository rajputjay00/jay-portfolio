export interface SectionItem {
  id: string;
  name: string;
  label: string;
}

export const SECTIONS: SectionItem[] = [
  { id: 'hero', name: 'The Attention Lab', label: '01 // HERO' },
  { id: 'proof', name: 'Proof Strip', label: '02 // PROOF' },
  { id: 'case-studies', name: 'Case Studies', label: '03 // CASE STUDIES' },
  { id: 'retention', name: 'Retention Theatre', label: '04 // RETENTION' },
  { id: 'range', name: 'Range Wall', label: '05 // RANGE' },
  { id: 'about', name: 'About & Services', label: '06 // ABOUT' },
  { id: 'dm', name: 'Direct Message', label: '07 // DM' },
];
