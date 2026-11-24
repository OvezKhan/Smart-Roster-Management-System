-- Datastraw Smart Roster Management System
-- PostgreSQL / Supabase Migration Schema with Row Level Security (RLS)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Pods Table
CREATE TABLE IF NOT EXISTS pods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    lead_id UUID,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pod_id UUID REFERENCES pods(id) ON DELETE SET NULL,
    role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('agent', 'pod_lead', 'ops_manager')),
    default_weekly_off_days INT[] DEFAULT ARRAY[0], -- 0=Sunday
    skills TEXT[] DEFAULT ARRAY['CS'],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Circular FK for Pod Lead
ALTER TABLE pods 
ADD CONSTRAINT fk_pod_lead 
FOREIGN KEY (lead_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 4. Brands Table
CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    pod_id UUID REFERENCES pods(id) ON DELETE CASCADE,
    is_single_resource BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Processes Table
CREATE TABLE IF NOT EXISTS processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Brand Processes Table (Working Rules & Minimum Staffing)
CREATE TABLE IF NOT EXISTS brand_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
    process_id UUID REFERENCES processes(id) ON DELETE CASCADE,
    operating_model VARCHAR(50) DEFAULT 'mon_sat_excl_holidays' CHECK (
        operating_model IN ('365_days', 'daily_excl_holidays', 'mon_sat_excl_holidays', 'mon_fri_excl_holidays', 'custom')
    ),
    operating_days INT[] DEFAULT ARRAY[1,2,3,4,5,6], -- Mon to Sat
    min_staff_count INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, process_id)
);

-- 7. Employee Assignments Table
CREATE TABLE IF NOT EXISTS employee_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    brand_process_id UUID REFERENCES brand_processes(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, brand_process_id)
);

-- 8. Public Holidays Table
CREATE TABLE IF NOT EXISTS public_holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    applies_to_all BOOLEAN DEFAULT true
);

-- 9. Leaves Table
CREATE TABLE IF NOT EXISTS leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    leave_type VARCHAR(50) DEFAULT 'planned_leave' CHECK (leave_type IN ('planned_leave', 'comp_off', 'sick_leave')),
    status VARCHAR(50) DEFAULT 'approved' CHECK (status IN ('approved', 'pending', 'rejected')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Employee Preferences Table
CREATE TABLE IF NOT EXISTS employee_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    preferred_weekly_off INT DEFAULT 0, -- 0=Sunday, 6=Saturday
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Rosters Table
CREATE TABLE IF NOT EXISTS rosters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(month, year)
);

-- 12. Roster Shifts Table
CREATE TABLE IF NOT EXISTS roster_shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roster_id UUID REFERENCES rosters(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    brand_process_id UUID REFERENCES brand_processes(id) ON DELETE SET NULL,
    shift_status VARCHAR(50) DEFAULT 'working' CHECK (shift_status IN ('working', 'weekly_off', 'leave', 'comp_off', 'holiday')),
    is_manual_override BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Roster Conflicts Table
CREATE TABLE IF NOT EXISTS roster_conflicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roster_id UUID REFERENCES rosters(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    brand_process_id UUID REFERENCES brand_processes(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('HARD_ERROR', 'COVERAGE_WARNING')),
    conflict_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_roster_shifts_lookup ON roster_shifts(roster_id, date, employee_id);
CREATE INDEX IF NOT EXISTS idx_roster_shifts_bp ON roster_shifts(brand_process_id, date);
CREATE INDEX IF NOT EXISTS idx_conflicts_roster ON roster_conflicts(roster_id, severity);
CREATE INDEX IF NOT EXISTS idx_emp_assignments ON employee_assignments(employee_id, brand_process_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE roster_conflicts ENABLE ROW LEVEL SECURITY;

-- Standard Public Access Policies for Operations App (Read & Write)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access for all" ON %I', tbl);
        EXECUTE format('CREATE POLICY "Public access for all" ON %I FOR ALL USING (true) WITH CHECK (true)', tbl);
    END LOOP;
END $$;
