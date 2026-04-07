import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { College } from '@/types/college';

interface ComparisonState {
  comparisonList: College[];
  addToComparison: (college: College) => void;
  removeFromComparison: (collegeId: string) => void;
  clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set) => ({
      comparisonList: [],
      addToComparison: (college: College) => set((state: ComparisonState) => {
        if (state.comparisonList.some((c: College) => c.college_code === college.college_code)) return state;
        if (state.comparisonList.length >= 4) return state; // Limit to 4 colleges
        return { comparisonList: [...state.comparisonList, college] };
      }),
      removeFromComparison: (collegeId: string) => set((state: ComparisonState) => ({
        comparisonList: state.comparisonList.filter((c: College) => c.college_code !== collegeId)
      })),
      clearComparison: () => set({ comparisonList: [] }),
    }),
    {
      name: 'college-comparison-storage',
    }
  )
);
