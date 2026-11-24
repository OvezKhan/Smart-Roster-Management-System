'use client';

import React, { useState, useEffect } from 'react';
import { RosterShift, ShiftStatus, Brand, Process, BrandProcess, Employee } from '@/lib/types';
import { X, Check } from 'lucide-react';

interface ShiftEditModalProps {
  shift: RosterShift | null;
  employees: Employee[];
  brands: Brand[];
  processes: Process[];
  brandProcesses: BrandProcess[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShift: RosterShift) => void;
}

export default function ShiftEditModal({
  shift,
  employees,
  brands,
  processes,
  brandProcesses,
  isOpen,
  onClose,
  onSave
}: ShiftEditModalProps) {
  const [status, setStatus] = useState<ShiftStatus>('working');
  const [selectedBpId, setSelectedBpId] = useState<string>('');

  useEffect(() => {
    if (shift) {
      setStatus(shift.shiftStatus);
      setSelectedBpId(shift.brandProcessId || '');
    }
  }, [shift]);

  if (!isOpen || !shift) return null;

  const emp = employees.find(e => e.id === shift.employeeId);
  const brandMap = new Map(brands.map(b => [b.id, b]));
  const procMap = new Map(processes.map(p => [p.id, p]));

  const handleSave = () => {
    onSave({
      ...shift,
      shiftStatus: status,
      brandProcessId: status === 'working' ? selectedBpId || undefined : undefined,
      isManualOverride: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Edit Shift Assignment</h3>
            <p className="text-xs text-slate-500">
              {emp?.name} • Date: <span className="font-semibold text-slate-700">{shift.date}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Shift Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as ShiftStatus)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="working">Working Shift</option>
              <option value="weekly_off">Weekly Off (Rest Day)</option>
              <option value="leave">Approved Planned Leave</option>
              <option value="comp_off">Approved Comp-Off</option>
              <option value="holiday">Public Holiday Off</option>
            </select>
          </div>

          {status === 'working' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assign to Brand & Process
              </label>
              <select
                value={selectedBpId}
                onChange={e => setSelectedBpId(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select Brand Process --</option>
                {brandProcesses.map(bp => {
                  const b = brandMap.get(bp.brandId);
                  const p = procMap.get(bp.processId);
                  return (
                    <option key={bp.id} value={bp.id}>
                      {b?.name} — {p?.name} ({p?.code})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Note:</strong> Modifying this shift will trigger automatic real-time re-validation of coverage and conflict rules across the team.
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save & Re-Validate
          </button>
        </div>
      </div>
    </div>
  );
}
