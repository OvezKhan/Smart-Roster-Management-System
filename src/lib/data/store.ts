import { 
  Pod, 
  Employee, 
  Brand, 
  Process, 
  BrandProcess, 
  EmployeeAssignment, 
  PublicHoliday, 
  Leave, 
  EmployeePreference,
  Roster,
  RosterShift,
  RosterConflict,
  RosterGenerationResult
} from '../types';

import { 
  INITIAL_PODS, 
  INITIAL_EMPLOYEES, 
  INITIAL_BRANDS, 
  INITIAL_PROCESSES, 
  INITIAL_BRAND_PROCESSES, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_HOLIDAYS, 
  INITIAL_LEAVES, 
  INITIAL_PREFERENCES 
} from './seedData';

import { supabase, isSupabaseConfigured } from '../supabase/client';

class AppDataStore {
  private pods: Pod[] = [...INITIAL_PODS];
  private employees: Employee[] = [...INITIAL_EMPLOYEES];
  private brands: Brand[] = [...INITIAL_BRANDS];
  private processes: Process[] = [...INITIAL_PROCESSES];
  private brandProcesses: BrandProcess[] = [...INITIAL_BRAND_PROCESSES];
  private assignments: EmployeeAssignment[] = [...INITIAL_ASSIGNMENTS];
  private holidays: PublicHoliday[] = [...INITIAL_HOLIDAYS];
  private leaves: Leave[] = [...INITIAL_LEAVES];
  private preferences: EmployeePreference[] = [...INITIAL_PREFERENCES];

  // Active rosters and computed shifts
  private rosters: Map<string, Roster> = new Map();
  private shifts: Map<string, RosterShift[]> = new Map(); // rosterId -> shifts
  private conflicts: Map<string, RosterConflict[]> = new Map(); // rosterId -> conflicts

  constructor() {
    // Attempt to hydrate from client localStorage if in browser
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  public resetToInitial() {
    this.pods = [...INITIAL_PODS];
    this.employees = [...INITIAL_EMPLOYEES];
    this.brands = [...INITIAL_BRANDS];
    this.processes = [...INITIAL_PROCESSES];
    this.brandProcesses = [...INITIAL_BRAND_PROCESSES];
    this.assignments = [...INITIAL_ASSIGNMENTS];
    this.holidays = [...INITIAL_HOLIDAYS];
    this.leaves = [...INITIAL_LEAVES];
    this.preferences = [...INITIAL_PREFERENCES];
    this.shifts.clear();
    this.rosters.clear();
    this.conflicts.clear();

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('datastraw_pods');
        localStorage.removeItem('datastraw_employees');
        localStorage.removeItem('datastraw_brands');
        localStorage.removeItem('datastraw_leaves');
        localStorage.removeItem('datastraw_assignments');
        localStorage.removeItem('datastraw_shifts');
        localStorage.removeItem('datastraw_rosters');
      } catch {
        // Ignore quota errors
      }
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('datastraw_pods', JSON.stringify(this.pods));
      localStorage.setItem('datastraw_employees', JSON.stringify(this.employees));
      localStorage.setItem('datastraw_brands', JSON.stringify(this.brands));
      localStorage.setItem('datastraw_leaves', JSON.stringify(this.leaves));
      localStorage.setItem('datastraw_assignments', JSON.stringify(this.assignments));
      // Save shifts and rosters for persistence across page refresh
      const shiftsObj: Record<string, RosterShift[]> = {};
      this.shifts.forEach((v, k) => { shiftsObj[k] = v; });
      localStorage.setItem('datastraw_shifts', JSON.stringify(shiftsObj));

      const rostersObj: Record<string, Roster> = {};
      this.rosters.forEach((v, k) => { rostersObj[k] = v; });
      localStorage.setItem('datastraw_rosters', JSON.stringify(rostersObj));
    } catch {
      // Ignore storage quota errors
    }
  }

  private loadFromStorage() {
    try {
      const e = localStorage.getItem('datastraw_employees');
      if (e) {
        const emps = JSON.parse(e);
        // If data was corrupted by UUID mismatch, discard corrupted localStorage and use clean seeds
        if (Array.isArray(emps) && emps.length > 0 && emps[0].id && !emps[0].id.startsWith('emp-')) {
          this.resetToInitial();
          return;
        }
        this.employees = emps;
      }

      const p = localStorage.getItem('datastraw_pods');
      const b = localStorage.getItem('datastraw_brands');
      const l = localStorage.getItem('datastraw_leaves');
      const a = localStorage.getItem('datastraw_assignments');
      const s = localStorage.getItem('datastraw_shifts');
      const r = localStorage.getItem('datastraw_rosters');

      if (p) this.pods = JSON.parse(p);
      if (b) this.brands = JSON.parse(b);
      if (l) this.leaves = JSON.parse(l);
      if (a) {
        const asgns = JSON.parse(a);
        if (Array.isArray(asgns) && asgns.length > 0 && asgns[0].brandProcessId && !asgns[0].brandProcessId.startsWith('bp-')) {
          this.resetToInitial();
          return;
        }
        this.assignments = asgns;
      }

      if (s) {
        const shiftsObj = JSON.parse(s);
        let hasCorruptedShifts = false;
        Object.keys(shiftsObj).forEach(k => {
          const shiftList = shiftsObj[k] as RosterShift[];
          // If shifts have non-seed employee IDs or zero working shifts, treat as corrupted
          if (Array.isArray(shiftList) && shiftList.length > 0) {
            if (shiftList.some(shift => shift.employeeId && !shift.employeeId.startsWith('emp-'))) {
              hasCorruptedShifts = true;
            }
          }
          this.shifts.set(k, shiftList);
        });
        if (hasCorruptedShifts) {
          this.resetToInitial();
          return;
        }
      }
      if (r) {
        const rostersObj = JSON.parse(r);
        Object.keys(rostersObj).forEach(k => {
          this.rosters.set(k, rostersObj[k]);
        });
      }
    } catch {
      // Fallback to initial seeds
      this.resetToInitial();
    }
  }

  // Live Supabase Sync (when credentials provided)
  public async syncFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const [empRes, brandRes, leaveRes, asgnRes] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('brands').select('*'),
        supabase.from('leaves').select('*'),
        supabase.from('employee_assignments').select('*')
      ]);

      if (brandRes.data && brandRes.data.length > 0) {
        this.brands = brandRes.data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name),
          podId: String(row.pod_id),
          isSingleResource: Boolean(row.is_single_resource),
          description: String(row.description || '')
        }));
      }

      if (empRes.data && empRes.data.length > 0) {
        this.employees = empRes.data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          name: String(row.name),
          email: String(row.email),
          podId: String(row.pod_id),
          role: row.role as Employee['role'],
          defaultWeeklyOffDays: (row.default_weekly_off_days as number[]) || [0],
          skills: (row.skills as string[]) || ['CS'],
          isActive: Boolean(row.is_active)
        }));
      }

      if (leaveRes.data && leaveRes.data.length > 0) {
        this.leaves = leaveRes.data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          employeeId: String(row.employee_id),
          startDate: String(row.start_date),
          endDate: String(row.end_date),
          leaveType: row.leave_type as Leave['leaveType'],
          status: row.status as Leave['status'],
          notes: row.notes ? String(row.notes) : undefined
        }));
      }

      if (asgnRes.data && asgnRes.data.length > 0) {
        this.assignments = asgnRes.data.map((row: Record<string, unknown>) => ({
          id: String(row.id),
          employeeId: String(row.employee_id),
          brandProcessId: String(row.brand_process_id),
          isPrimary: Boolean(row.is_primary)
        }));
      }

      this.saveToStorage();
    } catch {
      // Seamlessly stay on local storage
    }
  }

  // Getters
  getPods(): Pod[] { return [...this.pods]; }
  getEmployees(): Employee[] { return [...this.employees]; }
  getBrands(): Brand[] { return [...this.brands]; }
  getProcesses(): Process[] { return [...this.processes]; }
  getBrandProcesses(): BrandProcess[] { return [...this.brandProcesses]; }
  getAssignments(): EmployeeAssignment[] { return [...this.assignments]; }
  getHolidays(): PublicHoliday[] { return [...this.holidays]; }
  getLeaves(): Leave[] { return [...this.leaves]; }
  getPreferences(): EmployeePreference[] { return [...this.preferences]; }

  // Mutations
  addLeave(leave: Omit<Leave, 'id'>): Leave {
    const newLeave: Leave = {
      ...leave,
      id: `leave-${Date.now()}`
    };
    this.leaves.push(newLeave);
    this.saveToStorage();

    // Async push to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      supabase.from('leaves').insert({
        employee_id: newLeave.employeeId,
        start_date: newLeave.startDate,
        end_date: newLeave.endDate,
        leave_type: newLeave.leaveType,
        status: newLeave.status,
        notes: newLeave.notes
      }).then();
    }

    return newLeave;
  }

  updateLeaveStatus(leaveId: string, status: Leave['status']) {
    const l = this.leaves.find(x => x.id === leaveId);
    if (l) {
      l.status = status;
      this.saveToStorage();

      if (isSupabaseConfigured && supabase) {
        supabase.from('leaves').update({ status }).eq('id', leaveId).then();
      }
    }
  }

  addEmployee(emp: Omit<Employee, 'id'>): Employee {
    const newEmp: Employee = {
      ...emp,
      id: `emp-${Date.now()}`
    };
    this.employees.push(newEmp);
    this.saveToStorage();

    if (isSupabaseConfigured && supabase) {
      supabase.from('employees').insert({
        name: newEmp.name,
        email: newEmp.email,
        pod_id: newEmp.podId,
        role: newEmp.role,
        default_weekly_off_days: newEmp.defaultWeeklyOffDays,
        skills: newEmp.skills
      }).then();
    }

    return newEmp;
  }

  updateEmployee(id: string, updates: Partial<Employee>) {
    const idx = this.employees.findIndex(e => e.id === id);
    if (idx !== -1) {
      this.employees[idx] = { ...this.employees[idx], ...updates };
      this.saveToStorage();
    }
  }

  addBrandAssignment(assignment: Omit<EmployeeAssignment, 'id'>): EmployeeAssignment {
    const newAsgn: EmployeeAssignment = {
      ...assignment,
      id: `asgn-${Date.now()}`
    };
    this.assignments.push(newAsgn);
    this.saveToStorage();

    if (isSupabaseConfigured && supabase) {
      supabase.from('employee_assignments').insert({
        employee_id: newAsgn.employeeId,
        brand_process_id: newAsgn.brandProcessId,
        is_primary: newAsgn.isPrimary
      }).then();
    }

    return newAsgn;
  }

  removeBrandAssignment(assignmentId: string) {
    this.assignments = this.assignments.filter(a => a.id !== assignmentId);
    this.saveToStorage();

    if (isSupabaseConfigured && supabase) {
      supabase.from('employee_assignments').delete().eq('id', assignmentId).then();
    }
  }

  // Roster persistence
  saveRosterResult(result: RosterGenerationResult) {
    this.rosters.set(result.roster.id, result.roster);
    this.shifts.set(result.roster.id, result.shifts);
    this.conflicts.set(result.roster.id, result.conflicts);
    this.saveToStorage();
  }

  getRoster(rosterId: string): Roster | undefined {
    return this.rosters.get(rosterId);
  }

  getRosterShifts(rosterId: string): RosterShift[] {
    return this.shifts.get(rosterId) || [];
  }

  getRosterConflicts(rosterId: string): RosterConflict[] {
    return this.conflicts.get(rosterId) || [];
  }

  updateShift(rosterId: string, shiftId: string, updates: Partial<RosterShift>): RosterShift | null {
    const shiftList = this.shifts.get(rosterId);
    if (!shiftList) return null;
    const idx = shiftList.findIndex(s => s.id === shiftId);
    if (idx === -1) return null;

    shiftList[idx] = {
      ...shiftList[idx],
      ...updates,
      isManualOverride: true
    };
    this.saveToStorage();
    return shiftList[idx];
  }

  setConflicts(rosterId: string, newConflicts: RosterConflict[]) {
    this.conflicts.set(rosterId, newConflicts);
  }

  resetToDefault() {
    this.pods = [...INITIAL_PODS];
    this.employees = [...INITIAL_EMPLOYEES];
    this.brands = [...INITIAL_BRANDS];
    this.processes = [...INITIAL_PROCESSES];
    this.brandProcesses = [...INITIAL_BRAND_PROCESSES];
    this.assignments = [...INITIAL_ASSIGNMENTS];
    this.holidays = [...INITIAL_HOLIDAYS];
    this.leaves = [...INITIAL_LEAVES];
    this.preferences = [...INITIAL_PREFERENCES];
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }
}

// Singleton instance
export const dataStore = new AppDataStore();
