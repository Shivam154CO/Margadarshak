import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface College {
  college_code: string;
  college_name: string;
  city: string;
  district?: string;
  region?: string;
  branch: string;
  branch_name: string;
  branch_code: string;
  fees: number;
  placement_rate: number;
  cutoff_rank: number;
  cutoff_percentile: number;
  category: string;
  average_package_lpa: number;
  highest_package_lpa: number;
  total_intake: number;
  seats: number;
  autonomy_status: string;
  hostel_available: string;
  image: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  website_url: string;
  probability_level: string;
  is_most_probable: boolean;
  admission_chance: number;
  admission_chance_percentage: string;
  fit: string;
  fit_reason: string;
  match_score: number;
  match_percentage: string;
  display_fees: string;
  display_seats: string;
  display_cutoff: string;
  display_placement: string;
}

interface CollegesContextType {
  colleges: College[];
  setColleges: (colleges: College[]) => void;
  lastFetchTime: number | null;
  setLastFetchTime: (time: number) => void;
}

const CollegesContext = createContext<CollegesContextType | undefined>(undefined);

export const useColleges = () => {
  const context = useContext(CollegesContext);
  if (!context) {
    throw new Error('useColleges must be used within a CollegesProvider');
  }
  return context;
};

interface CollegesProviderProps {
  children: ReactNode;
}

export const CollegesProvider: React.FC<CollegesProviderProps> = ({ children }) => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  return (
    <CollegesContext.Provider value={{
      colleges,
      setColleges,
      lastFetchTime,
      setLastFetchTime,
    }}>
      {children}
    </CollegesContext.Provider>
  );
};
