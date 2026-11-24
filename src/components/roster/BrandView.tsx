'use client';

import React from 'react';
import { Brand, BrandProcess, Process, RosterShift, PublicHoliday, Employee } from '@/lib/types';
import { isOperatingDay } from '@/lib/engine/generator';

interface BrandViewProps {
  brands: Brand[];
  brandProcesses: BrandProcess[];
  processes: Process[];
  employees: Employee[];
  shifts: RosterShift[];
  holidays: PublicHoliday[];
  month: number;
  year: number;
}

export default function BrandView({
  brands,
  brandProcesses,
  processes,
  employees,
  shifts,
  holidays,
  month,
  year
}: BrandViewProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates = Array.from({ length: daysInMonth }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });

  const procMap = new Map(processes.map(p => [p.id, p]));
  const empMap = new Map(employees.map(e => [e.id, e]));
  const bpMap = new Map(brandProcesses.map(bp => [bp.id, bp]));

  // Index working shifts by "brandProcessId_date" and "brandId_date"
  const bpDateShifts = new Map<string, RosterShift[]>();
  const brandDateShifts = new Map<string, RosterShift[]>();

  for (const s of shifts) {
    if (s.brandProcessId && s.shiftStatus === 'working') {
      const key = `${s.brandProcessId}_${s.date}`;
      const list = bpDateShifts.get(key) || [];
      list.push(s);
      bpDateShifts.set(key, list);

      const bp = bpMap.get(s.brandProcessId);
      if (bp) {
        const brandKey = `${bp.brandId}_${s.date}`;
        const bList = brandDateShifts.get(brandKey) || [];
        bList.push(s);
        brandDateShifts.set(brandKey, bList);
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Brand-Wise Operational Coverage</h3>
          <p className="text-xs text-slate-500">
            Daily health status per brand and process. Validates operating rules (365 days vs holiday exemptions).
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Fully Covered
          </span>
          <span className="flex items-center gap-1 font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Understaffed
          </span>
          <span className="flex items-center gap-1 font-medium text-red-800 bg-red-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Zero Coverage Gap
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span> Closed / Off
          </span>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full border-collapse text-xs">
          <thead className="bg-slate-100 text-slate-700 sticky top-0 z-20 border-b border-slate-200">
            <tr>
              <th className="p-2 text-left sticky left-0 bg-slate-100 z-30 min-w-[240px] border-r font-semibold">
                Brand & Process
              </th>
              <th className="p-2 text-left min-w-[100px] border-r font-semibold">
                Operating Rule
              </th>
              {dates.map((d, idx) => {
                const dateObj = new Date(d + 'T00:00:00Z');
                const isSunday = dateObj.getUTCDay() === 0;
                return (
                  <th
                    key={d}
                    className={`p-1 text-center min-w-[34px] border-r font-semibold ${
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
            {brands.map(brand => {
              const bps = brandProcesses.filter(bp => bp.brandId === brand.id);
              return bps.map(bp => {
                const proc = procMap.get(bp.processId);
                return (
                  <tr key={bp.id} className="hover:bg-slate-50/70">
                    <td className="p-2 sticky left-0 bg-white z-10 border-r shadow-[1px_0_3px_rgba(0,0,0,0.05)]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{brand.name}</span>
                        {brand.isSingleResource ? (
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border">
                            80% Dedicated
                          </span>
                        ) : (
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                            Multi-Resource
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {proc?.name} ({proc?.code})
                      </div>
                    </td>
                    <td className="p-2 border-r text-[10px] text-slate-600 capitalize">
                      {bp.operatingModel.replace(/_/g, ' ')}
                    </td>
                    {dates.map(d => {
                      const operates = isOperatingDay(d, bp.operatingModel, bp.operatingDays, holidays);
                      const key = `${bp.id}_${d}`;
                      const directShifts = bpDateShifts.get(key) || [];
                      const brandShifts = brandDateShifts.get(`${bp.brandId}_${d}`) || [];
                      const assignedShifts = Array.from(
                        new Map([...directShifts, ...brandShifts].map(s => [s.employeeId, s])).values()
                      );
                      const count = assignedShifts.length;

                      if (!operates) {
                        return (
                          <td
                            key={d}
                            className="p-1 text-center border-r bg-slate-100 text-slate-400 font-medium text-[10px]"
                            title="Closed according to operating calendar"
                          >
                            -
                          </td>
                        );
                      }

                      // Operating day
                      const staffNames = assignedShifts
                        .map(s => empMap.get(s.employeeId)?.name || 'Agent')
                        .join(', ');

                      if (count === 0) {
                        return (
                          <td
                            key={d}
                            className="p-1 text-center border-r bg-rose-50 text-rose-700 font-bold text-[10px]"
                            title={`CRITICAL: Zero coverage for ${brand.name} on ${d}!`}
                          >
                            <span className="inline-block w-5 h-5 leading-5 rounded bg-rose-500 text-white font-black">
                              0
                            </span>
                          </td>
                        );
                      } else if (count < bp.minStaffCount) {
                        return (
                          <td
                            key={d}
                            className="p-1 text-center border-r bg-amber-50 text-amber-800 font-bold text-[10px]"
                            title={`Understaffed: ${count}/${bp.minStaffCount} staff (${staffNames})`}
                          >
                            <span className="inline-block w-5 h-5 leading-5 rounded bg-amber-400 text-amber-950 font-bold">
                              {count}
                            </span>
                          </td>
                        );
                      } else {
                        return (
                          <td
                            key={d}
                            className="p-1 text-center border-r bg-emerald-50 text-emerald-800 font-semibold text-[10px]"
                            title={`Fully Covered: ${count} staff (${staffNames})`}
                          >
                            <span className="inline-block w-5 h-5 leading-5 rounded bg-emerald-100 text-emerald-800 font-bold">
                              {count}
                            </span>
                          </td>
                        );
                      }
                    })}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
