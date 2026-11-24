export type Role = 'agent' | 'pod_lead' | 'ops_manager';

export type OperatingModel = 
  | '365_days' 
  | 'daily_excl_holidays' 
  | 'mon_sat_excl_holidays' 
  | 'mon_fri_excl_holidays' 
  | 'custom';

export type ShiftStatus = 'working' | 'weekly_off' | 'leave' | 'comp_off' | 'holiday';

export type LeaveType = 'planned_leave' | 'comp_off' | 'sick_leave';
export type LeaveStatus = 'approved' | 'pending' | 'rejected';

export type ConflictSeverity = 'HARD_ERROR' | 'COVERAGE_WARNING';
export type ConflictType = 
  | 'ZERO_COVERAGE' 
  | 'UNDERSTAFFED' 
  | 'DOUBLE_BOOKING' 
  | 'LEAVE_CLASH' 
  | 'PREFERENCE_UNMET' 
  | 'FATIGUE_OVERLOAD';

export interface Pod {
  id: string;
  name: string;
  leadId: string;
  leadName?: string;
  description: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  podId: string;
  role: Role;
  defaultWeeklyOffDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  skills: string[]; // e.g. ['CS', 'ACC', 'NDR', 'RET']
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  podId: string;
  isSingleResource: boolean;
  description: string;
}

export interface Process {
  id: string;
  code: string; // 'CS' | 'ACC' | 'NDR' | 'RET'
  name: string;
}

export interface BrandProcess {
  id: string;
  brandId: string;
  processId: string;
  operatingModel: OperatingModel;
  operatingDays: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  minStaffCount: number;
}

export interface EmployeeAssignment {
  id: string;
  employeeId: string;
  brandProcessId: string;
  isPrimary: boolean;
}

export interface PublicHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  appliesToAll: boolean;
}

export interface Leave {
  id: string;
  employeeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  leaveType: LeaveType;
  status: LeaveStatus;
  notes?: string;
}

export interface EmployeePreference {
  id: string;
  employeeId: string;
  preferredWeeklyOff: number; // 0=Sun..6=Sat
  notes?: string;
}

export interface Roster {
  id: string;
  month: number; // 1-12
  year: number;
  status: 'draft' | 'published' | 'archived';
  generatedAt: string;
}

export interface RosterShift {
  id: string;
  rosterId: string;
  date: string; // YYYY-MM-DD
  employeeId: string;
  brandProcessId?: string; // empty/undefined if off or leave
  shiftStatus: ShiftStatus;
  isManualOverride: boolean;
}

export interface RosterConflict {
  id: string;
  rosterId: string;
  date: string; // YYYY-MM-DD
  brandProcessId?: string;
  employeeId?: string;
  brandName?: string;
  processName?: string;
  employeeName?: string;
  severity: ConflictSeverity;
  conflictType: ConflictType;
  message: string;
}

export interface RosterGenerationResult {
  roster: Roster;
  shifts: RosterShift[];
  conflicts: RosterConflict[];
  metrics: {
    totalShifts: number;
    workingShifts: number;
    hardConflictsCount: number;
    coverageWarningsCount: number;
    coverageRatePercent: number;
  };
}
