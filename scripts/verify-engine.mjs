import { generateMonthlyRoster } from '../src/lib/engine/generator.js';
import { validateRosterShifts } from '../src/lib/engine/validator.js';
import { simulateEmployeeAbsence } from '../src/lib/engine/changeHandler.js';
import { 
  INITIAL_EMPLOYEES, 
  INITIAL_BRANDS, 
  INITIAL_PROCESSES, 
  INITIAL_BRAND_PROCESSES, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_HOLIDAYS, 
  INITIAL_LEAVES, 
  INITIAL_PREFERENCES 
} from '../src/lib/data/seedData.js';
import assert from 'assert';

console.log('--- Running Engine Self-Check Verification ---');

// 1. Verify Team Size >= 30
console.log(`[1] Verifying employee headcount: ${INITIAL_EMPLOYEES.length}`);
assert(INITIAL_EMPLOYEES.length >= 30, 'Headcount must be at least 30');

// 2. Verify Brand Distribution (~80% single-resource)
const singleBrands = INITIAL_BRANDS.filter(b => b.isSingleResource);
const multiBrands = INITIAL_BRANDS.filter(b => !b.isSingleResource);
const singleRatio = singleBrands.length / INITIAL_BRANDS.length;
console.log(`[2] Brands: ${INITIAL_BRANDS.length} total (${singleBrands.length} single-resource [${(singleRatio*100).toFixed(0)}%], ${multiBrands.length} multi-resource)`);
assert(singleRatio >= 0.75, 'At least ~80% brands should be single-resource');

// 3. Run Roster Generation for Dec 2026
const res = generateMonthlyRoster({
  year: 2026,
  month: 12,
  employees: INITIAL_EMPLOYEES,
  brands: INITIAL_BRANDS,
  processes: INITIAL_PROCESSES,
  brandProcesses: INITIAL_BRAND_PROCESSES,
  assignments: INITIAL_ASSIGNMENTS,
  holidays: INITIAL_HOLIDAYS,
  leaves: INITIAL_LEAVES,
  preferences: INITIAL_PREFERENCES
});

console.log(`[3] Generated Shifts: ${res.shifts.length}, Hard Errors: ${res.metrics.hardConflictsCount}, Warnings: ${res.metrics.coverageWarningsCount}`);
assert(res.shifts.length > 900, 'Expected > 900 shifts for 32 employees in 31-day month');

// 4. Verify Single-Resource 365-day Brand Gap Detection
// Brand 1 (Glow Aura) operates 365 days. Its dedicated employee Neha Verma takes Sunday offs and has leave Dec 14-16.
const glowAuraConflicts = res.conflicts.filter(c => c.brandName?.includes('Glow Aura'));
console.log(`[4] Single-Resource 365-day Brand Gap Detection: ${glowAuraConflicts.length} gaps identified for Glow Aura`);
assert(glowAuraConflicts.length > 0, 'Must identify coverage gaps when sole resource is on off/leave');

// 5. Test Change Simulator
console.log('[5] Testing Dynamic Change Simulation (Section 3.F)...');
const simResult = simulateEmployeeAbsence(
  'emp-2', // Neha Verma
  '2026-12-10', // A normal scheduled working day
  res.roster.id,
  res.shifts,
  INITIAL_EMPLOYEES,
  INITIAL_BRANDS,
  INITIAL_PROCESSES,
  INITIAL_BRAND_PROCESSES
);

assert(simResult !== null, 'Simulation result must not be null');
console.log(`    Affected brand: ${simResult.affectedBrandProcesses[0]?.brand.name}, Gap Created: ${simResult.affectedBrandProcesses[0]?.isGapCreated}`);
console.log(`    Recommended Substitutes Found: ${simResult.recommendedReplacements.length}`);
assert(simResult.affectedBrandProcesses[0]?.isGapCreated === true, 'Absence of sole agent must create a gap');
assert(simResult.recommendedReplacements.length > 0, 'Should find qualified substitutes in the same pod');

console.log('✅ ALL ENGINE CHECKS PASSED SUCCESSFULLY!');
