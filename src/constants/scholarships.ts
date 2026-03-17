import type { Scholarship } from "../types/college";

export const RECOMMENDED_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "s1",
    name: "MahaDBT Post-Matric Scholarship",
    provider: "Social Justice & Special Assistance Dept",
    amount: "100% Tuition Fee",
    eligibility: "SC/ST Category Students, Income < 2.5 LPA",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Dec 31, 2025",
    type: "Government"
  },
  {
    id: "s2",
    name: "EBC Fee Reimbursement Scheme",
    provider: "Directorate of Technical Education",
    amount: "50% Tuition Fee",
    eligibility: "Open/SEBC/EWS category, Income < 8 LPA",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Nov 30, 2025",
    type: "Government"
  },
  {
    id: "s3",
    name: "OBC/VJNT Post-Matric Scholarship",
    provider: "VJNT, OBC & SBC Welfare Department",
    amount: "50-100% Tuition Fee",
    eligibility: "OBC/VJNT/SBC category, Income < 1.5 LPA (100%), 1.5-8L (50%)",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Dec 31, 2025",
    type: "Government"
  },
  {
    id: "s4",
    name: "Dr. Panjabrao Deshmukh Hostel Allowance",
    provider: "Directorate of Technical Education",
    amount: "₹30,000 per year",
    eligibility: "Children of Registered Laborers / Small Land Holders",
    application_link: "https://mahadbt.maharashtra.gov.in/",
    deadline: "Jan 15, 2026",
    type: "Government"
  },
  {
    id: "s5",
    name: "Tuition Fee Waiver Scheme (TFWS)",
    provider: "State Common Entrance Test Cell",
    amount: "100% Tuition Fee",
    eligibility: "Merit based seat, Parents' income < 8 LPA",
    application_link: "https://cetcell.mahacet.org/",
    deadline: "July 31, 2025",
    type: "National"
  }
];
