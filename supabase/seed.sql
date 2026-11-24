-- Datastraw Smart Roster Management System
-- Initial Seed SQL: 32 Employees, 3 Pods, 10 Brands (80/20 Rule), Operating Calendars, Leaves, Holidays

-- 1. Insert Processes
INSERT INTO processes (id, code, name) VALUES
('b1000000-0000-0000-0000-000000000001', 'CS', 'Customer Support'),
('b1000000-0000-0000-0000-000000000002', 'ACC', 'Abandoned Cart Conversions'),
('b1000000-0000-0000-0000-000000000003', 'NDR', 'Non-Delivery Report Management'),
('b1000000-0000-0000-0000-000000000004', 'RET', 'Retention & Customer Lifetime Value')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Pods
INSERT INTO pods (id, name, description) VALUES
('a1000000-0000-0000-0000-000000000001', 'Pod Alpha (Beauty & Wellness)', 'High-touch D2C skincare and wellness brands with conversational CS.'),
('a1000000-0000-0000-0000-000000000002', 'Pod Beta (Fashion & Lifestyle)', 'Fast-turnaround apparel, returns, and high-frequency abandoned cart recoveries.'),
('a1000000-0000-0000-0000-000000000003', 'Pod Gamma (Electronics & Appliances)', 'Technical support, warranty logistics, and critical NDR resolution.')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Employees (At least 30 employees: 32 total)
INSERT INTO employees (id, name, email, pod_id, role, default_weekly_off_days, skills, is_active) VALUES
-- Pod 1 (Alpha)
('e1000000-0000-0000-0000-000000000001', 'Aarav Sharma', 'aarav.sharma@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'pod_lead', ARRAY[0], ARRAY['CS', 'ACC'], true),
('e1000000-0000-0000-0000-000000000002', 'Neha Verma', 'neha.verma@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000003', 'Aman Gupta', 'aman.gupta@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS', 'RET'], true),
('e1000000-0000-0000-0000-000000000004', 'Vikram Joshi', 'vikram.joshi@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS', 'NDR'], true),
('e1000000-0000-0000-0000-000000000005', 'Ritu Chawla', 'ritu.chawla@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000006', 'Karan Mehra', 'karan.mehra@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS', 'ACC'], true),
('e1000000-0000-0000-0000-000000000007', 'Ishita Bansal', 'ishita.bansal@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000008', 'Manish Pandey', 'manish.pandey@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS', 'NDR'], true),
('e1000000-0000-0000-0000-000000000009', 'Sanya Kapoor', 'sanya.kapoor@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000010', 'Rohan Singhania', 'rohan.s@datastraw.in', 'a1000000-0000-0000-0000-000000000001', 'agent', ARRAY[0], ARRAY['CS', 'RET'], true),

-- Pod 2 (Beta)
('e1000000-0000-0000-0000-000000000011', 'Simran Kaur', 'simran.kaur@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'pod_lead', ARRAY[0], ARRAY['CS', 'ACC', 'NDR'], true),
('e1000000-0000-0000-0000-000000000012', 'Priya Nair', 'priya.nair@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS', 'ACC'], true),
('e1000000-0000-0000-0000-000000000013', 'Rohit Patil', 'rohit.patil@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS', 'ACC'], true),
('e1000000-0000-0000-0000-000000000014', 'Kavita Roy', 'kavita.roy@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS', 'NDR'], true),
('e1000000-0000-0000-0000-000000000015', 'Rahul Sharma', 'rahul.sharma@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000016', 'Pooja Bhatt', 'pooja.bhatt@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['ACC', 'NDR'], true),
('e1000000-0000-0000-0000-000000000017', 'Ananya Saxena', 'ananya.s@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000018', 'Varun Dhawan', 'varun.d@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS', 'ACC'], true),
('e1000000-0000-0000-0000-000000000019', 'Megha Iyer', 'megha.iyer@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['NDR'], true),
('e1000000-0000-0000-0000-000000000020', 'Aditya Birla', 'aditya.b@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000021', 'Nikhil Rathi', 'nikhil.rathi@datastraw.in', 'a1000000-0000-0000-0000-000000000002', 'agent', ARRAY[0], ARRAY['CS', 'ACC'], true),

-- Pod 3 (Gamma)
('e1000000-0000-0000-0000-000000000022', 'Dev Malhotra', 'dev.malhotra@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'pod_lead', ARRAY[0], ARRAY['CS', 'NDR', 'RET'], true),
('e1000000-0000-0000-0000-000000000023', 'Tanya Sen', 'tanya.sen@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000024', 'Ankit Mehta', 'ankit.mehta@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000025', 'Arjun Das', 'arjun.das@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[2], ARRAY['CS'], true), -- Off Tuesday
('e1000000-0000-0000-0000-000000000026', 'Sneha Kulkarni', 'sneha.k@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['CS'], true), -- Off Sunday
('e1000000-0000-0000-0000-000000000027', 'Harsh Vardhan', 'harsh.v@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['NDR', 'CS'], true),
('e1000000-0000-0000-0000-000000000028', 'Deepika Rao', 'deepika.rao@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['CS', 'RET'], true),
('e1000000-0000-0000-0000-000000000029', 'Gaurav Gill', 'gaurav.gill@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000030', 'Zoya Khan', 'zoya.khan@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['CS', 'ACC'], true),
('e1000000-0000-0000-0000-000000000031', 'Kabir Oberoi', 'kabir.o@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'agent', ARRAY[0], ARRAY['CS'], true),
('e1000000-0000-0000-0000-000000000032', 'Riddhima Sengupta', 'riddhima.s@datastraw.in', 'a1000000-0000-0000-0000-000000000003', 'ops_manager', ARRAY[0], ARRAY['CS', 'ACC', 'NDR', 'RET'], true)
ON CONFLICT (email) DO NOTHING;

-- Update Pod Leads
UPDATE pods SET lead_id = 'e1000000-0000-0000-0000-000000000001' WHERE id = 'a1000000-0000-0000-0000-000000000001';
UPDATE pods SET lead_id = 'e1000000-0000-0000-0000-000000000011' WHERE id = 'a1000000-0000-0000-0000-000000000002';
UPDATE pods SET lead_id = 'e1000000-0000-0000-0000-000000000022' WHERE id = 'a1000000-0000-0000-0000-000000000003';

-- 4. Insert Brands (80% Single-Resource, 20% Multi-Resource)
INSERT INTO brands (id, name, pod_id, is_single_resource, description) VALUES
('c1000000-0000-0000-0000-000000000001', 'Glow Aura Skincare', 'a1000000-0000-0000-0000-000000000001', true, 'Organic skincare brand requiring 365-day live chat coverage.'),
('c1000000-0000-0000-0000-000000000002', 'Vital Greens Nutra', 'a1000000-0000-0000-0000-000000000001', true, 'Supplements & nutrition brand operating Mon-Sat.'),
('c1000000-0000-0000-0000-000000000003', 'Daily Brew Artisan', 'a1000000-0000-0000-0000-000000000001', true, 'Direct roast coffee brand operating Mon-Sat.'),
('c1000000-0000-0000-0000-000000000004', 'Urban Stitch Fashion', 'a1000000-0000-0000-0000-000000000002', true, 'Boutique apparel brand operating Mon-Sat.'),
('c1000000-0000-0000-0000-000000000005', 'Kicks & Co Streetwear', 'a1000000-0000-0000-0000-000000000002', true, 'Designer sneaker brand operating Mon-Sat.'),
('c1000000-0000-0000-0000-000000000006', 'PureNest Living', 'a1000000-0000-0000-0000-000000000002', true, 'Home decor brand operating Mon-Sat.'),
('c1000000-0000-0000-0000-000000000007', 'SoundWave Audio', 'a1000000-0000-0000-0000-000000000003', true, 'Audiophile headphones brand operating Mon-Fri excluding holidays.'),
('c1000000-0000-0000-0000-000000000008', 'ZenTech Smartwatches', 'a1000000-0000-0000-0000-000000000003', true, 'Wearables brand operating Mon-Sat.'),
('c1000000-0000-0000-0000-000000000009', 'NexaStyle Fast Fashion', 'a1000000-0000-0000-0000-000000000002', false, 'High-volume apparel brand staffed by multiple agents with separate CS and NDR.'),
('c1000000-0000-0000-0000-000000000010', 'Apex Electronics Global', 'a1000000-0000-0000-0000-000000000003', false, 'Flagship consumer electronics brand requiring 365-day staggered coverage.')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Brand Processes
INSERT INTO brand_processes (id, brand_id, process_id, operating_model, operating_days, min_staff_count) VALUES
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', '365_days', ARRAY[0,1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000001', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000001', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000001', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000001', 'mon_fri_excl_holidays', ARRAY[1,2,3,4,5], 1),
('d1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000001', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
-- NexaStyle
('d1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000001', 'daily_excl_holidays', ARRAY[0,1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000002', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1),
-- Apex Electronics
('d1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000001', '365_days', ARRAY[0,1,2,3,4,5,6], 1),
('d1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000004', 'mon_sat_excl_holidays', ARRAY[1,2,3,4,5,6], 1)
ON CONFLICT (brand_id, process_id) DO NOTHING;

-- 6. Insert Employee Assignments
INSERT INTO employee_assignments (employee_id, brand_process_id, is_primary) VALUES
-- Single Resource Brands (80%)
('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', true), -- Neha -> Glow Aura CS
('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000002', true), -- Aman -> Vital Greens CS
('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000003', true), -- Vikram -> Daily Brew CS
('e1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000004', true), -- Priya -> Urban Stitch CS
('e1000000-0000-0000-0000-000000000013', 'd1000000-0000-0000-0000-000000000005', true), -- Rohit -> Kicks & Co CS
('e1000000-0000-0000-0000-000000000014', 'd1000000-0000-0000-0000-000000000006', true), -- Kavita -> PureNest CS
('e1000000-0000-0000-0000-000000000023', 'd1000000-0000-0000-0000-000000000007', true), -- Tanya -> SoundWave CS
('e1000000-0000-0000-0000-000000000024', 'd1000000-0000-0000-0000-000000000008', true), -- Ankit -> ZenTech CS

-- Multi-Resource NexaStyle
('e1000000-0000-0000-0000-000000000015', 'd1000000-0000-0000-0000-000000000009', true), -- Rahul -> NexaStyle CS
('e1000000-0000-0000-0000-000000000011', 'd1000000-0000-0000-0000-000000000009', false), -- Simran (Backup) -> NexaStyle CS
('e1000000-0000-0000-0000-000000000016', 'd1000000-0000-0000-0000-000000000010', true), -- Pooja -> NexaStyle ACC
('e1000000-0000-0000-0000-000000000016', 'd1000000-0000-0000-0000-000000000011', true), -- Pooja -> NexaStyle NDR

-- Multi-Resource Apex Electronics
('e1000000-0000-0000-0000-000000000025', 'd1000000-0000-0000-0000-000000000012', true), -- Arjun -> Apex CS
('e1000000-0000-0000-0000-000000000026', 'd1000000-0000-0000-0000-000000000012', true), -- Sneha -> Apex CS
('e1000000-0000-0000-0000-000000000022', 'd1000000-0000-0000-0000-000000000013', true)  -- Dev -> Apex RET
ON CONFLICT (employee_id, brand_process_id) DO NOTHING;

-- 7. Holidays & Leaves
INSERT INTO public_holidays (date, name, applies_to_all) VALUES
('2026-12-25', 'Christmas Day', true),
('2026-12-31', 'New Year Observance', true)
ON CONFLICT (date) DO NOTHING;

INSERT INTO leaves (employee_id, start_date, end_date, leave_type, status, notes) VALUES
('e1000000-0000-0000-0000-000000000002', '2026-12-14', '2026-12-18', 'planned_leave', 'approved', 'Personal travel'),
('e1000000-0000-0000-0000-000000000015', '2026-12-21', '2026-12-24', 'planned_leave', 'approved', 'Approved leave'),
('e1000000-0000-0000-0000-000000000025', '2026-12-28', '2026-12-29', 'planned_leave', 'approved', 'Family event');
