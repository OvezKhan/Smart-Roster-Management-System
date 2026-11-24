import { 
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
  RosterGenerationResult, 
  OperatingModel 
} from '../types';

interface GenerationContext {
  year: number;
  month: number; // 1-12
  employees: Employee[];
  brands: Brand[];
  processes: Process[];
  brandProcesses: BrandProcess[];
  assignments: EmployeeAssignment[];
  holidays: PublicHoliday[];
  leaves: Leave[];
  preferences: EmployeePreference[];
}

export function isOperatingDay(
  dateStr: string,
  model: OperatingModel,
  operatingDays: number[],
  holidays: PublicHoliday[]
): boolean {
  const date = new Date(dateStr + 'T00:00:00Z');
  const dayOfWeek = date.getUTCDay(); // 0=Sun..6=Sat
  const isHoliday = holidays.some(h => h.date === dateStr);

  switch (model) {
    case '365_days':
      return true; // Operates every single day including holidays and Sundays
    case 'daily_excl_holidays':
      return !isHoliday;
    case 'mon_sat_excl_holidays':
      return dayOfWeek >= 1 && dayOfWeek <= 6 && !isHoliday;
    case 'mon_fri_excl_holidays':
      return dayOfWeek >= 1 && dayOfWeek <= 5 && !isHoliday;
    case 'custom':
      return operatingDays.includes(dayOfWeek) && !isHoliday;
    default:
      return dayOfWeek >= 1 && dayOfWeek <= 6 && !isHoliday;
  }
}

export function generateMonthlyRoster(ctx: GenerationContext): RosterGenerationResult {
  const rosterId = `roster-${ctx.year}-${String(ctx.month).padStart(2, '0')}`;
  const daysInMonth = new Date(ctx.year, ctx.month, 0).getDate();
  const dates: string[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(ctx.month).padStart(2, '0');
    dates.push(`${ctx.year}-${monthStr}-${dayStr}`);
  }

  const shifts: RosterShift[] = [];
  const conflicts: RosterConflict[] = [];

  // Helper lookups
  const brandMap = new Map(ctx.brands.map(b => [b.id, b]));
  const procMap = new Map(ctx.processes.map(p => [p.id, p]));
  const empMap = new Map(ctx.employees.map(e => [e.id, e]));
  const bpMap = new Map(ctx.brandProcesses.map(bp => [bp.id, bp]));

  // Brand-process to assigned employees map
  const bpAssignedEmps = new Map<string, EmployeeAssignment[]>();
  for (const asgn of ctx.assignments) {
    const list = bpAssignedEmps.get(asgn.brandProcessId) || [];
    list.push(asgn);
    bpAssignedEmps.set(asgn.brandProcessId, list);
  }

  // Track daily assignments per employee to prevent double booking
  const empDailyAssignment = new Map<string, Map<string, RosterShift>>(); // empId -> date -> shift

  // 1. First pass: Pre-assign planned leaves and comp-offs (Hard constraints)
  for (const emp of ctx.employees) {
    empDailyAssignment.set(emp.id, new Map());
  }

  for (const leave of ctx.leaves) {
    if (leave.status !== 'approved') continue;
    for (const dateStr of dates) {
      if (dateStr >= leave.startDate && dateStr <= leave.endDate) {
        const empShifts = empDailyAssignment.get(leave.employeeId);
        if (empShifts) {
          const shift: RosterShift = {
            id: `shift-${leave.employeeId}-${dateStr}`,
            rosterId,
            date: dateStr,
            employeeId: leave.employeeId,
            shiftStatus: leave.leaveType === 'comp_off' ? 'comp_off' : 'leave',
            isManualOverride: false
          };
          empShifts.set(dateStr, shift);
          shifts.push(shift);
        }
      }
    }
  }

  // 2. Second pass: Schedule Single-Resource Brands (~80%)
  const singleResourceBPs = ctx.brandProcesses.filter(bp => {
    const brand = brandMap.get(bp.brandId);
    return brand?.isSingleResource === true;
  });

  for (const bp of singleResourceBPs) {
    const brand = brandMap.get(bp.brandId);
    const proc = procMap.get(bp.processId);
    const assigned = bpAssignedEmps.get(bp.id) || [];
    const primary = assigned.find(a => a.isPrimary) || assigned[0];

    for (const dateStr of dates) {
      const operates = isOperatingDay(dateStr, bp.operatingModel, bp.operatingDays, ctx.holidays);
      const isHoliday = ctx.holidays.some(h => h.date === dateStr);
      const dateObj = new Date(dateStr + 'T00:00:00Z');
      const dayOfWeek = dateObj.getUTCDay();

      if (!primary) {
        if (operates) {
          conflicts.push({
            id: `conf-no-assign-${bp.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            brandProcessId: bp.id,
            brandName: brand?.name,
            processName: proc?.name,
            severity: 'HARD_ERROR',
            conflictType: 'ZERO_COVERAGE',
            message: `Brand "${brand?.name}" (${proc?.name}) requires coverage, but has no assigned employee.`
          });
        }
        continue;
      }

      const emp = empMap.get(primary.employeeId);
      const empShifts = empDailyAssignment.get(primary.employeeId)!;
      const existingShift = empShifts.get(dateStr);

      if (existingShift) {
        // Employee is already on leave or pre-assigned
        if (operates && (existingShift.shiftStatus === 'leave' || existingShift.shiftStatus === 'comp_off')) {
          conflicts.push({
            id: `conf-single-leave-${bp.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            brandProcessId: bp.id,
            employeeId: emp?.id,
            brandName: brand?.name,
            processName: proc?.name,
            employeeName: emp?.name,
            severity: 'HARD_ERROR',
            conflictType: 'ZERO_COVERAGE',
            message: `Coverage Gap: "${brand?.name}" is unstaffed on ${dateStr}. Dedicated employee ${emp?.name} is on approved ${existingShift.shiftStatus}.`
          });
        }
        continue;
      }

      const isDefaultOff = emp?.defaultWeeklyOffDays.includes(dayOfWeek);

      if (operates) {
        if (bp.operatingModel === '365_days' && isDefaultOff) {
          // Employee has their legitimate weekly off, but brand needs 365-day coverage!
          const shift: RosterShift = {
            id: `shift-${emp!.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            employeeId: emp!.id,
            shiftStatus: 'weekly_off',
            isManualOverride: false
          };
          empShifts.set(dateStr, shift);
          shifts.push(shift);

          conflicts.push({
            id: `conf-single-off-gap-${bp.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            brandProcessId: bp.id,
            employeeId: emp?.id,
            brandName: brand?.name,
            processName: proc?.name,
            employeeName: emp?.name,
            severity: 'HARD_ERROR',
            conflictType: 'ZERO_COVERAGE',
            message: `Coverage Gap: "${brand?.name}" requires 365-day operations, but sole agent ${emp?.name} is on scheduled weekly off. Backup needed.`
          });
        } else {
          // Normal working assignment
          const shift: RosterShift = {
            id: `shift-${emp!.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            employeeId: emp!.id,
            brandProcessId: bp.id,
            shiftStatus: 'working',
            isManualOverride: false
          };
          empShifts.set(dateStr, shift);
          shifts.push(shift);
        }
      } else {
        // Brand is not operating on this day
        const shift: RosterShift = {
          id: `shift-${emp!.id}-${dateStr}`,
          rosterId,
          date: dateStr,
          employeeId: emp!.id,
          shiftStatus: isHoliday ? 'holiday' : 'weekly_off',
          isManualOverride: false
        };
        empShifts.set(dateStr, shift);
        shifts.push(shift);
      }
    }
  }

  // 3. Third pass: Multi-Resource Brands (~20%)
  const multiResourceBPs = ctx.brandProcesses.filter(bp => {
    const brand = brandMap.get(bp.brandId);
    return brand?.isSingleResource === false;
  });

  for (const bp of multiResourceBPs) {
    const brand = brandMap.get(bp.brandId);
    const proc = procMap.get(bp.processId);
    const assigned = bpAssignedEmps.get(bp.id) || [];

    for (const dateStr of dates) {
      const operates = isOperatingDay(dateStr, bp.operatingModel, bp.operatingDays, ctx.holidays);
      const isHoliday = ctx.holidays.some(h => h.date === dateStr);
      const dateObj = new Date(dateStr + 'T00:00:00Z');
      const dayOfWeek = dateObj.getUTCDay();

      if (!operates) {
        // Non-operating day: mark weekly off or holiday for unassigned staff
        for (const asgn of assigned) {
          const empShifts = empDailyAssignment.get(asgn.employeeId)!;
          if (!empShifts.get(dateStr)) {
            const shift: RosterShift = {
              id: `shift-${asgn.employeeId}-${dateStr}`,
              rosterId,
              date: dateStr,
              employeeId: asgn.employeeId,
              shiftStatus: isHoliday ? 'holiday' : 'weekly_off',
              isManualOverride: false
            };
            empShifts.set(dateStr, shift);
            shifts.push(shift);
          }
        }
        continue;
      }

      // Operates today: calculate staffing
      let workingCount = 0;
      const candidates = assigned.map(a => empMap.get(a.employeeId)!).filter(Boolean);

      // Stagger weekly offs among candidates
      for (let i = 0; i < candidates.length; i++) {
        const emp = candidates[i];
        const empShifts = empDailyAssignment.get(emp.id)!;
        const existing = empShifts.get(dateStr);

        if (existing) {
          if (existing.shiftStatus === 'working') {
            const existingBp = bpMap.get(existing.brandProcessId || '');
            const isSameBrand = existingBp && existingBp.brandId === bp.brandId;
            if (existing.brandProcessId === bp.id || isSameBrand) {
              workingCount++;
            }
          }
          continue;
        }

        const isOffDay = emp.defaultWeeklyOffDays.includes(dayOfWeek);

        // Preference check
        const pref = ctx.preferences.find(p => p.employeeId === emp.id);
        const prefersOffToday = pref?.preferredWeeklyOff === dayOfWeek;

        if (isOffDay || (prefersOffToday && workingCount >= bp.minStaffCount)) {
          // Give rest day if minimum staff can still be met
          const shift: RosterShift = {
            id: `shift-${emp.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            employeeId: emp.id,
            shiftStatus: 'weekly_off',
            isManualOverride: false
          };
          empShifts.set(dateStr, shift);
          shifts.push(shift);
        } else {
          // Assign to work
          const shift: RosterShift = {
            id: `shift-${emp.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            employeeId: emp.id,
            brandProcessId: bp.id,
            shiftStatus: 'working',
            isManualOverride: false
          };
          empShifts.set(dateStr, shift);
          shifts.push(shift);
          workingCount++;

          if (prefersOffToday && workingCount < bp.minStaffCount) {
            conflicts.push({
              id: `conf-pref-${emp.id}-${dateStr}`,
              rosterId,
              date: dateStr,
              brandProcessId: bp.id,
              employeeId: emp.id,
              brandName: brand?.name,
              processName: proc?.name,
              employeeName: emp.name,
              severity: 'COVERAGE_WARNING',
              conflictType: 'PREFERENCE_UNMET',
              message: `${emp.name} requested weekly off today, but was scheduled to maintain minimum coverage for "${brand?.name}".`
            });
          }
        }
      }

      // Check coverage health
      if (workingCount === 0) {
        conflicts.push({
          id: `conf-multi-zero-${bp.id}-${dateStr}`,
          rosterId,
          date: dateStr,
          brandProcessId: bp.id,
          brandName: brand?.name,
          processName: proc?.name,
          severity: 'HARD_ERROR',
          conflictType: 'ZERO_COVERAGE',
          message: `Zero Coverage: "${brand?.name}" (${proc?.name}) requires ${bp.minStaffCount} staff, but 0 are working on ${dateStr}.`
        });
      } else if (workingCount < bp.minStaffCount) {
        conflicts.push({
          id: `conf-multi-under-${bp.id}-${dateStr}`,
          rosterId,
          date: dateStr,
          brandProcessId: bp.id,
          brandName: brand?.name,
          processName: proc?.name,
          severity: 'COVERAGE_WARNING',
          conflictType: 'UNDERSTAFFED',
          message: `Understaffed: "${brand?.name}" (${proc?.name}) has ${workingCount}/${bp.minStaffCount} required staff on ${dateStr}.`
        });
      }
    }
  }

  // 4. Fill unassigned days for employees not yet scheduled on dates
  for (const emp of ctx.employees) {
    const empShifts = empDailyAssignment.get(emp.id)!;
    for (const dateStr of dates) {
      if (!empShifts.get(dateStr)) {
        const isHoliday = ctx.holidays.some(h => h.date === dateStr);
        const shift: RosterShift = {
          id: `shift-${emp.id}-${dateStr}`,
          rosterId,
          date: dateStr,
          employeeId: emp.id,
          shiftStatus: isHoliday ? 'holiday' : 'weekly_off',
          isManualOverride: false
        };
        empShifts.set(dateStr, shift);
        shifts.push(shift);
      }
    }
  }

  // 5. Fatigue Check: Over 6 consecutive working days
  for (const emp of ctx.employees) {
    const empShifts = empDailyAssignment.get(emp.id)!;
    let consecutiveDays = 0;
    for (const dateStr of dates) {
      const s = empShifts.get(dateStr);
      if (s?.shiftStatus === 'working') {
        consecutiveDays++;
        if (consecutiveDays > 6) {
          conflicts.push({
            id: `conf-fatigue-${emp.id}-${dateStr}`,
            rosterId,
            date: dateStr,
            employeeId: emp.id,
            employeeName: emp.name,
            severity: 'COVERAGE_WARNING',
            conflictType: 'FATIGUE_OVERLOAD',
            message: `Fatigue Alert: ${emp.name} is scheduled to work ${consecutiveDays} consecutive days without a rest day by ${dateStr}.`
          });
        }
      } else {
        consecutiveDays = 0;
      }
    }
  }

  const hardCount = conflicts.filter(c => c.severity === 'HARD_ERROR').length;
  const warningCount = conflicts.filter(c => c.severity === 'COVERAGE_WARNING').length;
  const workingShiftsCount = shifts.filter(s => s.shiftStatus === 'working').length;
  const totalSlots = ctx.brandProcesses.length * dates.length;
  const coverageRate = Math.max(0, Math.min(100, Math.round(((totalSlots - hardCount) / Math.max(1, totalSlots)) * 100)));

  const roster: Roster = {
    id: rosterId,
    month: ctx.month,
    year: ctx.year,
    status: hardCount === 0 ? 'published' : 'draft',
    generatedAt: new Date().toISOString()
  };

  return {
    roster,
    shifts,
    conflicts,
    metrics: {
      totalShifts: shifts.length,
      workingShifts: workingShiftsCount,
      hardConflictsCount: hardCount,
      coverageWarningsCount: warningCount,
      coverageRatePercent: coverageRate
    }
  };
}
