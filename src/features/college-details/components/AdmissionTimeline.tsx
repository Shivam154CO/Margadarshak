import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, ChevronUp, ChevronDown, Phone, Mail } from 'lucide-react';

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
  contactEmail,
  contactPhone,
  contacts,
}) => {
  const steps = admissionSteps || admissionProcess || [];
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleStep = (step: number) => {
    setExpandedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Admission Process & Timeline</h3>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {admissionDates && (
              <>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Application Period</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {admissionDates.application_start} to {admissionDates.application_end}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 rounded-xl border border-emerald-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-gray-900">Merit List Date</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {admissionDates.merit_list_date}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-2 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200/50 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => toggleStep(step.step)}>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{step.title}</h4>
                      {step.deadline && (
                        <span className="self-start text-xs sm:text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded whitespace-nowrap">
                          Deadline: {step.deadline}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base">{step.description}</p>
                  </div>
                  <button
                    onClick={() => toggleStep(step.step)}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expandedSteps.includes(step.step) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {expandedSteps.includes(step.step) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-14 mt-2 overflow-hidden"
                    >
                      {step.required_docs && step.required_docs.length > 0 && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 mb-2">Required Documents:</p>
                          <div className="flex flex-wrap gap-2">
                            {step.required_docs.map((doc, docIndex) => (
                              <span key={docIndex} className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-200">
                                {doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
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
