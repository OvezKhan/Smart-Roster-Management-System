'use client';

import React, { useState } from 'react';
import { Pod, Employee, RosterShift, Brand, Process, BrandProcess } from '@/lib/types';

interface PodViewProps {
  pods: Pod[];
  employees: Employee[];
  shifts: RosterShift[];
  brands: Brand[];
  processes: Process[];
  brandProcesses: BrandProcess[];
  month: number;
  year: number;
  onCellClick?: (shift: RosterShift) => void;
}

export default function PodView({
  pods,
  employees,
  shifts,
  brands,
  processes,
  brandProcesses,
  month,
  year,
  onCellClick
}: PodViewProps) {
  const [selectedPodId, setSelectedPodId] = useState<string>(pods[0]?.id || '');

  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });

  const shiftIndex = new Map<string, RosterShift>();
  for (const s of shifts) {
    shiftIndex.set(`${s.employeeId}_${s.date}`, s);
  }

  const brandMap = new Map(brands.map(b => [b.id, b]));
  const procMap = new Map(processes.map(p => [p.id, p]));
  const bpMap = new Map(brandProcesses.map(bp => [bp.id, bp]));

  const currentPod = pods.find(p => p.id === selectedPodId) || pods[0];
  const podEmployees = employees.filter(e => e.podId === currentPod?.id);
  const podLead = employees.find(e => e.id === currentPod?.leadId);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-800 text-lg">Pod-Wise Schedules</h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              Pod Lead: {podLead?.name || 'Unassigned'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{currentPod?.description}</p>
        </div>

        {/* Pod Tabs */}
        <div className="flex gap-2">
          {pods.map(pod => (
            <button
              key={pod.id}
              onClick={() => setSelectedPodId(pod.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                pod.id === currentPod?.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pod.name.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-20 border-b border-slate-200">
            <tr>
              <th className="p-2 text-left sticky left-0 bg-slate-100 z-30 min-w-[200px] border-r font-semibold">
                Team Member
              </th>
              {dates.map((d, idx) => {
                const dateObj = new Date(d + 'T00:00:00Z');
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow', timeZone: 'UTC' });
                const isSunday = dateObj.getUTCDay() === 0;
                return (
                  <th
                    key={d}
                    className={`p-1 text-center min-w-[34px] border-r font-semibold ${
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
            {podEmployees.map(emp => {
              const isLead = emp.id === currentPod?.leadId;
              return (
                <tr key={emp.id} className={`hover:bg-slate-50/80 ${isLead ? 'bg-indigo-50/20' : ''}`}>
                  <td className="p-2 font-medium text-slate-800 sticky left-0 bg-white z-10 border-r shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-[140px]" title={emp.name}>{emp.name}</span>
                      {isLead && (
                        <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">
                          LEAD
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Skills: {emp.skills.join(', ')}
                    </div>
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
                        badge = (
                          <span
                            className="px-1 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 block text-center truncate"
                            title={`${brand?.name} - ${proc?.name}`}
                          >
                            {proc?.code || 'CS'}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
