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
  const [colleges, setCollegesState] = useState<College[]>(() => {
    const saved = localStorage.getItem('ikigai_colleges');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastFetchTime, setLastFetchTimeState] = useState<number | null>(() => {
    const saved = localStorage.getItem('ikigai_last_fetch');
    return saved ? parseInt(saved) : null;
  });

  const setColleges = (newColleges: College[]) => {
    setCollegesState(newColleges);
    localStorage.setItem('ikigai_colleges', JSON.stringify(newColleges));
  };

  const setLastFetchTime = (time: number) => {
    setLastFetchTimeState(time);
    localStorage.setItem('ikigai_last_fetch', time.toString());
  };

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
