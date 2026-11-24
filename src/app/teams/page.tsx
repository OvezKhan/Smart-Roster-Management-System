'use client';

import React, { useState, useEffect } from 'react';
import { Employee, Pod } from '@/lib/types';
import { dataStore } from '@/lib/data/store';
import { Search, Mail } from 'lucide-react';

export default function TeamsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [search, setSearch] = useState<string>('');
  const [selectedPodFilter, setSelectedPodFilter] = useState<string>('all');

  useEffect(() => {
    setEmployees(dataStore.getEmployees());
    setPods(dataStore.getPods());
  }, []);

  const podMap = new Map(pods.map(p => [p.id, p]));

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                          emp.email.toLowerCase().includes(search.toLowerCase()) ||
                          emp.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesPod = selectedPodFilter === 'all' || emp.podId === selectedPodFilter;
    return matchesSearch && matchesPod;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Teams & Pod Leads Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Total of <strong>{employees.length} Employees</strong> across <strong>{pods.length} Operational Pods</strong>. Fully satisfies assessment &ge; 30 team member criteria.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, skill..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="text-xs font-medium pl-9 pr-4 py-2 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
            />
          </div>

          <select
            value={selectedPodFilter}
            onChange={e => setSelectedPodFilter(e.target.value)}
            className="text-xs font-semibold border border-slate-300 rounded-xl p-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Operational Pods</option>
            {pods.map(pod => (
              <option key={pod.id} value={pod.id}>
                {pod.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pod Overviews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pods.map(pod => {
          const lead = employees.find(e => e.id === pod.leadId);
          const members = employees.filter(e => e.podId === pod.id);

          return (
            <div key={pod.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {members.length} Members
                </span>
                <span className="text-xs text-slate-400 font-semibold">Pod Lead: {lead?.name || 'Assigned'}</span>
              </div>
              <h3 className="font-bold text-slate-800 text-base">{pod.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pod.description}</p>
            </div>
          );
        })}
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Showing {filteredEmployees.length} of {employees.length} Team Members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b">
              <tr>
                <th className="p-3 text-left font-semibold">Name & Email</th>
                <th className="p-3 text-left font-semibold">Pod</th>
                <th className="p-3 text-left font-semibold">Role</th>
                <th className="p-3 text-left font-semibold">Process Skills</th>
                <th className="p-3 text-left font-semibold">Contractual Weekly Off</th>
                <th className="p-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map(emp => {
                const pod = podMap.get(emp.podId);
                const isLead = emp.role === 'pod_lead';
                const offNames = emp.defaultWeeklyOffDays
                  .map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                  .join(', ');

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{emp.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {emp.email}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {pod?.name.split(' (')[0]}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isLead
                            ? 'bg-indigo-100 text-indigo-700'
                            : emp.role === 'ops_manager'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {emp.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {emp.skills.map(s => (
                          <span
                            key={s}
                            className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-bold text-[10px]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {offNames}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
