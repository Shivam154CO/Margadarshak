import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
  icon: any;
}

interface CollegeTabsProps {
  tabs: TabItem[];
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export const CollegeTabs: React.FC<CollegeTabsProps> = ({ tabs, activeTab, setActiveTab }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active tab into view on change
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className="sticky top-0 z-30 mb-6">
      {/* Glass container */}
      <div className="bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-200/60 overflow-hidden">
        {/* Scroll wrapper */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-colors duration-150 flex-shrink-0 ${
                  isActive
                    ? 'text-indigo-600'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>

                {/* Active underline indicator */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
