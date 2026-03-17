import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { College } from '../types/college';

export type { College };

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
