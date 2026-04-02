import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { College } from '../types/college';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// This context will now handle UI-related global state or transient selections
// Data caching is delegated to TanStack Query (React Query)
interface CollegesContextType {
  // We keep these for backward compatibility where necessary, 
  // but they will point to the Query Cache
  colleges: College[]; 
  setColleges: (colleges: College[]) => void;
  lastFetchTime: number | null;
  setLastFetchTime: (time: number) => void;
  
  // New UI-related state
  selectedBranch: string | null;
  setSelectedBranch: (branch: string | null) => void;
  isDataStale: boolean;
}

const CollegesContext = createContext<CollegesContextType | undefined>(undefined);

export const useColleges = () => {
  const context = useContext(CollegesContext);
  if (!context) {
    throw new Error('useColleges must be used within a CollegesProvider');
  }
  return context;
};

export const CollegesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  // Use React Query for the actual data fetching/caching
  const { data: colleges = [] } = useQuery<College[]>({
    queryKey: ['allColleges'],
    queryFn: async () => {
      // In reality, useCollegeData handles the fetch, but we can access it here too
      return queryClient.getQueryData(['allColleges']) || [];
    },
    staleTime: 1000 * 60 * 30, // 30 mins
  });

  const [lastFetchTime, setLastFetchTimeState] = useState<number | null>(() => {
    const saved = localStorage.getItem('ikigai_last_fetch');
    return saved ? parseInt(saved) : null;
  });

  const setColleges = (newColleges: College[]) => {
    // Manually updating the query cache if needed
    queryClient.setQueryData(['allColleges'], newColleges);
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
      selectedBranch,
      setSelectedBranch,
      isDataStale: false,
    }}>
      {children}
    </CollegesContext.Provider>
  );
};
