'use client';

import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Employee, RosterShift, Brand, Process, BrandProcess } from '@/lib/types';

interface EmployeeCalendarProps {
  employee: Employee;
  shifts: RosterShift[];
  brands: Brand[];
  processes: Process[];
  brandProcesses: BrandProcess[];
  month: number;
  year: number;
  onShiftClick?: (shift: RosterShift) => void;
}

export default function EmployeeCalendar({
  employee,
  shifts,
  brands,
  processes,
  brandProcesses,
  month,
  year,
  onShiftClick
}: EmployeeCalendarProps) {
  const brandMap = useMemo(() => new Map(brands.map(b => [b.id, b])), [brands]);
  const procMap = useMemo(() => new Map(processes.map(p => [p.id, p])), [processes]);
  const bpMap = useMemo(() => new Map(brandProcesses.map(bp => [bp.id, bp])), [brandProcesses]);

  const events = useMemo(() => {
    const empShifts = shifts.filter(s => s.employeeId === employee.id);

    return empShifts.map(s => {
      let title = '';
      let backgroundColor = '#6b7280'; // gray default
      let borderColor = '#4b5563';

      if (s.shiftStatus === 'working') {
        const bp = s.brandProcessId ? bpMap.get(s.brandProcessId) : undefined;
        const brand = bp ? brandMap.get(bp.brandId) : undefined;
        const proc = bp ? procMap.get(bp.processId) : undefined;
        title = brand ? `${brand.name} (${proc?.code || 'CS'})` : 'Working';
        backgroundColor = '#10b981'; // emerald-500
        borderColor = '#059669';
      } else if (s.shiftStatus === 'weekly_off') {
        title = 'Weekly Off';
        backgroundColor = '#9ca3af'; // gray-400
        borderColor = '#6b7280';
      } else if (s.shiftStatus === 'leave') {
        title = 'Approved Leave';
        backgroundColor = '#ef4444'; // red-500
        borderColor = '#dc2626';
      } else if (s.shiftStatus === 'comp_off') {
        title = 'Comp-Off';
        backgroundColor = '#f59e0b'; // amber-500
        borderColor = '#d97706';
      } else if (s.shiftStatus === 'holiday') {
        title = 'Public Holiday';
        backgroundColor = '#6366f1'; // indigo-500
        borderColor = '#4f46e5';
      }

      return {
        id: s.id,
        title,
        date: s.date,
        allDay: true,
        backgroundColor,
        borderColor,
        extendedProps: { shift: s }
      };
    });
  }, [shifts, employee.id, bpMap, brandMap, procMap]);

  const initialDateStr = `${year}-${String(month).padStart(2, '0')}-01`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800">{employee.name}</h3>
          <p className="text-sm text-slate-500">
            Role: <span className="capitalize font-medium">{employee.role.replace('_', ' ')}</span> | 
            Skills: <span className="font-medium">{employee.skills.join(', ')}</span>
          </p>
        </div>
        <div className="flex gap-2 text-xs flex-wrap">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Working
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Weekly Off
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-100 text-red-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Leave
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Comp-Off
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Holiday
          </span>
        </div>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          initialDate={initialDateStr}
          events={events}
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'prev,next today'
          }}
          height="auto"
          eventClick={(info) => {
            const shift = info.event.extendedProps.shift as RosterShift;
            if (onShiftClick && shift) {
              onShiftClick(shift);
            }
          }}
        />
      </div>
    </div>
  );
}
