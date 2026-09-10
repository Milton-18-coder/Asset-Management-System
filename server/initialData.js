import { initialAssets } from '../src/store/furnitureSlice.js';

export { initialAssets };

export const initialUsers = [
  { id: 'USR-001', username: 'superadmin', password: 'password123', name: 'Dr. Rajesh Kumar', role: 'superadmin', department: 'Administration', email: 'rajesh.kumar@nec.edu.in' },
  { id: 'USR-002', username: 'cs_admin', password: 'password123', name: 'Prof. Anitha Sharma', role: 'deptadmin', department: 'Computer Science', email: 'anitha.sharma@nec.edu.in' },
  { id: 'USR-003', username: 'mech_admin', password: 'password123', name: 'Prof. Kavitha Raj', role: 'deptadmin', department: 'Mechanical', email: 'kavitha.raj@nec.edu.in' },
  { id: 'USR-004', username: 'ece_admin', password: 'password123', name: 'Prof. Ramesh Nair', role: 'deptadmin', department: 'ECE', email: 'ramesh.nair@nec.edu.in' },
  { id: 'USR-005', username: 'auditor', password: 'password123', name: 'Mr. Ravi Shankar', role: 'auditor', department: 'Auditor', email: 'ravi.shankar@nec.edu.in' },
  { id: 'USR-006', username: 'cs_faculty', password: 'password123', name: 'Prof. Suresh Babu', role: 'faculty', department: 'Computer Science', email: 'suresh.babu@nec.edu.in' },
  { id: 'USR-007', username: 'phy_faculty', password: 'password123', name: 'Prof. Dinesh Kumar', role: 'faculty', department: 'Physics', email: 'dinesh.kumar@nec.edu.in' },
  { id: 'USR-008', username: 'chem_faculty', password: 'password123', name: 'Dr. Lalitha Devi', role: 'faculty', department: 'Chemistry', email: 'lalitha.devi@nec.edu.in' },
  { id: 'USR-009', username: 'lib_head', password: 'password123', name: 'Ms. Geeta Nair', role: 'deptadmin', department: 'Library', email: 'geeta.nair@nec.edu.in' },
  { id: 'USR-010', username: 'estate_officer', password: 'password123', name: 'Ms. Priya Mehta', role: 'faculty', department: 'Administration', email: 'priya.mehta@nec.edu.in' },
];

export const initialTransfers = [
  { id: 'TRF-001', assetId: 'AST-029', furniture: 'LCD Projector', source: 'CS-101', destination: 'CS-102', requestedBy: 'Prof. Anitha Sharma', role: 'Dept Admin', department: 'Computer Science', date: '2026-09-01', status: 'Completed', reason: 'Classroom CS-102 scheduled for live webinar' },
  { id: 'TRF-002', assetId: 'AST-003', furniture: 'Student Chair (5 units)', source: 'ME-101', destination: 'CS-101', requestedBy: 'Prof. Suresh Babu', role: 'Faculty', department: 'Mechanical', date: '2026-09-03', status: 'Approved', reason: 'Additional students assigned for semester exam' },
  { id: 'TRF-003', assetId: 'AST-030', furniture: 'Dell Workstation Tower (2 units)', source: 'CS-Lab1', destination: 'ECE-Lab2', requestedBy: 'Prof. Ramesh Nair', role: 'Dept Admin', department: 'ECE', date: '2026-09-05', status: 'Pending', reason: 'Inter-departmental VLSI lab practical exam' },
  { id: 'TRF-004', assetId: 'AST-025', furniture: 'Magnetic Ceramic Whiteboard (8x4)', source: 'PH-201', destination: 'PH-202', requestedBy: 'Prof. Dinesh Kumar', role: 'Faculty', department: 'Physics', date: '2026-09-06', status: 'Rejected', reason: 'Whiteboard is wall-mounted and cannot be moved safely' },
];

export const initialInspections = [
  { id: 'INS-001', assetId: 'AST-029', furniture: 'LCD Projector', location: 'CS-101', condition: 'Fair', inspector: 'Mr. Ravi Shankar', date: '2026-08-05', notes: 'Lamp brightness measured at 2100 lumens. Recommend lamp replacement within 2 months.' },
  { id: 'INS-002', assetId: 'AST-026', furniture: 'Green Chalkboard', location: 'ME-101', condition: 'Poor', inspector: 'Ms. Geeta Nair', date: '2026-08-10', notes: 'Surface scratches and frame loosening. Inspection recommended.' },
  { id: 'INS-003', assetId: 'AST-032', furniture: 'Optoma Short-Throw Laser Projector', location: 'PH-202', condition: 'Damaged', inspector: 'Mr. Ravi Shankar', date: '2026-08-12', notes: 'Optical engine ballast fault. Submitted for repair.' },
  { id: 'INS-004', assetId: 'AST-001', furniture: 'Ergonomic Mesh Task Chair', location: 'CS-Lab1', condition: 'Good', inspector: 'Prof. Suresh Babu', date: '2026-08-18', notes: 'Hydraulic lift inspected and lubricated. Lumbar support intact.' },
  { id: 'INS-005', assetId: 'AST-027', furniture: 'Interactive 75" Smart Board', location: 'PH-202', condition: 'Good', inspector: 'Prof. Dinesh Kumar', date: '2026-08-20', notes: 'Touch sensor matrix recalibrated. Stylus pens replaced.' },
];

export const initialNotifications = [
  { id: 'NOTIF-001', title: 'Asset Updated', message: 'ViewSonic Portable 3000-Lumens LED Smart Projector (AST-030) was updated.', time: '10 min ago', read: false, department: 'ECE', type: 'asset', link: '/assets/AST-030' },
  { id: 'NOTIF-002', title: 'Campus-wide Asset Audit', message: 'Quarterly institutional physical asset audit initiated across all science laboratories.', time: '1 hour ago', read: false, department: 'All', type: 'system', link: '/inspections' },
  { id: 'NOTIF-003', title: 'New Asset Registered', message: 'Ergonomic Chair (AST-001) was registered in CS-Lab1.', time: '2 hours ago', read: false, department: 'Computer Science', type: 'asset', link: '/assets/AST-001' },
];

export const initialDepartments = [
  { id: 'D01', name: 'Computer Science & Engineering', code: 'CSE', building: 'Engineering Block', hod: 'Prof. S. Krishnamurthy', admin: 'Prof. Anitha Sharma' },
  { id: 'D02', name: 'Electronics & Communication', code: 'ECE', building: 'Engineering Block', hod: 'Dr. M. Venkatesh', admin: 'Prof. Ramesh Nair' },
  { id: 'D03', name: 'Mechanical Engineering', code: 'ME', building: 'Engineering Block', hod: 'Dr. P. Subramaniam', admin: 'Prof. Kavitha Raj' },
  { id: 'D04', name: 'Physics', code: 'PHY', building: 'Science Block', hod: 'Dr. Nalini Patel', admin: 'Prof. Dinesh Kumar' },
  { id: 'D05', name: 'Chemistry', code: 'CHEM', building: 'Science Block', hod: 'Dr. Lalitha Devi', admin: 'Prof. Suresh Iyer' },
  { id: 'D06', name: 'Administration', code: 'ADM', building: 'Admin Block', hod: 'Dr. Rajesh Kumar', admin: 'Ms. Priya Mehta' },
  { id: 'D07', name: 'Mathematics', code: 'MATH', building: 'Science Block', hod: 'Dr. Karthik Rajan', admin: 'Prof. Meena Sundaram' },
  { id: 'D08', name: 'Civil Engineering', code: 'CIVIL', building: 'IT Block', hod: 'Dr. Senthil Kumar', admin: 'Prof. Aruna Devi' },
];

export const initialBuildings = [
  { id: 'B01', name: 'Engineering Block', code: 'ENG', floors: 4 },
  { id: 'B02', name: 'Science Block', code: 'SCI', floors: 3 },
  { id: 'B03', name: 'Admin Block', code: 'ADM', floors: 2 },
  { id: 'B04', name: 'Central Library', code: 'LIB', floors: 3 },
  { id: 'B05', name: 'IT Block', code: 'ITB', floors: 4 },
  { id: 'B06', name: 'Management Block', code: 'MBA', floors: 3 },
  { id: 'B07', name: 'Humanities Block', code: 'HUM', floors: 3 },
  { id: 'B08', name: 'Sports & Arts Complex', code: 'SAC', floors: 2 },
];

export const initialRooms = [
  { id: 'R01', number: 'CS-101', building: 'Engineering Block', department: 'Computer Science & Engineering', floor: 1, type: 'Smart Classroom', capacity: 60 },
  { id: 'R02', number: 'CS-102', building: 'Engineering Block', department: 'Computer Science & Engineering', floor: 1, type: 'Lecture Hall', capacity: 60 },
  { id: 'R03', number: 'CS-Lab1', building: 'Engineering Block', department: 'Computer Science & Engineering', floor: 2, type: 'Computer Laboratory', capacity: 40 },
  { id: 'R04', number: 'PH-201', building: 'Science Block', department: 'Physics', floor: 2, type: 'Physics Lab & Classroom', capacity: 50 },
  { id: 'R05', number: 'CH-301', building: 'Science Block', department: 'Chemistry', floor: 3, type: 'Chemistry Research Lab', capacity: 30 },
  { id: 'R06', number: 'ME-101', building: 'Engineering Block', department: 'Mechanical Engineering', floor: 1, type: 'Mechanical Workshop Hall', capacity: 60 },
  { id: 'R07', number: 'ECE-Lab2', building: 'Engineering Block', department: 'Electronics & Communication', floor: 3, type: 'VLSI & Embedded Lab', capacity: 25 },
  { id: 'R08', number: 'LIB-01', building: 'Central Library', department: 'Administration', floor: 1, type: 'Central Reading Hall', capacity: 200 },
  { id: 'R09', number: 'ADM-Hall', building: 'Admin Block', department: 'Administration', floor: 1, type: 'Main Boardroom', capacity: 25 },
  { id: 'R10', number: 'PH-202', building: 'Science Block', department: 'Physics', floor: 2, type: 'Digital Smart Classroom', capacity: 50 },
];

export const initialMaintenanceLogs = [
  { id: 'MNT-001', assetId: 'AST-029', furniture: 'LCD Projector', issueDescription: 'Lamp dimming below acceptable lumens threshold', scheduledDate: '2026-09-15', completedDate: null, cost: 3500.00, status: 'Scheduled', vendor: 'Apex AV Solutions', technicianNotes: 'OEM replacement lamp scheduled for delivery' },
  { id: 'MNT-002', assetId: 'AST-032', furniture: 'Optoma Short-Throw Laser Projector', issueDescription: 'Power ballast issue causing periodic rebooting', scheduledDate: '2026-09-02', completedDate: '2026-09-07', cost: 7200.00, status: 'Completed', vendor: 'Matrix Electronics Care', technicianNotes: 'Replaced power supply unit and verified cooling fan' },
];

export const initialDisposals = [
  { id: 'DSP-001', assetId: 'AST-OLD-01', furniture: 'Cathode Ray Tube Monitors (Batch of 8)', disposalDate: '2026-08-15', reason: 'Scrapped', resaleValue: 1200.00, approvedBy: 'Dr. Rajesh Kumar', notes: 'E-waste handed over to authorized certified recycling partner GreenTech E-Waste.' },
];

export const initialVendors = [
  { id: 'VND-001', name: 'Apex AV Solutions', contactPerson: 'Arun Varma', email: 'sales@apexav.com', phone: '+91 98765 43210', address: 'Tech Park Zone, Bangalore', gstin: '29ABCDE1234F1Z5', rating: 4.8, services: 'Audio-Visual, Smart Boards, Projectors' },
  { id: 'VND-002', name: 'ErgoDesign Workspaces', contactPerson: 'Sunita Rao', email: 'support@ergodesign.in', phone: '+91 98111 22334', address: 'Industrial Area Phase 2, Chennai', gstin: '33ABCDE5678G2Z1', rating: 4.6, services: 'Modular Desks, Chairs, Lab Benches' },
  { id: 'VND-003', name: 'Matrix Electronics Care', contactPerson: 'Karan Malhotra', email: 'service@matrixcare.co.in', phone: '+91 94444 88899', address: 'Electronics City, Hyderabad', gstin: '36ABCDE9876H3Z8', rating: 4.5, services: 'AMC, Computer Repair, Network Hardware' },
];

export const initialAuditLogs = [
  { id: 'AUD-001', userId: 'USR-001', userName: 'Dr. Rajesh Kumar', userRole: 'superadmin', action: 'CREATE', entity: 'Asset', entityId: 'AST-001', details: 'Added new Ergonomic Task Chair to CS-Lab1', created_at: new Date().toISOString() },
  { id: 'AUD-002', userId: 'USR-002', userName: 'Prof. Anitha Sharma', userRole: 'deptadmin', action: 'TRANSFER', entity: 'Asset', entityId: 'AST-029', details: 'Transferred LCD Projector from CS-101 to CS-102', created_at: new Date().toISOString() },
];

export const initialCategories = [
  { id: 'CAT-001', name: 'Chairs & Seating', mainCategory: 'Furniture', code: 'CHR', icon: 'Chair', depreciationRate: 15.00, usefulLifeYears: 7, description: 'Task chairs, executive chairs, conference chairs, and lab stools' },
  { id: 'CAT-002', name: 'Desks & Tables', mainCategory: 'Furniture', code: 'DSK', icon: 'Table', depreciationRate: 10.00, usefulLifeYears: 10, description: 'Faculty desks, student benches, podiums, conference tables' },
  { id: 'CAT-003', name: 'Display & Boards', mainCategory: 'Furniture', code: 'BRD', icon: 'Tv', depreciationRate: 12.50, usefulLifeYears: 8, description: 'Whiteboards, smart boards, pin-up notice boards' },
  { id: 'CAT-004', name: 'AV & Electronic Equipment', mainCategory: 'Electronics', code: 'AVE', icon: 'Monitor', depreciationRate: 20.00, usefulLifeYears: 5, description: 'Projectors, sound systems, presentation remotes' },
  { id: 'CAT-005', name: 'Storage & Cupboards', mainCategory: 'Furniture', code: 'STR', icon: 'Archive', depreciationRate: 10.00, usefulLifeYears: 12, description: 'Steel almirahs, filing cabinets, book racks' },
];

