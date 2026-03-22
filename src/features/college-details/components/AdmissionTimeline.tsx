import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Phone, Mail } from 'lucide-react';
 
interface AdmissionStep {
  step: number;
  title: string;
  description: string;
  deadline?: string;
  required_docs?: string[];
}
 
interface AdmissionTimelineProps {
  admissionProcess?: AdmissionStep[];
  admissionSteps?: AdmissionStep[];
  admissionDates?: {
    application_start: string;
    application_end: string;
    merit_list_date: string;
    admission_start: string;
    admission_end: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  contacts?: {
    name: string;
    role: string;
    phone: string;
    email: string;
  }[];
}
 
export const AdmissionTimeline: React.FC<AdmissionTimelineProps> = ({
  admissionProcess,
  admissionSteps,
  admissionDates,
  contacts,
}) => {
  const steps = admissionSteps || admissionProcess || [];
  const [, setExpandedSteps] = useState<number[]>([]);
 
  const toggleStep = (step: number) => {
    setExpandedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };
 
  const getStepStatus = (deadline?: string) => {
    if (!deadline) return 'upcoming';
    const now = new Date();
    // Parse deadline: e.g. "June 15, 2026"
    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) return 'upcoming';
    
    // Add logic to check if it's "Completed" (date passed) or "Ongoing" (near deadline)
    if (now > deadlineDate) return 'completed';
    
    // If it's the next upcoming step within 15 days, it's ongoing
    const diffTime = Math.abs(deadlineDate.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) return 'ongoing';
    
    return 'upcoming';
  };
 
  return (
    <div className="space-y-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Admission Process & Timeline</h3>
 
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-4 mb-6">
            {admissionDates && (
              <div className="flex flex-col gap-3">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Registration Status</span>
                    </div>
                    {new Date() > new Date(admissionDates.application_start) && new Date() < new Date(admissionDates.application_end) ? (
                      <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] uppercase font-black rounded-lg animate-pulse">Live Now</span>
                    ) : null}
                  </div>
                  <div className="text-sm text-gray-700">
                    {admissionDates.application_start} — {admissionDates.application_end}
                  </div>
                </div>
              </div>
            )}
          </div>
 
          <div className="space-y-3">
            {steps.map((step, index) => {
              const status = getStepStatus(step.deadline);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col gap-2 p-4 rounded-xl border transition-all ${
                    status === 'completed' ? 'bg-gray-50 border-gray-200 opacity-60' : 
                    status === 'ongoing' ? 'bg-indigo-50 border-indigo-200 shadow-md ring-1 ring-indigo-500/20' : 
                    'bg-white border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        status === 'completed' ? 'bg-gray-400 text-white' : 
                        status === 'ongoing' ? 'bg-indigo-600 text-white animate-pulse' : 
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {status === 'completed' ? '✓' : step.step}
                      </div>
                    </div>
                    <div className="flex-1 cursor-pointer" onClick={() => toggleStep(step.step)}>
                      <div className="flex flex-col mb-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-bold text-sm ${status === 'completed' ? 'text-gray-500' : 'text-gray-900'}`}>{step.title}</h4>
                          {status === 'ongoing' && (
                            <span className="text-[10px] font-black text-indigo-600 uppercase">Current Step</span>
                          )}
                        </div>
                        {step.deadline && (
                          <span className="text-[10px] font-bold text-gray-500">
                            Deadline: {step.deadline}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs line-clamp-2">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {contacts && contacts.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Admission Help Desk</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                <div className="font-semibold text-gray-900 mb-1">{contact.name}</div>
                <div className="text-sm text-gray-600 mb-2">{contact.role}</div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <a href={`tel:${contact.phone}`} className="text-blue-700 hover:text-blue-800 text-sm">
                      {contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <a href={`mailto:${contact.email}`} className="text-blue-700 hover:text-blue-800 text-sm">
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
