'use client';

import React, { useState, useEffect } from 'react';
import { Brand, BrandProcess, Process, Pod, Employee, EmployeeAssignment } from '@/lib/types';
import { dataStore } from '@/lib/data/store';
import { UserPlus, X, Check, Shield } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandProcesses, setBrandProcesses] = useState<BrandProcess[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);

  // Assignment Modal State
  const [assigningBp, setAssigningBp] = useState<BrandProcess | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setBrands(dataStore.getBrands());
    setBrandProcesses(dataStore.getBrandProcesses());
    setProcesses(dataStore.getProcesses());
    setPods(dataStore.getPods());
    const emps = dataStore.getEmployees();
    setEmployees(emps);
    setAssignments(dataStore.getAssignments());
    if (emps.length > 0) setSelectedEmpId(emps[0].id);
  };

  const procMap = new Map(processes.map(p => [p.id, p]));
  const podMap = new Map(pods.map(p => [p.id, p]));
  const empMap = new Map(employees.map(e => [e.id, e]));

  const singleResourceCount = brands.filter(b => b.isSingleResource).length;
  const multiResourceCount = brands.filter(b => !b.isSingleResource).length;

  const handleOpenAssign = (bp: BrandProcess) => {
    setAssigningBp(bp);
    if (employees.length > 0) setSelectedEmpId(employees[0].id);
  };

  const handleConfirmAssign = () => {
    if (!assigningBp || !selectedEmpId) return;

    dataStore.addBrandAssignment({
      employeeId: selectedEmpId,
      brandProcessId: assigningBp.id,
      isPrimary: true
    });

    setAssigningBp(null);
    refreshData();
  };

  const handleRemoveAssign = (asgnId: string) => {
    if (confirm('Are you sure you want to remove this employee assignment?')) {
      dataStore.removeBrandAssignment(asgnId);
      refreshData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" /> Operational Rule Management
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Brands & Operating Calendars</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure client rules and team assignments. Operations managers can add or remove assignments directly from this interface.
          </p>
        </div>

        <div className="flex gap-2">
          <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200">
            {singleResourceCount} Dedicated Brands (~80%)
          </span>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
            {multiResourceCount} Multi-Resource Brands (~20%)
          </span>
        </div>
      </div>

      {/* Brands List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {brands.map(brand => {
          const pod = podMap.get(brand.podId);
          const bps = brandProcesses.filter(bp => bp.brandId === brand.id);

          return (
            <div key={brand.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-base">{brand.name}</h3>
                    {brand.isSingleResource ? (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        80% Dedicated
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Multi-Resource
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{brand.description}</p>
                </div>
                <span className="text-[10px] font-semibold bg-slate-50 border px-2 py-1 rounded text-slate-600">
                  {pod?.name.split(' (')[0]}
                </span>
              </div>

              {/* Processes & Assigned Staff */}
              <div className="space-y-3 border-t pt-3 border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Configured Processes & Allocations
                  </span>
                </div>

                {bps.map(bp => {
                  const proc = procMap.get(bp.processId);
                  const asgns = assignments.filter(a => a.brandProcessId === bp.id);

                  return (
                    <div key={bp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {proc?.name} ({proc?.code})
                        </span>
                        <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                          {bp.operatingModel.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600">
                        Min Staff Required: <strong>{bp.minStaffCount}</strong>
                      </div>

                      {/* Assigned Employees List with Remove action */}
                      <div>
                        <div className="text-[10px] font-semibold text-slate-500 mb-1">
                          Assigned Staff ({asgns.length}):
                        </div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {asgns.length === 0 ? (
                            <span className="text-[11px] text-rose-500 italic">No agents assigned</span>
                          ) : (
                            asgns.map(a => {
                              const emp = empMap.get(a.employeeId);
                              return (
                                <span
                                  key={a.id}
                                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-800 shadow-sm"
                                >
                                  <span>{emp?.name || 'Agent'}</span>
                                  <button
                                    onClick={() => handleRemoveAssign(a.id)}
                                    title="Remove assignment"
                                    className="p-0.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })
                          )}

                          {/* Add Assignment Button */}
                          <button
                            onClick={() => handleOpenAssign(bp)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border border-dashed border-indigo-300 px-2 py-1 rounded-lg transition-colors"
                          >
                            <UserPlus className="w-3 h-3" /> Assign Agent
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assignment Modal */}
      {assigningBp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Assign Agent to Process</h3>
                <p className="text-[11px] text-slate-500">
                  {procMap.get(assigningBp.processId)?.name}
                </p>
              </div>
              <button
                onClick={() => setAssigningBp(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Team Member
              </label>
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {employees.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role.replace('_', ' ')}) — Skills: {e.skills.join(', ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                onClick={() => setAssigningBp(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
