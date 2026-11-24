'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  Brand, 
  Process, 
  BrandProcess, 
  RosterShift, 
  RosterConflict, 
  Pod, 
  PublicHoliday 
} from '@/lib/types';
import { dataStore } from '@/lib/data/store';
import { generateMonthlyRoster } from '@/lib/engine/generator';
import { validateRosterShifts } from '@/lib/engine/validator';

import CompanyView from '@/components/roster/CompanyView';
import PodView from '@/components/roster/PodView';
import BrandView from '@/components/roster/BrandView';
import ProcessView from '@/components/roster/ProcessView';
import EmployeeCalendar from '@/components/calendar/EmployeeCalendar';
import ShiftEditModal from '@/components/roster/ShiftEditModal';
import ConflictPanel from '@/components/roster/ConflictPanel';

import { 
  Calendar, 
  Building2, 
  Users, 
  Briefcase, 
  Layers, 
  UserCheck, 
  AlertCircle, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Send,
  Download,
  Scale,
  RotateCcw,
  X
} from 'lucide-react';

type ViewMode = 'company' | 'pod' | 'brand' | 'process' | 'employee';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function RosterPage() {
  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(12); // Defaults to Dec 2026
  const [viewMode, setViewMode] = useState<ViewMode>('company');
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');

  // Data states
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pods, setPods] = useState<Pod[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [brandProcesses, setBrandProcesses] = useState<BrandProcess[]>([]);
  const [holidays, setHolidays] = useState<PublicHoliday[]>([]);

  // Generated roster state
  const [shifts, setShifts] = useState<RosterShift[]>([]);
  const [conflicts, setConflicts] = useState<RosterConflict[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [rosterStatus, setRosterStatus] = useState<'draft' | 'published'>('draft');

  // Modals & Panels
  const [editingShift, setEditingShift] = useState<RosterShift | null>(null);
  const [isConflictPanelOpen, setIsConflictPanelOpen] = useState<boolean>(false);
  const [isFairnessModalOpen, setIsFairnessModalOpen] = useState<boolean>(false);

  // Initialize data from store
  useEffect(() => {
    let isMounted = true;
    const init = () => {
      if (!isMounted) return;
      const emps = dataStore.getEmployees();
      setEmployees(emps);
      setPods(dataStore.getPods());
      setBrands(dataStore.getBrands());
      setProcesses(dataStore.getProcesses());
      setBrandProcesses(dataStore.getBrandProcesses());
      setHolidays(dataStore.getHolidays());
      if (emps.length > 0) {
        setSelectedEmpId(emps[0].id);
      }
      loadOrGenerateRoster(2026, 12);
    };
    init();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadOrGenerateRoster = (genYear: number, genMonth: number) => {
    const rosterId = `roster-${genYear}-${String(genMonth).padStart(2, '0')}`;
    const existing = dataStore.getRosterShifts(rosterId);
    const emps = dataStore.getEmployees();

    // Reconcile: If cached shifts belong to old IDs or have no working shifts (corrupted), auto-regenerate
    const isIdMismatch = Boolean(
      existing &&
      existing.length > 0 &&
      emps.length > 0 &&
      !emps.some(e => e.id === existing[0].employeeId)
    );

    const isCorrupted = Boolean(
      existing &&
      existing.length > 0 &&
      !existing.some(s => s.shiftStatus === 'working')
    );

    if (existing && existing.length > 0 && !isIdMismatch && !isCorrupted) {
      setShifts(existing);
      setConflicts(dataStore.getRosterConflicts(rosterId));
      const r = dataStore.getRoster(rosterId);
      if (r) setRosterStatus(r.status === 'published' ? 'published' : 'draft');
    } else {
      runRosterGeneration(genYear, genMonth);
    }
  };

  const runRosterGeneration = (genYear: number, genMonth: number) => {
    setIsGenerating(true);
    const result = generateMonthlyRoster({
      year: genYear,
      month: genMonth,
      employees: dataStore.getEmployees(),
      brands: dataStore.getBrands(),
      processes: dataStore.getProcesses(),
      brandProcesses: dataStore.getBrandProcesses(),
      assignments: dataStore.getAssignments(),
      holidays: dataStore.getHolidays(),
      leaves: dataStore.getLeaves(),
      preferences: dataStore.getPreferences()
    });

    dataStore.saveRosterResult(result);
    setShifts(result.shifts);
    setConflicts(result.conflicts);
    setRosterStatus(result.roster.status === 'published' ? 'published' : 'draft');
    setIsGenerating(false);
  };

  const handleShiftSave = (updatedShift: RosterShift) => {
    const rosterId = `roster-${year}-${String(month).padStart(2, '0')}`;
    dataStore.updateShift(rosterId, updatedShift.id, updatedShift);

    const updatedShifts = shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
    setShifts(updatedShifts);

    // Dynamic re-validation
    const newConflicts = validateRosterShifts({
      rosterId,
      shifts: updatedShifts,
      employees,
      brands,
      processes,
      brandProcesses,
      holidays,
      leaves: dataStore.getLeaves(),
      preferences: dataStore.getPreferences()
    });

    dataStore.setConflicts(rosterId, newConflicts);
    setConflicts(newConflicts);
  };

  const handleExportCSV = () => {
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
    const podMap = new Map(pods.map(p => [p.id, p]));
    const bpMap = new Map(brandProcesses.map(bp => [bp.id, bp]));
    const brandMap = new Map(brands.map(b => [b.id, b]));
    const procMap = new Map(processes.map(p => [p.id, p]));

    const headers = ['Employee Name', 'Pod', 'Role', ...dates.map((_, i) => `Day ${i + 1}`), 'Total Working Days', 'Total Offs', 'Total Leaves'];

    const rows = employees.map(emp => {
      let workCount = 0;
      let offCount = 0;
      let leaveCount = 0;

      const dayCells = dates.map(d => {
        const s = shiftIndex.get(`${emp.id}_${d}`);
        if (!s) return 'Off';
        if (s.shiftStatus === 'working') {
          workCount++;
          const bp = s.brandProcessId ? bpMap.get(s.brandProcessId) : undefined;
          const b = bp ? brandMap.get(bp.brandId) : undefined;
          const p = bp ? procMap.get(bp.processId) : undefined;
          return `Working: ${b?.name || 'Assigned'} (${p?.code || 'CS'})`;
        } else if (s.shiftStatus === 'weekly_off') {
          offCount++;
          return 'Weekly Off';
        } else if (s.shiftStatus === 'holiday') {
          offCount++;
          return 'Holiday';
        } else {
          leaveCount++;
          return s.shiftStatus;
        }
      });

      const podName = podMap.get(emp.podId)?.name.split(' (')[0] || '';
      return [
        `"${emp.name}"`,
        `"${podName}"`,
        `"${emp.role}"`,
        ...dayCells.map(c => `"${c}"`),
        workCount,
        offCount,
        leaveCount
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datastraw_roster_${year}_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const hardErrors = useMemo(() => conflicts.filter(c => c.severity === 'HARD_ERROR'), [conflicts]);
  const warnings = useMemo(() => conflicts.filter(c => c.severity === 'COVERAGE_WARNING'), [conflicts]);
  const workingCount = useMemo(() => shifts.filter(s => s.shiftStatus === 'working').length, [shifts]);
  const selectedEmployee = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Fairness Stats (Weekly Off Distribution)
  const fairnessStats = useMemo(() => {
    return employees.map(emp => {
      const empShifts = shifts.filter(s => s.employeeId === emp.id);
      const work = empShifts.filter(s => s.shiftStatus === 'working').length;
      const offs = empShifts.filter(s => s.shiftStatus === 'weekly_off' || s.shiftStatus === 'holiday').length;
      const leaves = empShifts.filter(s => s.shiftStatus === 'leave' || s.shiftStatus === 'comp_off').length;
      return { emp, work, offs, leaves };
    });
  }, [employees, shifts]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Roster Management Hub</h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
                hardErrors.length === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {hardErrors.length === 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {hardErrors.length === 0 ? 'Ready to Publish' : `${hardErrors.length} Hard Conflicts`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Month of <strong>{MONTH_NAMES[month - 1]} {year}</strong> • {employees.length} Employees • {brands.length} Brands (~80% Dedicated, ~20% Multi-Resource)
          </p>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Month & Year Selectors */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs font-semibold">
            <select
              value={month}
              onChange={e => {
                const newM = Number(e.target.value);
                setMonth(newM);
                loadOrGenerateRoster(year, newM);
              }}
              className="bg-transparent text-slate-800 font-bold px-2 py-1.5 focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((mName, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {mName}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={e => {
                const newY = Number(e.target.value);
                setYear(newY);
                loadOrGenerateRoster(newY, month);
              }}
              className="bg-transparent text-slate-800 font-bold px-2 py-1.5 focus:outline-none cursor-pointer border-l border-slate-200"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => runRosterGeneration(year, month)}
            disabled={isGenerating}
            title="Re-run scheduling engine"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>

          <button
            onClick={() => setIsFairnessModalOpen(true)}
            title="Inspect weekly-off fairness distribution"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-600" />
            Fairness
          </button>

          <button
            onClick={handleExportCSV}
            title="Export monthly roster to CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            CSV
          </button>

          <button
            onClick={() => {
              if (confirm('Reset database & local storage to clean initial assessment seeds (restores Neha 5 LV & Rahul 4 LV baseline)?')) {
                dataStore.resetToInitial();
                setEmployees(dataStore.getEmployees());
                setPods(dataStore.getPods());
                setBrands(dataStore.getBrands());
                setProcesses(dataStore.getProcesses());
                setBrandProcesses(dataStore.getBrandProcesses());
                setHolidays(dataStore.getHolidays());
                runRosterGeneration(year, month);
              }
            }}
            title="Reset to clean baseline data"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Reset Baseline
          </button>

          <button
            onClick={() => {
              if (hardErrors.length > 0) {
                alert(`Cannot publish roster! Please resolve all ${hardErrors.length} Hard Conflicts first.`);
                setIsConflictPanelOpen(true);
              } else {
                setRosterStatus('published');
                alert('Roster successfully published to team calendars!');
              }
            }}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              hardErrors.length === 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            {rosterStatus === 'published' ? 'Published' : 'Publish Roster'}
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Total Monthly Shifts</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{shifts.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {workingCount} Active Working Assignments
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
            <span>Coverage Health Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">
            {Math.max(0, 100 - hardErrors.length * 2)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Across 10 Brands & 4 Processes
          </div>
        </div>

        <div 
          onClick={() => setIsConflictPanelOpen(true)}
          className="bg-white p-4 rounded-xl border border-rose-200 hover:border-rose-400 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-rose-600 text-xs font-semibold mb-1">
            <span>Hard Conflicts (Blocking)</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">{hardErrors.length}</div>
          <div className="text-[11px] text-rose-500 font-medium mt-0.5 underline">
            Click to audit gaps
          </div>
        </div>

        <div 
          onClick={() => setIsConflictPanelOpen(true)}
          className="bg-white p-4 rounded-xl border border-amber-200 hover:border-amber-400 shadow-sm cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-amber-600 text-xs font-semibold mb-1">
            <span>Coverage Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{warnings.length}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-0.5 underline">
            Understaffed / preferences
          </div>
        </div>
      </div>

      {/* 5 View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('company')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'company'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            1. Company-Wide View
          </button>
          <button
            onClick={() => setViewMode('pod')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'pod'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            2. Pod-Wise View
          </button>
          <button
            onClick={() => setViewMode('brand')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'brand'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
            3. Brand-Wise View
          </button>
          <button
            onClick={() => setViewMode('process')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'process'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-500" />
            4. Process-Wise View
          </button>
          <button
            onClick={() => setViewMode('employee')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'employee'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-rose-500" />
            5. Employee-Wise View (FullCalendar)
          </button>
        </div>

        {/* Employee selector when in Employee-Wise View */}
        {viewMode === 'employee' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Select Employee:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="text-xs font-semibold border border-slate-300 rounded-lg p-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.role.replace('_', ' ')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Render Active View */}
      <div>
        {viewMode === 'company' && (
          <CompanyView
            employees={employees}
            shifts={shifts}
            brands={brands}
            processes={processes}
            brandProcesses={brandProcesses}
            month={month}
            year={year}
            onCellClick={shift => setEditingShift(shift)}
          />
        )}

        {viewMode === 'pod' && (
          <PodView
            pods={pods}
            employees={employees}
            shifts={shifts}
            brands={brands}
            processes={processes}
            brandProcesses={brandProcesses}
            month={month}
            year={year}
            onCellClick={shift => setEditingShift(shift)}
          />
        )}

        {viewMode === 'brand' && (
          <BrandView
            brands={brands}
            brandProcesses={brandProcesses}
            processes={processes}
            employees={employees}
            shifts={shifts}
            holidays={holidays}
            month={month}
            year={year}
          />
        )}

        {viewMode === 'process' && (
          <ProcessView
            processes={processes}
            brandProcesses={brandProcesses}
            brands={brands}
            employees={employees}
            shifts={shifts}
            month={month}
            year={year}
          />
        )}

        {viewMode === 'employee' && selectedEmployee && (
          <EmployeeCalendar
            employee={selectedEmployee}
            shifts={shifts}
            brands={brands}
            processes={processes}
            brandProcesses={brandProcesses}
            month={month}
            year={year}
            onShiftClick={shift => setEditingShift(shift)}
          />
        )}
      </div>

      {/* Modals & Slide-over panels */}
      <ShiftEditModal
        shift={editingShift}
        employees={employees}
        brands={brands}
        processes={processes}
        brandProcesses={brandProcesses}
        isOpen={Boolean(editingShift)}
        onClose={() => setEditingShift(null)}
        onSave={handleShiftSave}
      />

      <ConflictPanel
        conflicts={conflicts}
        isOpen={isConflictPanelOpen}
        onClose={() => setIsConflictPanelOpen(false)}
      />

      {/* Fairness & Distribution Modal */}
      {isFairnessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Weekly-Off Fairness & Distribution</h3>
                <p className="text-[11px] text-slate-500">Audits equitable workload across {employees.length} team members</p>
              </div>
              <button onClick={() => setIsFairnessModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2 flex-1 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 border-b">
                  <tr>
                    <th className="p-2 font-semibold">Employee</th>
                    <th className="p-2 font-semibold">Working Days</th>
                    <th className="p-2 font-semibold">Rest Days</th>
                    <th className="p-2 font-semibold">Leaves</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fairnessStats.map(({ emp, work, offs, leaves }) => (
                    <tr key={emp.id} className="hover:bg-slate-50">
                      <td className="p-2 font-medium text-slate-800">{emp.name}</td>
                      <td className="p-2 text-emerald-700 font-bold">{work}</td>
                      <td className="p-2 text-slate-500 font-semibold">{offs}</td>
                      <td className="p-2 text-rose-600">{leaves > 0 ? leaves : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsFairnessModalOpen(false)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
