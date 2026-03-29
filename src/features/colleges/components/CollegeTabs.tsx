import React from 'react';

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
  return (
    <div className="sticky top-4 z-30 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 p-1 mb-8 flex overflow-x-auto scrollbar-hide shadow-lg shadow-gray-200/50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
        >
          <tab.icon className="w-4 h-4" /> {tab.label}
        </button>
      ))}
    </div>
  );
};
