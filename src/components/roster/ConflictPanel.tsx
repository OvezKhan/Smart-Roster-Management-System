'use client';

import React, { useState } from 'react';
import { RosterConflict } from '@/lib/types';
import { AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConflictPanelProps {
  conflicts: RosterConflict[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ConflictPanel({ conflicts, isOpen, onClose }: ConflictPanelProps) {
  const [filter, setFilter] = useState<'all' | 'HARD_ERROR' | 'COVERAGE_WARNING'>('all');

  if (!isOpen) return null;

  const hardErrors = conflicts.filter(c => c.severity === 'HARD_ERROR');
  const warnings = conflicts.filter(c => c.severity === 'COVERAGE_WARNING');

  const filteredList = conflicts.filter(c => {
    if (filter === 'all') return true;
    return c.severity === filter;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-lg">Conflict & Coverage Auditor</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-800">
              {conflicts.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time validation against brand operating calendars and employee contracts.
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Summary Pills */}
      <div className="p-4 border-b border-slate-200 bg-white flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
            filter === 'all'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
        >
          All Issues ({conflicts.length})
        </button>
        <button
          onClick={() => setFilter('HARD_ERROR')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
            filter === 'HARD_ERROR'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          Hard Errors ({hardErrors.length})
        </button>
        <button
          onClick={() => setFilter('COVERAGE_WARNING')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
            filter === 'COVERAGE_WARNING'
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Warnings ({warnings.length})
        </button>
      </div>

      {/* Conflicts List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
        {filteredList.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
            <h4 className="font-semibold text-slate-800 text-sm">No Conflicts Found</h4>
            <p className="text-xs text-slate-500">
              All client operating coverage constraints and employee rules are fully satisfied!
            </p>
          </div>
        ) : (
          filteredList.map(c => {
            const isHard = c.severity === 'HARD_ERROR';
            return (
              <div
                key={c.id}
                className={`p-3.5 rounded-xl border transition-all text-xs shadow-sm ${
                  isHard
                    ? 'bg-white border-rose-200 hover:border-rose-400'
                    : 'bg-white border-amber-200 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      isHard
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isHard ? <AlertCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                    {c.conflictType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {c.date}
                  </span>
                </div>

                <p className="text-slate-800 font-medium leading-relaxed mb-2">
                  {c.message}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t pt-2 border-slate-100">
                  {c.brandName && (
                    <span>Brand: <strong className="text-slate-700">{c.brandName}</strong></span>
                  )}
                  {c.processName && (
                    <span>• Process: <strong className="text-slate-700">{c.processName}</strong></span>
                  )}
                  {c.employeeName && (
                    <span>• Staff: <strong className="text-slate-700">{c.employeeName}</strong></span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-600">
        <span>
          {hardErrors.length > 0 ? (
            <strong className="text-rose-600">Publishing Blocked</strong>
          ) : (
            <strong className="text-emerald-600">Eligible for Publishing</strong>
          )}
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
