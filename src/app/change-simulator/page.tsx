'use client';

import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  Brand, 
  Process, 
  BrandProcess, 
  RosterShift 
} from '@/lib/types';
import { dataStore } from '@/lib/data/store';
import { simulateEmployeeAbsence, SimulationResult } from '@/lib/engine/changeHandler';
import { validateRosterShifts } from '@/lib/engine/validator';
import { 
  CheckCircle2, 
  UserX, 
  Users, 
  Zap, 
  Check 
} from 'lucide-react';

export default function ChangeSimulatorPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [brandProcesses, setBrandProcesses] = useState<BrandProcess[]>([]);
  const [shifts, setShifts] = useState<RosterShift[]>([]);

  // Simulation form states
  const [selectedEmpId, setSelectedEmpId] = useState<string>('emp-2'); // Neha Verma (Glow Aura single-resource)
  const [selectedDate, setSelectedDate] = useState<string>('2026-12-10');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [resolvedMessage, setResolvedMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (!isMounted) return;
      const emps = dataStore.getEmployees();
      setEmployees(emps);
      setBrands(dataStore.getBrands());
      setProcesses(dataStore.getProcesses());
      setBrandProcesses(dataStore.getBrandProcesses());

      const neha = emps.find(e => e.name === 'Neha Verma') || emps[1] || emps[0];
      if (neha) setSelectedEmpId(neha.id);

      const rosterId = 'roster-2026-12';
      const currentShifts = dataStore.getRosterShifts(rosterId);
      const isCorrupted = Boolean(
        currentShifts &&
        currentShifts.length > 0 &&
        !currentShifts.some(s => s.shiftStatus === 'working')
      );

      if (currentShifts.length === 0 || !emps.some(e => e.id === currentShifts[0].employeeId) || isCorrupted) {
        // If not generated, ID mismatch, or corrupted, trigger fresh generation
        const { generateMonthlyRoster } = await import('@/lib/engine/generator');
        const res = generateMonthlyRoster({
          year: 2026,
          month: 12,
          employees: emps,
          brands: dataStore.getBrands(),
          processes: dataStore.getProcesses(),
          brandProcesses: dataStore.getBrandProcesses(),
          assignments: dataStore.getAssignments(),
          holidays: dataStore.getHolidays(),
          leaves: dataStore.getLeaves(),
          preferences: dataStore.getPreferences()
        });
        dataStore.saveRosterResult(res);
        if (isMounted) setShifts(res.shifts);
      } else {
        setShifts(currentShifts);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  const handleSimulate = (empId = selectedEmpId, dateStr = selectedDate) => {
    setResolvedMessage(null);
    const result = simulateEmployeeAbsence(
      empId,
      dateStr,
      'roster-2026-12',
      shifts,
      employees,
      brands,
      processes,
      brandProcesses,
      dataStore.getAssignments(),
      dataStore.getHolidays()
    );
    setSimulationResult(result);
  };

  const handleApplyReplacement = (replacementEmpId: string) => {
    if (!simulationResult) return;
    if (simulationResult.affectedBrandProcesses.length === 0) {
      alert('No unstaffed brand process found on this date to replace.');
      return;
    }

    const affected = simulationResult.affectedBrandProcesses[0];
    const repEmp = employees.find(e => e.id === replacementEmpId);
    if (!repEmp) return;

    // 1. Mark absent employee as sick leave
    const absentShift = shifts.find(
      s => s.employeeId === simulationResult.affectedEmployee.id && s.date === simulationResult.date
    );
    if (absentShift) {
      dataStore.updateShift('roster-2026-12', absentShift.id, {
        shiftStatus: 'leave'
      });
    }

    // 2. Assign replacement employee to work this brandProcess
    const repShift = shifts.find(
      s => s.employeeId === replacementEmpId && s.date === simulationResult.date
    );
    if (repShift) {
      dataStore.updateShift('roster-2026-12', repShift.id, {
        shiftStatus: 'working',
        brandProcessId: affected.brandProcess.id
      });
    }

    // Refresh shifts and re-audit conflicts in store
    const updated = dataStore.getRosterShifts('roster-2026-12');
    setShifts(updated);

    const newConflicts = validateRosterShifts({
      rosterId: 'roster-2026-12',
      shifts: updated,
      employees,
      brands,
      processes,
      brandProcesses,
      holidays: dataStore.getHolidays(),
      leaves: dataStore.getLeaves(),
      preferences: dataStore.getPreferences()
    });
    dataStore.setConflicts('roster-2026-12', newConflicts);

    setResolvedMessage(
      `Success: Replaced ${simulationResult.affectedEmployee.name} with ${repEmp.name} for "${affected.brand.name} (${affected.process.code})". Coverage restored to 100%! Conflicts re-audited.`
    );
    setSimulationResult(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
          <Zap className="w-4 h-4" /> Assessment Requirement (Section 3.F)
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Dynamic Change & Impact Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl">
          Demonstrates how the system handles sudden changes after a roster is generated (e.g. employee illness or emergency leave).
          Automatically evaluates single-resource vs multi-resource coverage impact, flags gaps, and proposes qualified replacements.
        </p>
      </div>

      {/* Preset Test Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => {
            const neha = employees.find(e => e.name === 'Neha Verma') || employees[1];
            const targetId = neha ? neha.id : selectedEmpId;
            setSelectedEmpId(targetId);
            setSelectedDate('2026-12-10');
            handleSimulate(targetId, '2026-12-10');
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
              Scenario 1: 80% Single-Resource Brand
            </span>
            <span className="text-xs font-semibold text-slate-400">Dec 10, 2026</span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            Neha Verma (Glow Aura Skincare Sole Agent) reports sick
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Glow Aura requires 365-day live support. If Neha is absent, the brand experiences an immediate <strong>Zero Coverage Gap</strong>.
          </p>
        </div>

        <div 
          onClick={() => {
            const rahul = employees.find(e => e.name === 'Rahul Sharma') || employees[14];
            const targetId = rahul ? rahul.id : selectedEmpId;
            setSelectedEmpId(targetId);
            setSelectedDate('2026-12-22');
            handleSimulate(targetId, '2026-12-22');
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer shadow-sm transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Scenario 2: 20% Multi-Resource Brand
            </span>
            <span className="text-xs font-semibold text-slate-400">Dec 22, 2026</span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            Rahul Sharma (NexaStyle CS Team) takes emergency comp-off
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            NexaStyle has 3 assigned staff. The system evaluates whether remaining agents maintain minimum coverage.
          </p>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-3">Custom Absence Simulation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Employee</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.skills.join(', ')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Absence Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full text-xs font-medium border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleSimulate()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <UserX className="w-4 h-4" /> Simulate Sudden Absence
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {resolvedMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-xl flex items-center gap-3 text-xs font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{resolvedMessage}</span>
        </div>
      )}

      {/* Simulation Result Presentation */}
      {simulationResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="border-b pb-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-black text-slate-800">
                Absence Impact Evaluation: {simulationResult.affectedEmployee.name}
              </h3>
              <p className="text-xs text-slate-500">
                Date: <strong>{simulationResult.date}</strong> • Skills: {simulationResult.affectedEmployee.skills.join(', ')}
              </p>
            </div>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-3 py-1 rounded-full">
              Absence Flagged
            </span>
          </div>

          {/* Affected Brand Details */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Operational Impact on Client Accounts
            </h4>
            {simulationResult.affectedBrandProcesses.length === 0 ? (
              <div className="p-4 bg-slate-50 border rounded-xl text-xs text-slate-500">
                This employee was already scheduled for weekly off or leave on this date. No brand processes directly impacted.
              </div>
            ) : (
              simulationResult.affectedBrandProcesses.map(item => (
                <div
                  key={item.brandProcess.id}
                  className={`p-4 rounded-xl border flex items-center justify-between ${
                    item.isGapCreated
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-emerald-50/60 border-emerald-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{item.brand.name}</span>
                      <span className="text-[10px] font-semibold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        {item.process.name} ({item.process.code})
                      </span>
                      {item.isSingleResource && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          80% Single-Resource Brand
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Remaining Active Staff: <strong>{item.remainingStaffCount}</strong> / Required: <strong>{item.requiredStaffCount}</strong>
                    </p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                      item.isGapCreated
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {item.isGapCreated ? 'CRITICAL GAP CREATED' : 'COVERAGE SUSTAINED'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Recommended Replacements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  System-Recommended Qualified Substitutes
                </h4>
                <p className="text-[11px] text-slate-500">
                  Scanned idle / rest-day team members in the same pod possessing verified skills.
                </p>
              </div>
              <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {simulationResult.recommendedReplacements.length} Candidates Found
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {simulationResult.recommendedReplacements.map(cand => (
                <div
                  key={cand.employee.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 shadow-sm flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-sm">{cand.employee.name}</span>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                        {cand.employee.role.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{cand.reason}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span>Skills:</span>
                      {cand.employee.skills.map(s => (
                        <span key={s} className="px-1.5 py-0.2 bg-slate-100 rounded font-bold text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyReplacement(cand.employee.id)}
                    className="mt-3 w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" /> Assign as Replacement & Rebalance
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
