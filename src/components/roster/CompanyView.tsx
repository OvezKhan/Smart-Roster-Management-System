'use client';

import React from 'react';
import { Employee, RosterShift, Brand, Process, BrandProcess } from '@/lib/types';

interface CompanyViewProps {
  employees: Employee[];
  shifts: RosterShift[];
  brands: Brand[];
  processes: Process[];
  brandProcesses: BrandProcess[];
  month: number;
  year: number;
  onCellClick?: (shift: RosterShift) => void;
}

export default function CompanyView({
  employees,
  shifts,
  brands,
  processes,
  brandProcesses,
  month,
  year,
  onCellClick
}: CompanyViewProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });

  const brandMap = new Map(brands.map(b => [b.id, b]));
  const procMap = new Map(processes.map(p => [p.id, p]));
  const bpMap = new Map(brandProcesses.map(bp => [bp.id, bp]));

  // Index shifts by employeeId_date
  const shiftIndex = new Map<string, RosterShift>();
  for (const s of shifts) {
    shiftIndex.set(`${s.employeeId}_${s.date}`, s);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Company-Wide Monthly Matrix</h3>
          <p className="text-xs text-slate-500">
            Showing all {employees.length} employees across operational pods for {month}/{year}. Click any shift to edit.
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Working
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Off
          </span>
          <span className="flex items-center gap-1 font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Leave
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Comp-Off
          </span>
          <span className="flex items-center gap-1 font-medium text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Holiday
          </span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[650px]">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-20 border-b border-slate-200">
            <tr>
              <th className="p-2 text-left sticky left-0 bg-slate-100 z-30 min-w-[180px] border-r font-semibold">
                Employee
              </th>
              {dates.map((d, idx) => {
                const dateObj = new Date(d + 'T00:00:00Z');
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' });
                const isSunday = dateObj.getUTCDay() === 0;
                return (
                  <th
                    key={d}
                    className={`p-1.5 text-center min-w-[36px] font-semibold border-r ${
                      isSunday ? 'bg-slate-200 text-rose-700' : ''
                    }`}
                  >
                    <div>{idx + 1}</div>
                    <div className="text-[10px] font-normal text-slate-500">{dayName}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white z-10 border-r shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                  <div className="truncate max-w-[170px]" title={emp.name}>{emp.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{emp.role.replace('_', ' ')}</div>
                </td>
                {dates.map(d => {
                  const shift = shiftIndex.get(`${emp.id}_${d}`);
                  let badge = <span className="text-slate-300">-</span>;
                  let bgClass = '';

                  if (shift) {
                    if (shift.shiftStatus === 'working') {
                      const bp = shift.brandProcessId ? bpMap.get(shift.brandProcessId) : undefined;
                      const brand = bp ? brandMap.get(bp.brandId) : undefined;
                      const proc = bp ? procMap.get(bp.processId) : undefined;
                      const initials = brand ? brand.name.slice(0, 2).toUpperCase() : 'W';
                      badge = (
                        <span
                          className="px-1 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 truncate block text-center"
                          title={`${brand?.name || 'Working'} - ${proc?.name || 'CS'}`}
                        >
                          {initials}
                        </span>
                      );
                      bgClass = 'bg-emerald-50/40';
                    } else if (shift.shiftStatus === 'weekly_off') {
                      badge = <span className="text-[10px] text-slate-400 font-medium">OFF</span>;
                    } else if (shift.shiftStatus === 'leave') {
                      badge = (
                        <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 block text-center">
                          LV
                        </span>
                      );
                      bgClass = 'bg-rose-50/40';
                    } else if (shift.shiftStatus === 'comp_off') {
                      badge = (
                        <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 block text-center">
                          CO
                        </span>
                      );
                      bgClass = 'bg-amber-50/40';
                    } else if (shift.shiftStatus === 'holiday') {
                      badge = (
                        <span className="px-1 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 block text-center">
                          H
                        </span>
                      );
                      bgClass = 'bg-indigo-50/40';
                    }
                  }

                  return (
                    <td
                      key={d}
                      onClick={() => shift && onCellClick && onCellClick(shift)}
                      className={`p-1 text-center border-r border-slate-100 cursor-pointer hover:ring-1 hover:ring-indigo-400 transition-all ${bgClass}`}
                    >
                      {badge}
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
