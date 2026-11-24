'use client';

import React, { useState, useEffect } from 'react';
import { Leave, PublicHoliday, Employee, LeaveType } from '@/lib/types';
import { dataStore } from '@/lib/data/store';
import { Plus, PlaneTakeoff, CheckCircle, Gift } from 'lucide-react';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Form states
  const [employeeId, setEmployeeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2026-12-10');
  const [endDate, setEndDate] = useState<string>('2026-12-12');
  const [leaveType, setLeaveType] = useState<LeaveType>('planned_leave');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    setLeaves(dataStore.getLeaves());
    setHolidays(dataStore.getHolidays());
    const emps = dataStore.getEmployees();
    setEmployees(emps);
    if (emps.length > 0) {
      setEmployeeId(emps[0].id);
    }
  }, []);

  const empMap = new Map(employees.map(e => [e.id, e]));

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !startDate || !endDate) return;

    dataStore.addLeave({
      employeeId,
      startDate,
      endDate,
      leaveType,
      status: 'approved',
      notes
    });

    setLeaves(dataStore.getLeaves());
    setNotes('');
    alert(`Leave approved for ${empMap.get(employeeId)?.name}. Go to Roster Hub to audit updated coverage.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leaves, Comp-Offs & Holidays</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-conditions ingested into the monthly scheduling engine. Approved leaves enforce mandatory hard constraints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Leaves & Holidays List */}
        <div className="md:col-span-2 space-y-6">
          {/* Leaves Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlaneTakeoff className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Approved Leaves & Comp-Offs</h3>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                {leaves.length} Scheduled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b">
                  <tr>
                    <th className="p-3 text-left font-semibold">Employee</th>
                    <th className="p-3 text-left font-semibold">Duration</th>
                    <th className="p-3 text-left font-semibold">Type</th>
                    <th className="p-3 text-left font-semibold">Status</th>
                    <th className="p-3 text-left font-semibold">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaves.map(l => {
                    const emp = empMap.get(l.employeeId);
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/70">
                        <td className="p-3 font-bold text-slate-800">{emp?.name || 'Agent'}</td>
                        <td className="p-3 text-slate-600 font-medium">
                          {l.startDate} to {l.endDate}
                        </td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              l.leaveType === 'comp_off'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {l.leaveType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-500" /> Approved
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{l.notes || 'N/A'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Public Holidays Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-sm">Recognized Public Holidays (December 2026)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {holidays.map(h => (
                <div key={h.id} className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-indigo-950 text-xs">{h.name}</div>
                    <div className="text-[11px] text-slate-500">{h.date}</div>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                    All Non-365 Brands Off
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Add Leave Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 h-fit">
          <div className="border-b pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Schedule Planned Leave / Comp-Off</h3>
            <p className="text-[11px] text-slate-500">Injects an absence into the scheduling matrix.</p>
          </div>

          <form onSubmit={handleAddLeave} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Employee</label>
              <select
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                className="w-full font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role.replace('_', ' ')})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Leave Category</label>
              <select
                value={leaveType}
                onChange={e => setLeaveType(e.target.value as LeaveType)}
                className="w-full font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="planned_leave">Planned Annual Leave</option>
                <option value="comp_off">Approved Comp-Off</option>
                <option value="sick_leave">Sick / Emergency Leave</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
              <input
                type="text"
                placeholder="e.g. Wedding, Exam, Medical..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full font-medium border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 mt-2"
            >
              <Plus className="w-4 h-4" /> Approve & Enforce Constraint
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
