import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle2, Clock, ChevronRight, ExternalLink,
  FileText, AlertCircle, Phone, Mail, ChevronDown, ChevronUp,
  Layers, ClipboardList,
} from 'lucide-react';
import {
  MAHARASHTRA_CAP_SCHEDULE,
  REQUIRED_DOCUMENTS,
  type CAPPhase,
} from '@/constants/admissionSchedule';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

type PhaseStatus = 'completed' | 'active' | 'upcoming';

function getPhaseStatus(phase: CAPPhase, now: Date): PhaseStatus {
  const start = new Date(phase.startDate);
  const end = new Date(phase.endDate);
  // Give end-date full day
  end.setHours(23, 59, 59, 999);

  if (now > end) return 'completed';
  if (now >= start && now <= end) return 'active';
  return 'upcoming';
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntil(isoDate: string, now: Date): number {
  const end = new Date(isoDate);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const CATEGORY_LABEL: Record<CAPPhase['category'], string> = {
  registration: 'Registration',
  cap_round: 'CAP Round',
  document: 'Documents',
  reporting: 'Reporting',
};

const CATEGORY_COLOR: Record<CAPPhase['category'], string> = {
  registration: 'bg-violet-100 text-violet-700',
  cap_round: 'bg-indigo-100 text-indigo-700',
  document: 'bg-amber-100 text-amber-700',
  reporting: 'bg-emerald-100 text-emerald-700',
};

// ─── Phase Row ────────────────────────────────────────────────────────────────

const PhaseRow: React.FC<{ phase: CAPPhase; status: PhaseStatus; index: number; now: Date }> = ({
  phase, status, index, now,
}) => {
  const [expanded, setExpanded] = useState(false);
  const days = status === 'upcoming' ? daysUntil(phase.startDate, now) : null;
  const daysLeft = status === 'active' ? daysUntil(phase.endDate, now) : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`relative border rounded-xl overflow-hidden transition-all duration-200 ${
        status === 'completed'
          ? 'border-slate-150 bg-slate-50/60 opacity-70'
          : status === 'active'
          ? 'border-indigo-200 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-200/60'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Main row */}
      <div
        className="flex items-start gap-4 px-4 py-3.5 cursor-pointer"
        onClick={() => setExpanded(p => !p)}
      >
        {/* Step icon */}
        <div className="flex-shrink-0 mt-0.5">
          {status === 'completed' ? (
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-slate-400" />
            </div>
          ) : status === 'active' ? (
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center animate-pulse">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-400">{index + 1}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${CATEGORY_COLOR[phase.category]}`}>
              {CATEGORY_LABEL[phase.category]}
            </span>
            {status === 'active' && (
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-600 text-white animate-pulse">
                Live Now
              </span>
            )}
          </div>
          <p className={`text-sm font-bold leading-snug ${status === 'completed' ? 'text-slate-400' : 'text-slate-800'}`}>
            {phase.label}
          </p>
          <p className={`text-[11px] mt-0.5 ${status === 'completed' ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatDate(phase.startDate)}
            {phase.startDate !== phase.endDate && ` — ${formatDate(phase.endDate)}`}
            {status === 'active' && daysLeft !== null && (
              <span className="ml-2 font-bold text-indigo-600">{daysLeft}d left</span>
            )}
            {status === 'upcoming' && days !== null && days <= 30 && (
              <span className="ml-2 font-bold text-amber-600">in {days}d</span>
            )}
          </p>
        </div>

        {/* Expand chevron */}
        <div className="flex-shrink-0 mt-1">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-300" />
          }
        </div>
      </div>

      {/* Expanded description */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/80">
              <p className="text-xs text-slate-600 leading-relaxed mb-3">{phase.description}</p>
              <a
                href={phase.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Open CET Cell Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdmissionTimeline: React.FC<AdmissionTimelineProps> = ({
  contacts,
}) => {
  const now = useMemo(() => new Date(), []);

  const phasesWithStatus = useMemo(() =>
    MAHARASHTRA_CAP_SCHEDULE.map(phase => ({
      phase,
      status: getPhaseStatus(phase, now),
    })),
    [now],
  );

  const activePhase = phasesWithStatus.find(p => p.status === 'active');
  const nextPhase = phasesWithStatus.find(p => p.status === 'upcoming');
  const completedCount = phasesWithStatus.filter(p => p.status === 'completed').length;
  const progressPct = Math.round((completedCount / MAHARASHTRA_CAP_SCHEDULE.length) * 100);

  const [docsExpanded, setDocsExpanded] = useState(false);

  return (
    <div className="space-y-4">

      {/* ── Status Banner ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Maharashtra CAP 2025-26</p>
            <h3 className="text-sm font-bold text-slate-900">Engineering Admission Schedule</h3>
          </div>
          <a
            href="https://cetcell.mahacet.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            CET Cell <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Progress bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-extrabold text-slate-600">Overall Progress</span>
            <span className="text-[10px] font-extrabold text-indigo-700">{completedCount}/{MAHARASHTRA_CAP_SCHEDULE.length} phases</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>
        </div>

        {/* Current / Next callout */}
        {(activePhase || nextPhase) && (
          <div className="px-5 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activePhase && (
              <div className="flex items-start gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <Clock className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-0.5">Active Right Now</p>
                  <p className="text-xs font-bold text-indigo-800">{activePhase.phase.label}</p>
                  <p className="text-[10px] text-indigo-600">
                    Ends {formatDate(activePhase.phase.endDate)} · {daysUntil(activePhase.phase.endDate, now)}d left
                  </p>
                </div>
              </div>
            )}
            {nextPhase && (
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <ChevronRight className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">Coming Up Next</p>
                  <p className="text-xs font-bold text-slate-800">{nextPhase.phase.label}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Starts {formatDate(nextPhase.phase.startDate)}
                  </p>
                </div>
              </div>
            )}
            {!activePhase && !nextPhase && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl col-span-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-700">All CAP rounds completed for 2025-26. Direct admissions may be open at college level.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Phase Timeline ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Step-by-step</p>
            <h3 className="text-sm font-bold text-slate-900">CAP Round Timeline</h3>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mb-3">
            {(['completed', 'active', 'upcoming'] as PhaseStatus[]).map(s => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${s === 'completed' ? 'bg-slate-300' : s === 'active' ? 'bg-indigo-600' : 'bg-slate-200 border border-slate-300'}`} />
                <span className="text-[10px] font-bold text-slate-400 capitalize">{s}</span>
              </div>
            ))}
          </div>

          {phasesWithStatus.map(({ phase, status }, i) => (
            <PhaseRow key={phase.id} phase={phase} status={status} index={i} now={now} />
          ))}
        </div>
      </div>

      {/* ── Required Documents ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
          onClick={() => setDocsExpanded(p => !p)}
        >
          <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Checklist</p>
            <h3 className="text-sm font-bold text-slate-900">Required Documents ({REQUIRED_DOCUMENTS.length})</h3>
          </div>
          {docsExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        <AnimatePresence>
          {docsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                  {REQUIRED_DOCUMENTS.map((d, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center ${d.mandatory ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        <FileText className={`w-2.5 h-2.5 ${d.mandatory ? 'text-indigo-600' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-700 font-medium leading-snug">{d.doc}</p>
                        <p className="text-[10px] text-slate-400">{d.mandatory ? 'Mandatory' : 'If applicable'}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                    Always carry originals + 2 sets of self-attested photocopies. Document requirements may vary by college and category.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Help Desk Contacts (if provided by college) ── */}
      {contacts && contacts.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">College Help Desk</p>
              <h3 className="text-sm font-bold text-slate-900">Admission Contacts</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {contacts.map((contact, index) => (
              <div key={index} className="flex items-start gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-black text-xs text-slate-500 flex-shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{contact.name}</p>
                  <p className="text-[11px] text-slate-400 mb-1">{contact.role}</p>
                  <div className="flex flex-wrap gap-3">
                    <a href={`tel:${contact.phone}`} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                      <Phone className="w-3 h-3" /> {contact.phone}
                    </a>
                    <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                      <Mail className="w-3 h-3" /> {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer note ── */}
      <div className="flex items-start gap-2 px-1">
        <AlertCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Dates are based on the DTE Maharashtra / State CET Cell official schedule for 2025-26. Please verify at{' '}
          <a href="https://cetcell.mahacet.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 font-semibold hover:underline">
            cetcell.mahacet.org
          </a>{' '}
          for the latest updates.
        </p>
      </div>
    </div>
  );
};
