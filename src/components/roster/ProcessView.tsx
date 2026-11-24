'use client';

import React from 'react';
import { Process, BrandProcess, RosterShift, Brand, Employee } from '@/lib/types';

interface ProcessViewProps {
  processes: Process[];
  brandProcesses: BrandProcess[];
  brands: Brand[];
  employees: Employee[];
  shifts: RosterShift[];
  month: number;
  year: number;
}

export default function ProcessView({
  processes,
  brandProcesses,
  shifts,
  month,
  year
}: ProcessViewProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });

  const bpMap = new Map(brandProcesses.map(bp => [bp.id, bp]));

  // Count active working employees per processId and date
  const procDateCount = new Map<string, number>(); // "procId_date" -> count
  for (const s of shifts) {
    if (s.shiftStatus === 'working' && s.brandProcessId) {
      const bp = bpMap.get(s.brandProcessId);
      if (bp) {
        const key = `${bp.processId}_${s.date}`;
        procDateCount.set(key, (procDateCount.get(key) || 0) + 1);
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-800 text-lg">Process-Wise Daily Staffing Distribution</h3>
        <p className="text-xs text-slate-500">
          Total active employees deployed per operational process across all brands on each calendar day.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <tr>
              <th className="p-3 text-left sticky left-0 bg-slate-100 z-20 min-w-[200px] border-r font-semibold">
                Operational Process
              </th>
              {dates.map((d, idx) => {
                const dateObj = new Date(d + 'T00:00:00Z');
                const isSunday = dateObj.getUTCDay() === 0;
                return (
                  <th
                    key={d}
                    className={`p-1.5 text-center min-w-[34px] border-r font-semibold ${
                      isSunday ? 'bg-slate-200 text-rose-700' : ''
                    }`}
                  >
                    <div>{idx + 1}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processes.map(proc => (
              <tr key={proc.id} className="hover:bg-slate-50/70">
                <td className="p-3 sticky left-0 bg-white z-10 border-r font-semibold text-slate-800 shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                  <div>{proc.name}</div>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold">
                    Code: {proc.code}
                  </span>
                </td>
                {dates.map(d => {
                  const key = `${proc.id}_${d}`;
                  const count = procDateCount.get(key) || 0;
                  return (
                    <td
                      key={d}
                      className={`p-1 text-center border-r font-bold ${
                        count > 0 ? 'bg-indigo-50/40 text-indigo-900' : 'text-slate-300'
                      }`}
                    >
                      {count > 0 ? count : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
