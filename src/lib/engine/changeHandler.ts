import { 
  Employee, 
  Brand, 
  BrandProcess, 
  Process, 
  RosterShift, 
  RosterConflict,
  EmployeeAssignment,
  PublicHoliday
} from '../types';
import { isOperatingDay } from './generator';

export interface SimulationResult {
  affectedEmployee: Employee;
  date: string;
  affectedBrandProcesses: {
    brandProcess: BrandProcess;
    brand: Brand;
    process: Process;
    isSingleResource: boolean;
    remainingStaffCount: number;
    requiredStaffCount: number;
    isGapCreated: boolean;
  }[];
  newConflicts: RosterConflict[];
  recommendedReplacements: {
    employee: Employee;
    reason: string;
    isSamePod: boolean;
    hasMatchingSkills: boolean;
  }[];
}

export function simulateEmployeeAbsence(
  employeeId: string,
  dateStr: string,
  rosterId: string,
  currentShifts: RosterShift[],
  employees: Employee[],
  brands: Brand[],
  processes: Process[],
  brandProcesses: BrandProcess[],
  assignments?: EmployeeAssignment[],
  holidays?: PublicHoliday[]
): SimulationResult | null {
  const emp = employees.find(e => e.id === employeeId);
  if (!emp) return null;

  const brandMap = new Map(brands.map(b => [b.id, b]));
  const procMap = new Map(processes.map(p => [p.id, p]));
  const bpMap = new Map(brandProcesses.map(bp => [bp.id, bp]));

  // Find what this employee was scheduled to work on this date
  const workingShift = currentShifts.find(
    s => s.employeeId === employeeId && s.date === dateStr && s.shiftStatus === 'working'
  );

  const targetBpList: BrandProcess[] = [];

  if (workingShift && workingShift.brandProcessId) {
    const bp = bpMap.get(workingShift.brandProcessId);
    if (bp) targetBpList.push(bp);
  } else if (assignments) {
    // If employee was not working (e.g. on leave or weekly off), find brand processes they are assigned to
    const empBpIds = assignments.filter(a => a.employeeId === employeeId).map(a => a.brandProcessId);
    for (const bpId of empBpIds) {
      const bp = bpMap.get(bpId);
      if (bp) {
        const operates = holidays 
          ? isOperatingDay(dateStr, bp.operatingModel, bp.operatingDays, holidays)
          : true;
        if (operates) {
          targetBpList.push(bp);
        }
      }
    }
  }

  const affectedBPs: SimulationResult['affectedBrandProcesses'] = [];
  const newConflicts: RosterConflict[] = [];

  for (const bp of targetBpList) {
    const brand = brandMap.get(bp.brandId);
    const proc = procMap.get(bp.processId);
    if (!brand || !proc) continue;

    // Count remaining staff scheduled for this brand process on that day
    const otherWorking = currentShifts.filter(
      s => (s.brandProcessId === bp.id || (s.brandProcessId && bpMap.get(s.brandProcessId)?.brandId === bp.brandId)) && 
           s.date === dateStr && 
           s.shiftStatus === 'working' && 
           s.employeeId !== employeeId
    );

    const remainingCount = otherWorking.length;
    const isGap = remainingCount < bp.minStaffCount;

    affectedBPs.push({
      brandProcess: bp,
      brand,
      process: proc,
      isSingleResource: brand.isSingleResource,
      remainingStaffCount: remainingCount,
      requiredStaffCount: bp.minStaffCount,
      isGapCreated: isGap
    });

    if (remainingCount === 0) {
      newConflicts.push({
        id: `sim-gap-${bp.id}-${dateStr}`,
        rosterId,
        date: dateStr,
        brandProcessId: bp.id,
        employeeId: emp.id,
        brandName: brand.name,
        processName: proc.name,
        employeeName: emp.name,
        severity: 'HARD_ERROR',
        conflictType: 'ZERO_COVERAGE',
        message: `Coverage Gap: "${brand.name}" (${proc.name}) is left completely unstaffed due to ${emp.name}'s absence.`
      });
    } else if (remainingCount < bp.minStaffCount) {
      newConflicts.push({
        id: `sim-under-${bp.id}-${dateStr}`,
        rosterId,
        date: dateStr,
        brandProcessId: bp.id,
        brandName: brand.name,
        processName: proc.name,
        severity: 'COVERAGE_WARNING',
        conflictType: 'UNDERSTAFFED',
        message: `Understaffed: "${brand.name}" will only have ${remainingCount}/${bp.minStaffCount} staff on ${dateStr}.`
      });
    }
  }

  // Find eligible candidate replacements
  // Criteria: Not already working on dateStr, not on leave, in same pod or has matching skills
  const workingEmpIdsOnDate = new Set(
    currentShifts
      .filter(s => s.date === dateStr && s.shiftStatus === 'working')
      .map(s => s.employeeId)
  );

  const neededProcCode = affectedBPs[0]?.process.code || 'CS';

  const recommendedReplacements: SimulationResult['recommendedReplacements'] = [];

  for (const candidate of employees) {
    if (candidate.id === employeeId) continue;
    if (workingEmpIdsOnDate.has(candidate.id)) continue; // Already working

    const isSamePod = candidate.podId === emp.podId;
    const hasMatchingSkills = candidate.skills.includes(neededProcCode);

    if (isSamePod || hasMatchingSkills) {
      let reason = '';
      if (isSamePod && hasMatchingSkills) {
        reason = `Same Pod (${candidate.role.replace('_', ' ')}) with verified ${neededProcCode} skills. Currently on rest day.`;
      } else if (isSamePod) {
        reason = `Same Pod teammate, available for cross-coverage.`;
      } else {
        reason = `Cross-pod agent possessing ${neededProcCode} expertise.`;
      }

      recommendedReplacements.push({
        employee: candidate,
        reason,
        isSamePod,
        hasMatchingSkills
      });
    }
  }

  // Sort best matches first (same pod + matching skills)
  recommendedReplacements.sort((a, b) => {
    if (a.isSamePod && a.hasMatchingSkills) return -1;
    if (b.isSamePod && b.hasMatchingSkills) return 1;
    return a.isSamePod ? -1 : 1;
  });

  return {
    affectedEmployee: emp,
    date: dateStr,
    affectedBrandProcesses: affectedBPs,
    newConflicts,
    recommendedReplacements: recommendedReplacements.slice(0, 5) // top 5
  };
}
