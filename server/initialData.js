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
