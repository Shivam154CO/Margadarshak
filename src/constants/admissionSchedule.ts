
// ─────────────────────────────────────────────────────────────────────────────
// Maharashtra Engineering Admission 2025-26 (CAP Rounds)
// Source: DTE Maharashtra / State CET Cell
// ─────────────────────────────────────────────────────────────────────────────

export interface CAPPhase {
  id: string;
  phase: string;
  label: string;           // e.g. "CAP Round I"
  description: string;
  startDate: string;       // ISO date string
  endDate: string;
  link: string;
  category: 'registration' | 'cap_round' | 'document' | 'reporting';
}

/** Official Maharashtra BE/B.Tech CAP 2025-26 schedule */
export const MAHARASHTRA_CAP_SCHEDULE: CAPPhase[] = [
  {
    id: 'reg_open',
    phase: 'Online Registration & Application',
    label: 'Registration',
    description: 'Register at the CET Cell portal, fill personal/academic details, upload documents and pay application fee.',
    startDate: '2025-06-01',
    endDate: '2025-06-25',
    link: 'https://cetcell.mahacet.org/',
    category: 'registration',
  },
  {
    id: 'doc_verify',
    phase: 'Online Document Verification',
    label: 'Document Upload & Verification',
    description: 'Upload all required documents: mark sheets, caste certificate, domicile, income certificate etc. at Facilitation Centers or online.',
    startDate: '2025-06-02',
    endDate: '2025-06-28',
    link: 'https://cetcell.mahacet.org/',
    category: 'document',
  },
  {
    id: 'merit_list',
    phase: 'Provisional Merit List',
    label: 'Merit List Published',
    description: 'Provisional merit / rank list released based on MHT-CET percentile or JEE percentile. Candidates can raise objections within the window.',
    startDate: '2025-07-05',
    endDate: '2025-07-10',
    link: 'https://cetcell.mahacet.org/',
    category: 'registration',
  },
  {
    id: 'cap1_choice',
    phase: 'CAP Round I – Option Form Filling',
    label: 'CAP Round I — Choice Filling',
    description: 'Fill college & branch preferences in priority order online. Choose up to 300 options across all approved Maharashtra engineering institutes.',
    startDate: '2025-07-14',
    endDate: '2025-07-20',
    link: 'https://cetcell.mahacet.org/',
    category: 'cap_round',
  },
  {
    id: 'cap1_allot',
    phase: 'CAP Round I – Allotment',
    label: 'CAP Round I — Allotment',
    description: 'Seat allotment based on merit, category and choices. Results visible on candidate login. Accept seat and pay seat acceptance fee.',
    startDate: '2025-07-23',
    endDate: '2025-07-23',
    link: 'https://cetcell.mahacet.org/',
    category: 'cap_round',
  },
  {
    id: 'cap1_report',
    phase: 'CAP Round I – Reporting at College',
    label: 'CAP Round I — College Reporting',
    description: 'Report to allotted college with original documents, pay tuition fees and complete admission formalities. Freeze or float to next round.',
    startDate: '2025-07-24',
    endDate: '2025-07-29',
    link: 'https://cetcell.mahacet.org/',
    category: 'reporting',
  },
  {
    id: 'cap2_choice',
    phase: 'CAP Round II – Option Form Filling',
    label: 'CAP Round II — Choice Filling',
    description: 'Candidates who floated/are unallotted fill fresh preferences. Remaining seats from Round I are available plus returned seats.',
    startDate: '2025-08-01',
    endDate: '2025-08-05',
    link: 'https://cetcell.mahacet.org/',
    category: 'cap_round',
  },
  {
    id: 'cap2_allot',
    phase: 'CAP Round II – Allotment',
    label: 'CAP Round II — Allotment',
    description: 'Second round allotment. Candidates must accept new allotment or retain previous seat.',
    startDate: '2025-08-08',
    endDate: '2025-08-08',
    link: 'https://cetcell.mahacet.org/',
    category: 'cap_round',
  },
  {
    id: 'cap2_report',
    phase: 'CAP Round II – Reporting at College',
    label: 'CAP Round II — College Reporting',
    description: 'Report to newly allotted college. Final admission for Round II. No further upgrade possible after freezing.',
    startDate: '2025-08-09',
    endDate: '2025-08-14',
    link: 'https://cetcell.mahacet.org/',
    category: 'reporting',
  },
  {
    id: 'cap3_choice',
    phase: 'CAP Round III – Option Form Filling',
    label: 'CAP Round III — Choice Filling',
    description: 'Final CAP round for remaining vacant seats. All unallotted and floating candidates participate.',
    startDate: '2025-08-18',
    endDate: '2025-08-21',
    link: 'https://cetcell.mahacet.org/',
    category: 'cap_round',
  },
  {
    id: 'cap3_allot',
    phase: 'CAP Round III – Allotment',
    label: 'CAP Round III — Allotment',
    description: 'Third and final round allotment. Accept and freeze seat immediately.',
    startDate: '2025-08-24',
    endDate: '2025-08-24',
    link: 'https://cetcell.mahacet.org/',
    category: 'cap_round',
  },
  {
    id: 'cap3_report',
    phase: 'CAP Round III – Reporting at College',
    label: 'CAP Round III — College Reporting',
    description: 'Final reporting date. Candidates must report and complete all formalities. Institutes fill remaining seats via direct admission after this.',
    startDate: '2025-08-25',
    endDate: '2025-08-30',
    link: 'https://cetcell.mahacet.org/',
    category: 'reporting',
  },
];

/** Required documents for Maharashtra engineering admission */
export const REQUIRED_DOCUMENTS = [
  { doc: 'MHT-CET / JEE Scorecard', mandatory: true },
  { doc: 'HSC (12th) Mark Sheet & Certificate', mandatory: true },
  { doc: 'SSC (10th) Mark Sheet & Certificate', mandatory: true },
  { doc: 'Leaving / Transfer Certificate (LC/TC)', mandatory: true },
  { doc: 'Maharashtra Domicile Certificate', mandatory: true },
  { doc: 'Caste / Category Certificate (if applicable)', mandatory: false },
  { doc: 'Non-Creamy Layer Certificate (OBC/VJ/NT/SBC)', mandatory: false },
  { doc: 'Income Certificate (for scholarship / TFWS)', mandatory: false },
  { doc: 'EWS Certificate (if applicable)', mandatory: false },
  { doc: 'Nationality Certificate / Passport', mandatory: false },
  { doc: 'Aadhar Card (self & parent)', mandatory: true },
  { doc: 'Passport Size Photographs (6 copies)', mandatory: true },
];


