import React from 'react';

interface FeeCategory {
  category: string;
  amount: number;
  icon: any;
  color: string;
}

interface FeeStructureProps {
  feeData: {
    totalFees: number;
    categories: FeeCategory[];
  };
}

export const CollegeFees: React.FC<FeeStructureProps> = ({ feeData }) => {
  return (
    <div className="space-y-8">
      <div className="bg-indigo-600 rounded-3xl p-10 text-white shadow-xl shadow-indigo-600/20">
        <h2 className="text-3xl font-black mb-2">₹{feeData.totalFees.toLocaleString('en-IN')}</h2>
        <p className="opacity-80 font-medium">Total Annual Fee Structure</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feeData.categories.map((fee, i) => (
          <div key={i} className="flex justify-between items-center p-6 bg-white rounded-2xl border border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${fee.color} flex items-center justify-center text-white`}>
                <fee.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{fee.category}</p>
                <p className="text-sm text-gray-500">Annual charge</p>
              </div>
            </div>
            <p className="text-xl font-black text-gray-900">₹{fee.amount.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
