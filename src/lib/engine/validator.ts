import { 
  Employee, 
  Brand, 
  Process, 
  BrandProcess, 
  PublicHoliday, 
  Leave, 
  EmployeePreference, 
  RosterShift, 
  RosterConflict 
} from '../types';
import { isOperatingDay } from './generator';

interface ValidationContext {
  rosterId: string;
  shifts: RosterShift[];
  employees: Employee[];
  brands: Brand[];
  processes: Process[];
  brandProcesses: BrandProcess[];
  holidays: PublicHoliday[];
  leaves: Leave[];
  preferences: EmployeePreference[];
}

export function validateRosterShifts(ctx: ValidationContext): RosterConflict[] {
  const conflicts: RosterConflict[] = [];

  const brandMap = new Map(ctx.brands.map(b => [b.id, b]));
  const procMap = new Map(ctx.processes.map(p => [p.id, p]));
  const bpMap = new Map(ctx.brandProcesses.map(bp => [bp.id, bp]));

  // Group shifts by date and employee, and by date and brandProcess
  const empDateShifts = new Map<string, RosterShift[]>(); // "empId_date" -> shifts
  const bpDateShifts = new Map<string, RosterShift[]>(); // "bpId_date" -> shifts
  const brandDateShifts = new Map<string, RosterShift[]>(); // "brandId_date" -> shifts
  const allDates = new Set<string>();

  for (const s of ctx.shifts) {
    allDates.add(s.date);

    const empKey = `${s.employeeId}_${s.date}`;
    const eList = empDateShifts.get(empKey) || [];
    eList.push(s);
    empDateShifts.set(empKey, eList);

    if (s.brandProcessId && s.shiftStatus === 'working') {
      const bpKey = `${s.brandProcessId}_${s.date}`;
      const bList = bpDateShifts.get(bpKey) || [];
      bList.push(s);
      bpDateShifts.set(bpKey, bList);

      const bp = bpMap.get(s.brandProcessId);
      if (bp) {
        const brandKey = `${bp.brandId}_${s.date}`;
        const brList = brandDateShifts.get(brandKey) || [];
        brList.push(s);
        brandDateShifts.set(brandKey, brList);
      }
    }
  }

  // 1. Audit Double-Booking & Leave Clashes per Employee
  for (const emp of ctx.employees) {
    for (const dateStr of Array.from(allDates)) {
      const empKey = `${emp.id}_${dateStr}`;
      const dayShifts = empDateShifts.get(empKey) || [];
      const workingShifts = dayShifts.filter(s => s.shiftStatus === 'working');

      // Double-booking check: multiple shifts across DIFFERENT brands
      const distinctBrands = new Set(
        workingShifts.map(s => s.brandProcessId ? bpMap.get(s.brandProcessId)?.brandId : null).filter(Boolean)
      );

      if (distinctBrands.size > 1) {
        conflicts.push({
          id: `conf-double-${emp.id}-${dateStr}`,
          rosterId: ctx.rosterId,
          date: dateStr,
          employeeId: emp.id,
          employeeName: emp.name,
          severity: 'HARD_ERROR',
          conflictType: 'DOUBLE_BOOKING',
          message: `Double-Booking: ${emp.name} is assigned to multiple overlapping shifts across different brands on ${dateStr}.`
        });
      }

      // Leave clash check
      const onLeave = ctx.leaves.some(l => 
        l.employeeId === emp.id && 
        l.status === 'approved' && 
        dateStr >= l.startDate && 
        dateStr <= l.endDate
      );

      if (onLeave && workingShifts.length > 0) {
        conflicts.push({
          id: `conf-leave-clash-${emp.id}-${dateStr}`,
          rosterId: ctx.rosterId,
          date: dateStr,
          employeeId: emp.id,
          employeeName: emp.name,
          severity: 'HARD_ERROR',
          conflictType: 'LEAVE_CLASH',
          message: `Leave Clash: ${emp.name} is scheduled to work on ${dateStr} while on approved leave.`
        });
      }
    }
  }

  // 2. Audit Brand Process Coverage Requirements
  for (const bp of ctx.brandProcesses) {
    const brand = brandMap.get(bp.brandId);
    const proc = procMap.get(bp.processId);

    for (const dateStr of Array.from(allDates)) {
      const operates = isOperatingDay(dateStr, bp.operatingModel, bp.operatingDays, ctx.holidays);
      if (!operates) continue;

      const bpKey = `${bp.id}_${dateStr}`;
      const directShifts = bpDateShifts.get(bpKey) || [];
      const brandShifts = brandDateShifts.get(`${bp.brandId}_${dateStr}`) || [];
      // Any employee working on this brand provides active coverage
      const activeStaffIds = new Set([
        ...directShifts.map(s => s.employeeId),
        ...brandShifts.map(s => s.employeeId)
      ]);
      const staffCount = activeStaffIds.size;

      if (staffCount === 0) {
        conflicts.push({
          id: `conf-cov-zero-${bp.id}-${dateStr}`,
          rosterId: ctx.rosterId,
          date: dateStr,
          brandProcessId: bp.id,
          brandName: brand?.name,
          processName: proc?.name,
          severity: 'HARD_ERROR',
          conflictType: 'ZERO_COVERAGE',
          message: `Zero Coverage: Brand "${brand?.name}" (${proc?.name}) is completely unstaffed on ${dateStr}.`
        });
      } else if (staffCount < bp.minStaffCount) {
        conflicts.push({
          id: `conf-cov-under-${bp.id}-${dateStr}`,
          rosterId: ctx.rosterId,
          date: dateStr,
          brandProcessId: bp.id,
          brandName: brand?.name,
          processName: proc?.name,
          severity: 'COVERAGE_WARNING',
          conflictType: 'UNDERSTAFFED',
          message: `Understaffed: Brand "${brand?.name}" (${proc?.name}) has ${staffCount}/${bp.minStaffCount} required staff on ${dateStr}.`
        });
      }
    }
  }

  return conflicts;
}
