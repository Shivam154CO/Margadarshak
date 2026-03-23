import React from 'react';
import { Bot, FileText } from 'lucide-react';

interface SeatMatrixViewerProps {
  collegeName: string;
  branchName: string;
  pageNumber: number;
  pdfUrl: string;
}

export const SeatMatrixViewer: React.FC<SeatMatrixViewerProps> = ({
  collegeName,
  branchName,
  pageNumber,
  pdfUrl,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner flex-shrink-0">
              <Bot className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-1">Ultimate Automation</h2>
              <p className="text-blue-100 font-medium flex items-center gap-2 text-sm sm:text-base">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0"></span>
                AI Seat Matrix Analysis 2025-26
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-2">
            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/30">
              <span className="text-sm font-semibold">Matched Page: {pageNumber}</span>
            </div>
            <p className="text-xs text-blue-200">Automatically syncs with state-wide seat matrix data</p>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200 overflow-hidden min-h-[800px] flex flex-col">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-bold text-gray-700">Official Seat Matrix - Round I</span>
          </div>
          <a
            href={`${pdfUrl}#page=${pageNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Open in New Tab
          </a>
        </div>

        <iframe
          src={`${pdfUrl}#page=${pageNumber}&view=FitH`}
          className="w-full flex-1 border-none min-h-[750px]"
          title="Seat Matrix Viewer"
        />

        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <p className="text-xs text-blue-700 font-medium text-center">
            The AI has pinpointed the exact location for <strong>{branchName}</strong> at <strong>{collegeName}</strong>.
            The page above shows the specific intake, lateral entry seats, and category-wise distribution.
          </p>
        </div>
      </div>
    </div>
  );
};
