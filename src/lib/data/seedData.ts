import { 
  Pod, 
  Employee, 
  Brand, 
  Process, 
  BrandProcess, 
  EmployeeAssignment, 
  PublicHoliday, 
  Leave, 
  EmployeePreference 
} from '../types';

export const INITIAL_PODS: Pod[] = [
  {
    id: 'pod-1',
    name: 'Pod Alpha (Beauty & Wellness)',
    leadId: 'emp-1',
    leadName: 'Aarav Sharma',
    description: 'Specializes in high-touch D2C skincare and wellness brands with heavy conversational CS.'
  },
  {
    id: 'pod-2',
    name: 'Pod Beta (Fashion & Lifestyle)',
    leadId: 'emp-11',
    leadName: 'Simran Kaur',
    description: 'Manages fast-turnaround apparel, returns, and high-frequency abandoned cart recoveries.'
  },
  {
    id: 'pod-3',
    name: 'Pod Gamma (Electronics & Appliances)',
    leadId: 'emp-21',
    leadName: 'Dev Malhotra',
    description: 'Handles technical support, warranty logistics, and critical NDR resolution.'
  }
];

export const INITIAL_PROCESSES: Process[] = [
  { id: 'proc-cs', code: 'CS', name: 'Customer Support' },
  { id: 'proc-acc', code: 'ACC', name: 'Abandoned Cart Conversions' },
  { id: 'proc-ndr', code: 'NDR', name: 'Non-Delivery Report Management' },
  { id: 'proc-ret', code: 'RET', name: 'Retention & Customer Lifetime Value' }
];

export const INITIAL_BRANDS: Brand[] = [
  // 8 Single-Resource Brands (~80%)
  { id: 'brand-1', name: 'Glow Aura Skincare', podId: 'pod-1', isSingleResource: true, description: 'Organic skincare brand requiring 365-day live chat coverage.' },
  { id: 'brand-2', name: 'Vital Greens Nutra', podId: 'pod-1', isSingleResource: true, description: 'Supplements & nutrition brand operating Mon-Sat.' },
  { id: 'brand-3', name: 'Daily Brew Artisan', podId: 'pod-1', isSingleResource: true, description: 'Direct roast coffee brand operating Mon-Sat.' },
  { id: 'brand-4', name: 'Urban Stitch Fashion', podId: 'pod-2', isSingleResource: true, description: 'Boutique apparel brand operating Mon-Sat.' },
  { id: 'brand-5', name: 'Kicks & Co Streetwear', podId: 'pod-2', isSingleResource: true, description: 'Designer sneaker brand operating Mon-Sat.' },
  { id: 'brand-6', name: 'PureNest Living', podId: 'pod-2', isSingleResource: true, description: 'Home decor brand operating Mon-Sat.' },
  { id: 'brand-7', name: 'SoundWave Audio', podId: 'pod-3', isSingleResource: true, description: 'Audiophile headphones brand operating Mon-Fri excluding holidays.' },
  { id: 'brand-8', name: 'ZenTech Smartwatches', podId: 'pod-3', isSingleResource: true, description: 'Wearables brand operating Mon-Sat.' },

  // 2 Multi-Resource Brands (~20%)
  { id: 'brand-9', name: 'NexaStyle Fast Fashion', podId: 'pod-2', isSingleResource: false, description: 'High-volume apparel brand staffed by multiple agents with separate CS and NDR.' },
  { id: 'brand-10', name: 'Apex Electronics Global', podId: 'pod-3', isSingleResource: false, description: 'Flagship consumer electronics brand requiring 365-day staggered coverage.' }
];

export const INITIAL_BRAND_PROCESSES: BrandProcess[] = [
  // Single resource brands (80%)
  { id: 'bp-1', brandId: 'brand-1', processId: 'proc-cs', operatingModel: '365_days', operatingDays: [0, 1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-2', brandId: 'brand-2', processId: 'proc-cs', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-3', brandId: 'brand-3', processId: 'proc-cs', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-4', brandId: 'brand-4', processId: 'proc-cs', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-5', brandId: 'brand-5', processId: 'proc-cs', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-6', brandId: 'brand-6', processId: 'proc-cs', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-7', brandId: 'brand-7', processId: 'proc-cs', operatingModel: 'mon_fri_excl_holidays', operatingDays: [1, 2, 3, 4, 5], minStaffCount: 1 },
  { id: 'bp-8', brandId: 'brand-8', processId: 'proc-cs', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },

  // Multi-resource brand 9: NexaStyle (3 processes)
  { id: 'bp-9a', brandId: 'brand-9', processId: 'proc-cs', operatingModel: 'daily_excl_holidays', operatingDays: [0, 1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-9b', brandId: 'brand-9', processId: 'proc-acc', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-9c', brandId: 'brand-9', processId: 'proc-ndr', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 },

  // Multi-resource brand 10: Apex Electronics (2 processes, 365 CS)
  { id: 'bp-10a', brandId: 'brand-10', processId: 'proc-cs', operatingModel: '365_days', operatingDays: [0, 1, 2, 3, 4, 5, 6], minStaffCount: 1 },
  { id: 'bp-10b', brandId: 'brand-10', processId: 'proc-ret', operatingModel: 'mon_sat_excl_holidays', operatingDays: [1, 2, 3, 4, 5, 6], minStaffCount: 1 }
];

// At least 30 employees (32 employees)
export const INITIAL_EMPLOYEES: Employee[] = [
  // Pod 1 (Beauty & Wellness - 10 employees)
  { id: 'emp-1', name: 'Aarav Sharma', email: 'aarav.sharma@datastraw.in', podId: 'pod-1', role: 'pod_lead', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC'], isActive: true },
  { id: 'emp-2', name: 'Neha Verma', email: 'neha.verma@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-3', name: 'Aman Gupta', email: 'aman.gupta@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'RET'], isActive: true },
  { id: 'emp-4', name: 'Vikram Joshi', email: 'vikram.joshi@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'NDR'], isActive: true },
  { id: 'emp-5', name: 'Ritu Chawla', email: 'ritu.chawla@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-6', name: 'Karan Mehra', email: 'karan.mehra@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC'], isActive: true },
  { id: 'emp-7', name: 'Ishita Bansal', email: 'ishita.bansal@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-8', name: 'Manish Pandey', email: 'manish.pandey@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'NDR'], isActive: true },
  { id: 'emp-9', name: 'Sanya Kapoor', email: 'sanya.kapoor@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-10', name: 'Rohan Singhania', email: 'rohan.s@datastraw.in', podId: 'pod-1', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'RET'], isActive: true },

  // Pod 2 (Fashion & Lifestyle - 11 employees)
  { id: 'emp-11', name: 'Simran Kaur', email: 'simran.kaur@datastraw.in', podId: 'pod-2', role: 'pod_lead', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC', 'NDR'], isActive: true },
  { id: 'emp-12', name: 'Priya Nair', email: 'priya.nair@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC'], isActive: true },
  { id: 'emp-13', name: 'Rohit Patil', email: 'rohit.patil@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC'], isActive: true },
  { id: 'emp-14', name: 'Kavita Roy', email: 'kavita.roy@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'NDR'], isActive: true },
  { id: 'emp-15', name: 'Rahul Sharma', email: 'rahul.sharma@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-16', name: 'Pooja Bhatt', email: 'pooja.bhatt@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['ACC', 'NDR'], isActive: true },
  { id: 'emp-17', name: 'Ananya Saxena', email: 'ananya.s@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-18', name: 'Varun Dhawan', email: 'varun.d@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC'], isActive: true },
  { id: 'emp-19', name: 'Megha Iyer', email: 'megha.iyer@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['NDR'], isActive: true },
  { id: 'emp-20', name: 'Aditya Birla', email: 'aditya.b@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-21', name: 'Nikhil Rathi', email: 'nikhil.rathi@datastraw.in', podId: 'pod-2', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC'], isActive: true },

  // Pod 3 (Electronics & Appliances - 11 employees)
  { id: 'emp-22', name: 'Dev Malhotra', email: 'dev.malhotra@datastraw.in', podId: 'pod-3', role: 'pod_lead', defaultWeeklyOffDays: [0], skills: ['CS', 'NDR', 'RET'], isActive: true },
  { id: 'emp-23', name: 'Tanya Sen', email: 'tanya.sen@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-24', name: 'Ankit Mehta', email: 'ankit.mehta@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-25', name: 'Arjun Das', email: 'arjun.das@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [2], skills: ['CS'], isActive: true }, // Off Tuesday
  { id: 'emp-26', name: 'Sneha Kulkarni', email: 'sneha.k@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true }, // Off Sunday
  { id: 'emp-27', name: 'Harsh Vardhan', email: 'harsh.v@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['NDR', 'CS'], isActive: true },
  { id: 'emp-28', name: 'Deepika Rao', email: 'deepika.rao@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'RET'], isActive: true },
  { id: 'emp-29', name: 'Gaurav Gill', email: 'gaurav.gill@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-30', name: 'Zoya Khan', email: 'zoya.khan@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC'], isActive: true },
  { id: 'emp-31', name: 'Kabir Oberoi', email: 'kabir.o@datastraw.in', podId: 'pod-3', role: 'agent', defaultWeeklyOffDays: [0], skills: ['CS'], isActive: true },
  { id: 'emp-32', name: 'Riddhima Sengupta', email: 'riddhima.s@datastraw.in', podId: 'pod-3', role: 'ops_manager', defaultWeeklyOffDays: [0], skills: ['CS', 'ACC', 'NDR', 'RET'], isActive: true }
];

export const INITIAL_ASSIGNMENTS: EmployeeAssignment[] = [
  // 8 Single-Resource Brands (80% rule: 1 dedicated employee handles the brand)
  { id: 'asgn-1', employeeId: 'emp-2', brandProcessId: 'bp-1', isPrimary: true }, // Neha Verma -> Glow Aura CS
  { id: 'asgn-2', employeeId: 'emp-3', brandProcessId: 'bp-2', isPrimary: true }, // Aman Gupta -> Vital Greens CS
  { id: 'asgn-3', employeeId: 'emp-4', brandProcessId: 'bp-3', isPrimary: true }, // Vikram Joshi -> Daily Brew CS
  { id: 'asgn-4', employeeId: 'emp-12', brandProcessId: 'bp-4', isPrimary: true }, // Priya Nair -> Urban Stitch CS
  { id: 'asgn-5', employeeId: 'emp-13', brandProcessId: 'bp-5', isPrimary: true }, // Rohit Patil -> Kicks & Co CS
  { id: 'asgn-6', employeeId: 'emp-14', brandProcessId: 'bp-6', isPrimary: true }, // Kavita Roy -> PureNest CS
  { id: 'asgn-7', employeeId: 'emp-23', brandProcessId: 'bp-7', isPrimary: true }, // Tanya Sen -> SoundWave CS
  { id: 'asgn-8', employeeId: 'emp-24', brandProcessId: 'bp-8', isPrimary: true }, // Ankit Mehta -> ZenTech CS

  // Multi-Resource Brand 9: NexaStyle (3 employees, different processes)
  { id: 'asgn-9a1', employeeId: 'emp-15', brandProcessId: 'bp-9a', isPrimary: true }, // Rahul Sharma -> NexaStyle CS
  { id: 'asgn-9a2', employeeId: 'emp-11', brandProcessId: 'bp-9a', isPrimary: false }, // Simran Kaur (Lead) -> NexaStyle CS backup
  { id: 'asgn-9b', employeeId: 'emp-16', brandProcessId: 'bp-9b', isPrimary: true }, // Pooja Bhatt -> NexaStyle ACC
  { id: 'asgn-9c', employeeId: 'emp-16', brandProcessId: 'bp-9c', isPrimary: true }, // Pooja Bhatt -> NexaStyle NDR

  // Multi-Resource Brand 10: Apex Electronics (3 employees, 365-day staggered CS + RET)
  { id: 'asgn-10a1', employeeId: 'emp-25', brandProcessId: 'bp-10a', isPrimary: true }, // Arjun Das -> Apex CS (Off Tue)
  { id: 'asgn-10a2', employeeId: 'emp-26', brandProcessId: 'bp-10a', isPrimary: true }, // Sneha Kulkarni -> Apex CS (Off Sun)
  { id: 'asgn-10b', employeeId: 'emp-22', brandProcessId: 'bp-10b', isPrimary: true }  // Dev Malhotra -> Apex RET
];

export const INITIAL_HOLIDAYS: PublicHoliday[] = [
  { id: 'hol-1', date: '2026-12-25', name: 'Christmas Day', appliesToAll: true },
  { id: 'hol-2', date: '2026-12-31', name: "New Year's Eve (Company Observance)", appliesToAll: true }
];

export const INITIAL_LEAVES: Leave[] = [
  { id: 'leave-1', employeeId: 'emp-2', startDate: '2026-12-14', endDate: '2026-12-18', leaveType: 'planned_leave', status: 'approved', notes: 'Personal travel' },
  { id: 'leave-2', employeeId: 'emp-15', startDate: '2026-12-21', endDate: '2026-12-24', leaveType: 'planned_leave', status: 'approved', notes: 'Approved leave' },
  { id: 'leave-3', employeeId: 'emp-25', startDate: '2026-12-28', endDate: '2026-12-29', leaveType: 'planned_leave', status: 'approved', notes: 'Family event' }
];

export const INITIAL_PREFERENCES: EmployeePreference[] = [
  { id: 'pref-1', employeeId: 'emp-2', preferredWeeklyOff: 0, notes: 'Prefers Sunday off for family' },
  { id: 'pref-2', employeeId: 'emp-12', preferredWeeklyOff: 6, notes: 'Prefers Saturday off' },
  { id: 'pref-3', employeeId: 'emp-25', preferredWeeklyOff: 2, notes: 'Prefers Tuesday off' },
  { id: 'pref-4', employeeId: 'emp-26', preferredWeeklyOff: 0, notes: 'Prefers Sunday off' }
];
