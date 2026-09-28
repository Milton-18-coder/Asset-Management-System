import { initialAssets } from '../src/store/furnitureSlice.js';

export { initialAssets };

// ─── 1. USERS ───────────────────────────────────────────────────────────────
export const initialUsers = [
  {
    id: 'USR-001',
    username: 'superadmin',
    password: 'password123',
    name: 'Dr. Rajesh Kumar',
    role: 'superadmin',
    department: 'Admin Block',
    email: 'rajesh.kumar@nec.edu.in'
  },
  {
    id: 'USR-002',
    username: 'cs_admin',
    password: 'password123',
    name: 'Prof. Anitha Sharma',
    role: 'deptadmin',
    department: 'Computer Science',
    email: 'anitha.sharma@nec.edu.in'
  },
  {
    id: 'USR-003',
    username: 'mech_admin',
    password: 'password123',
    name: 'Prof. Kavitha Raj',
    role: 'deptadmin',
    department: 'Mechanical',
    email: 'kavitha.raj@nec.edu.in'
  },
  {
    id: 'USR-004',
    username: 'civil_admin',
    password: 'password123',
    name: 'Prof. Aruna Devi',
    role: 'deptadmin',
    department: 'Civil',
    email: 'aruna.devi@nec.edu.in'
  },
  {
    id: 'USR-005',
    username: 'it_admin',
    password: 'password123',
    name: 'Dr. M. Venkatesh',
    role: 'deptadmin',
    department: 'IT',
    email: 'venkatesh.m@nec.edu.in'
  },
  {
    id: 'USR-006',
    username: 'aids_admin',
    password: 'password123',
    name: 'Dr. Nalini Patel',
    role: 'deptadmin',
    department: 'AIDS',
    email: 'nalini.patel@nec.edu.in'
  },
  {
    id: 'USR-007',
    username: 'ece_admin',
    password: 'password123',
    name: 'Prof. Ramesh Nair',
    role: 'deptadmin',
    department: 'ECE',
    email: 'ramesh.nair@nec.edu.in'
  },
  {
    id: 'USR-008',
    username: 'eee_admin',
    password: 'password123',
    name: 'Dr. R. Vijay Anand',
    role: 'deptadmin',
    department: 'EEE',
    email: 'vijayanand.r@nec.edu.in'
  },
  {
    id: 'USR-009',
    username: 'sh_admin',
    password: 'password123',
    name: 'Prof. Dinesh Kumar',
    role: 'deptadmin',
    department: 'Science & Humanities',
    email: 'dinesh.kumar@nec.edu.in'
  },
  {
    id: 'USR-010',
    username: 'admin_officer',
    password: 'password123',
    name: 'Ms. Priya Mehta',
    role: 'deptadmin',
    department: 'Admin Block',
    email: 'priya.mehta@nec.edu.in'
  },
  {
    id: 'USR-011',
    username: 'auditor',
    password: 'password123',
    name: 'Mr. Ravi Shankar',
    role: 'auditor',
    department: 'Admin Block',
    email: 'ravi.shankar@nec.edu.in'
  },
  {
    id: 'USR-012',
    username: 'cs_faculty',
    password: 'password123',
    name: 'Prof. Suresh Babu',
    role: 'faculty',
    department: 'Computer Science',
    email: 'suresh.babu@nec.edu.in'
  },
  {
    id: 'USR-013',
    username: 'chem_faculty',
    password: 'password123',
    name: 'Dr. Lalitha Devi',
    role: 'faculty',
    department: 'Science & Humanities',
    email: 'lalitha.devi@nec.edu.in'
  }
];

// ─── 2. TRANSFERS ───────────────────────────────────────────────────────────
export const initialTransfers = [
  {
    id: 'TRF-001',
    assetId: 'AST-010',
    furniture: 'Optoma Projector System',
    source: 'CS-101',
    destination: 'CS-102',
    requestedBy: 'Prof. Anitha Sharma',
    role: 'Dept Admin',
    department: 'Computer Science',
    date: '2026-09-01',
    status: 'Completed',
    reason: 'Classroom CS-102 scheduled for national online faculty development webinar'
  },
  {
    id: 'TRF-002',
    assetId: 'AST-018',
    furniture: 'Heavy Duty Metal Lathe Toolpost',
    source: 'MECH-Workshop',
    destination: 'MECH-101',
    requestedBy: 'Prof. Kavitha Raj',
    role: 'Dept Admin',
    department: 'Mechanical',
    date: '2026-09-03',
    status: 'Approved',
    reason: 'Demonstration unit required for mechanical fabrication workshop lecture'
  },
  {
    id: 'TRF-003',
    assetId: 'AST-065',
    furniture: 'FPGA Development Trainer Board',
    source: 'ECE-Lab1',
    destination: 'ECE-Lab2',
    requestedBy: 'Prof. Ramesh Nair',
    role: 'Dept Admin',
    department: 'ECE',
    date: '2026-09-05',
    status: 'Pending',
    reason: 'Inter-departmental VLSI layout & FPGA logic simulation lab session'
  },
  {
    id: 'TRF-004',
    assetId: 'AST-085',
    furniture: 'He-Ne Laser Optics Demonstration Unit',
    source: 'SH-PhysicsLab',
    destination: 'SH-101',
    requestedBy: 'Prof. Dinesh Kumar',
    role: 'Dept Admin',
    department: 'Science & Humanities',
    date: '2026-09-06',
    status: 'Rejected',
    reason: 'Laser optical table is calibrated in dark-room setup and cannot be moved'
  },
  {
    id: 'TRF-005',
    assetId: 'AST-095',
    furniture: 'Executive Conference Oval Table',
    source: 'ADM-101',
    destination: 'ADM-Hall',
    requestedBy: 'Ms. Priya Mehta',
    role: 'Dept Admin',
    department: 'Admin Block',
    date: '2026-09-07',
    status: 'Approved',
    reason: 'Scheduled for annual board of governors institutional review meeting'
  },
  {
    id: 'TRF-006',
    assetId: 'AST-099',
    furniture: 'EPSON Laser Fleet Network Printer',
    source: 'ADM-Records',
    destination: 'ADM-101',
    requestedBy: 'Ms. Priya Mehta',
    role: 'Dept Admin',
    department: 'Admin Block',
    date: '2026-09-08',
    status: 'Pending',
    reason: 'High-speed certificate and admission dossier printing requirements'
  }
];

// ─── 3. INSPECTIONS ─────────────────────────────────────────────────────────
export const initialInspections = [
  {
    id: 'INS-001',
    assetId: 'AST-010',
    furniture: 'Optoma Projector System',
    location: 'CS-101',
    condition: 'Fair',
    inspector: 'Mr. Ravi Shankar',
    date: '2026-08-05',
    notes: 'Lamp brightness measured at 2100 lumens. Recommend lamp replacement within 2 months.'
  },
  {
    id: 'INS-002',
    assetId: 'AST-017',
    furniture: 'Precision Universal Testing Machine',
    location: 'MECH-Workshop',
    condition: 'Good',
    inspector: 'Mr. Ravi Shankar',
    date: '2026-08-10',
    notes: 'Hydraulic load cells calibrated to ASTM standards. Test records updated.'
  },
  {
    id: 'INS-003',
    assetId: 'AST-096',
    furniture: 'Ricoh High-Capacity Multifunction Photocopier',
    location: 'ADM-Records',
    condition: 'Fair',
    inspector: 'Mr. Ravi Shankar',
    date: '2026-08-12',
    notes: 'Toner level at 35%. Drum roller scheduled for routine quarterly cleaning.'
  },
  {
    id: 'INS-004',
    assetId: 'AST-001',
    furniture: 'Dell OptiPlex 7090 Desktop Computer',
    location: 'CS-Lab1',
    condition: 'Good',
    inspector: 'Prof. Suresh Babu',
    date: '2026-08-18',
    notes: 'System diagnostics all passed. RAM and SSD health at 100%.'
  },
  {
    id: 'INS-005',
    assetId: 'AST-075',
    furniture: 'Digital Storage Oscilloscope 100MHz',
    location: 'EEE-Lab1',
    condition: 'Good',
    inspector: 'Dr. R. Vijay Anand',
    date: '2026-08-20',
    notes: 'Channel 1 and Channel 2 probes checked and calibrated with test generator.'
  },
  {
    id: 'INS-006',
    assetId: 'AST-092',
    furniture: 'Admin Workstation Dell Precision 3660',
    location: 'ADM-101',
    condition: 'Good',
    inspector: 'Mr. Ravi Shankar',
    date: '2026-08-25',
    notes: 'Enterprise accounting software running smoothly. Dual monitor setup tested.'
  }
];

// ─── 4. NOTIFICATIONS ───────────────────────────────────────────────────────
export const initialNotifications = [
  {
    id: 'NOTIF-001',
    title: 'Asset Updated',
    message: 'Admin Workstation Dell Precision 3660 (AST-092) was updated.',
    time: '10 min ago',
    read: false,
    department: 'Admin Block',
    type: 'asset',
    link: '/assets/AST-092'
  },
  {
    id: 'NOTIF-002',
    title: 'Campus-wide Asset Audit',
    message: 'Quarterly institutional physical asset audit initiated across all departments.',
    time: '1 hour ago',
    read: false,
    department: 'All',
    type: 'system',
    link: '/inspections'
  },
  {
    id: 'NOTIF-003',
    title: 'New Asset Registered',
    message: 'HP LaserJet Enterprise Flow Printer (AST-093) registered in ADM-101.',
    time: '2 hours ago',
    read: false,
    department: 'Admin Block',
    type: 'asset',
    link: '/assets/AST-093'
  },
  {
    id: 'NOTIF-004',
    title: 'Maintenance Logged',
    message: 'Service ticket MNT-001 created for Projector System (AST-010).',
    time: '3 hours ago',
    read: true,
    department: 'Computer Science',
    type: 'maintenance',
    link: '/maintenance'
  },
  {
    id: 'NOTIF-005',
    title: 'Transfer Request Approved',
    message: 'Transfer of Executive Oval Table to ADM-Hall approved by Principal Office.',
    time: '5 hours ago',
    read: true,
    department: 'Admin Block',
    type: 'transfer',
    link: '/transfers'
  }
];

// ─── 5. DEPARTMENTS ─────────────────────────────────────────────────────────
export const initialDepartments = [
  {
    id: 'D01',
    name: 'Computer Science',
    code: 'CS',
    building: 'Engineering Block',
    hod: 'Prof. S. Krishnamurthy',
    admin: 'Prof. Anitha Sharma'
  },
  {
    id: 'D02',
    name: 'Mechanical',
    code: 'MECH',
    building: 'Engineering Block',
    hod: 'Dr. P. Subramaniam',
    admin: 'Prof. Kavitha Raj'
  },
  {
    id: 'D03',
    name: 'Civil',
    code: 'CIVIL',
    building: 'Engineering Block',
    hod: 'Dr. Senthil Kumar',
    admin: 'Prof. Aruna Devi'
  },
  {
    id: 'D04',
    name: 'IT',
    code: 'IT',
    building: 'IT Block',
    hod: 'Dr. M. Venkatesh',
    admin: 'Prof. R. Revathi'
  },
  {
    id: 'D05',
    name: 'AIDS',
    code: 'AIDS',
    building: 'IT Block',
    hod: 'Dr. Nalini Patel',
    admin: 'Prof. K. Swaminathan'
  },
  {
    id: 'D06',
    name: 'ECE',
    code: 'ECE',
    building: 'Engineering Block',
    hod: 'Dr. S. Sundararajan',
    admin: 'Prof. Ramesh Nair'
  },
  {
    id: 'D07',
    name: 'EEE',
    code: 'EEE',
    building: 'Engineering Block',
    hod: 'Dr. R. Vijay Anand',
    admin: 'Prof. G. Murugan'
  },
  {
    id: 'D08',
    name: 'Science & Humanities',
    code: 'S&H',
    building: 'Science Block',
    hod: 'Dr. Lalitha Devi',
    admin: 'Prof. Dinesh Kumar'
  },
  {
    id: 'D09',
    name: 'Admin Block',
    code: 'ADM',
    building: 'Admin Block',
    hod: 'Dr. Rajesh Kumar',
    admin: 'Ms. Priya Mehta'
  }
];

// ─── 6. BUILDINGS ───────────────────────────────────────────────────────────
export const initialBuildings = [
  { id: 'B01', name: 'Engineering Block', code: 'ENG', floors: 4 },
  { id: 'B02', name: 'Science Block', code: 'SCI', floors: 3 },
  { id: 'B03', name: 'Admin Block', code: 'ADM', floors: 2 },
  { id: 'B04', name: 'IT Block', code: 'ITB', floors: 4 },
  { id: 'B05', name: 'Central Library', code: 'LIB', floors: 3 }
];

// ─── 7. ROOMS ───────────────────────────────────────────────────────────────
export const initialRooms = [
  {
    id: 'R01',
    number: 'CS-101',
    building: 'Engineering Block',
    department: 'Computer Science',
    floor: 1,
    type: 'Smart Classroom',
    capacity: 60
  },
  {
    id: 'R02',
    number: 'CS-Lab1',
    building: 'Engineering Block',
    department: 'Computer Science',
    floor: 2,
    type: 'Computer Laboratory',
    capacity: 40
  },
  {
    id: 'R03',
    number: 'MECH-101',
    building: 'Engineering Block',
    department: 'Mechanical',
    floor: 1,
    type: 'Lecture Hall',
    capacity: 60
  },
  {
    id: 'R04',
    number: 'MECH-Workshop',
    building: 'Engineering Block',
    department: 'Mechanical',
    floor: 1,
    type: 'Central Machine & CNC Workshop',
    capacity: 50
  },
  {
    id: 'R05',
    number: 'CIVIL-101',
    building: 'Engineering Block',
    department: 'Civil',
    floor: 1,
    type: 'Architectural Drafting Studio',
    capacity: 45
  },
  {
    id: 'R06',
    number: 'CIVIL-Lab1',
    building: 'Engineering Block',
    department: 'Civil',
    floor: 1,
    type: 'Materials & Concrete Testing Lab',
    capacity: 35
  },
  {
    id: 'R07',
    number: 'IT-101',
    building: 'IT Block',
    department: 'IT',
    floor: 1,
    type: 'Software Development Lab',
    capacity: 40
  },
  {
    id: 'R08',
    number: 'AIDS-101',
    building: 'IT Block',
    department: 'AIDS',
    floor: 2,
    type: 'AI & Deep Learning Computing Lab',
    capacity: 35
  },
  {
    id: 'R09',
    number: 'ECE-101',
    building: 'Engineering Block',
    department: 'ECE',
    floor: 3,
    type: 'VLSI & Embedded Systems Lab',
    capacity: 35
  },
  {
    id: 'R10',
    number: 'EEE-101',
    building: 'Engineering Block',
    department: 'EEE',
    floor: 2,
    type: 'Power Electronics & Drives Lab',
    capacity: 35
  },
  {
    id: 'R11',
    number: 'SH-101',
    building: 'Science Block',
    department: 'Science & Humanities',
    floor: 1,
    type: 'Foundational Sciences Smart Hall',
    capacity: 60
  },
  {
    id: 'R12',
    number: 'SH-PhysicsLab',
    building: 'Science Block',
    department: 'Science & Humanities',
    floor: 2,
    type: 'General Physics & Optics Lab',
    capacity: 40
  },
  {
    id: 'R13',
    number: 'SH-ChemistryLab',
    building: 'Science Block',
    department: 'Science & Humanities',
    floor: 3,
    type: 'Engineering Chemistry Lab',
    capacity: 40
  },
  {
    id: 'R14',
    number: 'ADM-101',
    building: 'Admin Block',
    department: 'Admin Block',
    floor: 1,
    type: 'Principal & Executive Administrative Office',
    capacity: 25
  },
  {
    id: 'R15',
    number: 'ADM-Hall',
    building: 'Admin Block',
    department: 'Admin Block',
    floor: 1,
    type: 'Main Boardroom & Senate Conference Hall',
    capacity: 40
  },
  {
    id: 'R16',
    number: 'ADM-Records',
    building: 'Admin Block',
    department: 'Admin Block',
    floor: 2,
    type: 'Confidential Examination & Records Vault',
    capacity: 15
  },
  {
    id: 'R17',
    number: 'ADM-ServerRoom',
    building: 'Admin Block',
    department: 'Admin Block',
    floor: 2,
    type: 'Campus Central Data Center & Server Room',
    capacity: 10
  }
];

// ─── 8. MAINTENANCE LOGS ────────────────────────────────────────────────────
export const initialMaintenanceLogs = [
  {
    id: 'MNT-001',
    assetId: 'AST-010',
    furniture: 'Optoma Projector System',
    issueDescription: 'Lamp dimming below acceptable lumens threshold during presentations',
    scheduledDate: '2026-09-15',
    completedDate: '2026-09-16',
    cost: 3500.00,
    status: 'Scheduled',
    vendor: 'Apex AV Solutions',
    technicianNotes: 'OEM replacement lamp scheduled for delivery and on-site testing'
  },
  {
    id: 'MNT-002',
    assetId: 'AST-096',
    furniture: 'Ricoh High-Capacity Multifunction Photocopier',
    issueDescription: 'Paper feed tray roller gear slipping under heavy print loads',
    scheduledDate: '2026-09-02',
    completedDate: '2026-09-07',
    cost: 4200.00,
    status: 'Completed',
    vendor: 'Matrix Electronics Care',
    technicianNotes: 'Replaced primary pick-up roller and aligned ADF scanning unit'
  },
  {
    id: 'MNT-003',
    assetId: 'AST-001',
    furniture: 'Dell OptiPlex 7090 Desktop Computer',
    issueDescription: 'Power supply unit fan noise during high compute load',
    scheduledDate: '2026-09-10',
    completedDate: '2026-09-11',
    cost: 1200.00,
    status: 'In Progress',
    vendor: 'Dell India Enterprise',
    technicianNotes: 'Dell gold warranty engineer dispatched for replacement unit'
  },
  {
    id: 'MNT-004',
    assetId: 'AST-095',
    furniture: 'Executive Conference Oval Table',
    issueDescription: 'Cable routing grommet loose on center conference desk',
    scheduledDate: '2026-08-20',
    completedDate: '2026-08-22',
    cost: 850.00,
    status: 'Completed',
    vendor: 'Godrej Interio Care',
    technicianNotes: 'Secured motorized popup power sockets and re-tightened brackets'
  },
  {
    id: 'MNT-005',
    assetId: 'AST-098',
    furniture: 'Godrej Fire-Resistant Filing Cabinet',
    issueDescription: 'Central multi-lever lock cylinder lubrication required',
    scheduledDate: '2026-09-12',
    completedDate: '2026-09-13',
    cost: 650.00,
    status: 'Scheduled',
    vendor: 'Godrej Interio Care',
    technicianNotes: 'Annual preventive inspection and master key cylinder calibration'
  }
];

// ─── 9. DISPOSALS ───────────────────────────────────────────────────────────
export const initialDisposals = [
  {
    id: 'DSP-001',
    assetId: 'AST-OLD-01',
    furniture: 'Cathode Ray Tube Monitors (Batch of 8)',
    disposalDate: '2026-08-15',
    reason: 'Scrapped',
    resaleValue: 1200.00,
    approvedBy: 'Dr. Rajesh Kumar',
    notes: 'E-waste handed over to authorized certified recycling partner GreenTech E-Waste.'
  },
  {
    id: 'DSP-002',
    assetId: 'AST-OLD-02',
    furniture: 'Defective Wooden Classroom Benches (Batch of 12)',
    disposalDate: '2026-08-28',
    reason: 'Damaged Beyond Repair',
    resaleValue: 3500.00,
    approvedBy: 'Dr. Rajesh Kumar',
    notes: 'Termite infestation and structural integrity failure. Sold to registered salvage auctioneer.'
  },
  {
    id: 'DSP-003',
    assetId: 'AST-OLD-03',
    furniture: 'Core2Duo Intel Desktops (Batch of 5)',
    disposalDate: '2026-09-01',
    reason: 'Donated',
    resaleValue: 0.00,
    approvedBy: 'Dr. Rajesh Kumar',
    notes: 'Donated to Rural High School Computer Literacy Program with hard drives securely wiped.'
  }
];

// ─── 10. VENDORS ────────────────────────────────────────────────────────────
export const initialVendors = [
  {
    id: 'VND-001',
    name: 'Apex AV Solutions',
    contactPerson: 'Arun Varma',
    email: 'sales@apexav.com',
    phone: '+91 98765 43210',
    address: 'Tech Park Zone, Phase 1, Bangalore, Karnataka',
    gstin: '29ABCDE1234F1Z5',
    rating: 4.8,
    services: 'Audio-Visual, Smart Interactive Boards, Laser Projectors, Sound Systems'
  },
  {
    id: 'VND-002',
    name: 'ErgoDesign Workspaces',
    contactPerson: 'Sunita Rao',
    email: 'support@ergodesign.in',
    phone: '+91 98111 22334',
    address: 'Industrial Area Phase 2, Guindy, Chennai, Tamil Nadu',
    gstin: '33ABCDE5678G2Z1',
    rating: 4.6,
    services: 'Modular Desks, Ergonomic Chairs, Laboratory Benches, Partitions'
  },
  {
    id: 'VND-003',
    name: 'Matrix Electronics Care',
    contactPerson: 'Karan Malhotra',
    email: 'service@matrixcare.co.in',
    phone: '+91 94444 88899',
    address: 'Electronics City, Hitec City, Hyderabad, Telangana',
    gstin: '36ABCDE9876H3Z8',
    rating: 4.5,
    services: 'Annual Maintenance Contracts (AMC), Motherboard Repair, Power Equipment'
  },
  {
    id: 'VND-004',
    name: 'Godrej Interio Commercial',
    contactPerson: 'Manoj Pillai',
    email: 'commercial@godrejinterio.com',
    phone: '+91 98222 33445',
    address: 'Express Towers, Nariman Point, Mumbai, Maharashtra',
    gstin: '27AAACG0563G1ZT',
    rating: 4.9,
    services: 'Heavy Duty Steel Cupboards, Classroom Dual Desks, Fireproof Safes'
  },
  {
    id: 'VND-005',
    name: 'Dell India Enterprise',
    contactPerson: 'Vikram Malhotra',
    email: 'enterprise_sales@dell.com',
    phone: '+91 80 4123 5500',
    address: 'Divyasree Greens, Koramangala, Bangalore, Karnataka',
    gstin: '29AAACD0125F1Z8',
    rating: 4.7,
    services: 'Workstations, High-Performance Rack Servers, LED Monitors, Networking'
  }
];

// ─── 11. AUDIT LOGS ─────────────────────────────────────────────────────────
export const initialAuditLogs = [
  {
    id: 'AUD-001',
    userId: 'USR-001',
    userName: 'Dr. Rajesh Kumar',
    userRole: 'superadmin',
    action: 'CREATE',
    entity: 'Asset',
    entityId: 'AST-092',
    details: 'Registered Admin Workstation Dell Precision 3660 for central institutional records',
    created_at: '2026-09-01T09:30:00.000Z'
  },
  {
    id: 'AUD-002',
    userId: 'USR-002',
    userName: 'Prof. Anitha Sharma',
    userRole: 'deptadmin',
    action: 'TRANSFER',
    entity: 'Asset',
    entityId: 'AST-010',
    details: 'Transferred Projector System from CS-101 to CS-102 for online webinar series',
    created_at: '2026-09-02T11:15:00.000Z'
  },
  {
    id: 'AUD-003',
    userId: 'USR-011',
    userName: 'Mr. Ravi Shankar',
    userRole: 'auditor',
    action: 'INSPECT',
    entity: 'Asset',
    entityId: 'AST-096',
    details: 'Logged physical inspection: Ricoh High-Capacity Multifunction Photocopier verified',
    created_at: '2026-09-03T14:20:00.000Z'
  },
  {
    id: 'AUD-004',
    userId: 'USR-001',
    userName: 'Dr. Rajesh Kumar',
    userRole: 'superadmin',
    action: 'DISPOSE',
    entity: 'Asset',
    entityId: 'AST-OLD-01',
    details: 'Approved disposal and e-waste recycling of 8 CRT monitors with resale recovery of ₹1,200',
    created_at: '2026-09-04T16:45:00.000Z'
  },
  {
    id: 'AUD-005',
    userId: 'USR-007',
    userName: 'Prof. Ramesh Nair',
    userRole: 'deptadmin',
    action: 'UPDATE',
    entity: 'Asset',
    entityId: 'AST-065',
    details: 'Updated custodian assignment for FPGA Development Trainer Board in ECE Lab 2',
    created_at: '2026-09-05T10:05:00.000Z'
  },
  {
    id: 'AUD-006',
    userId: 'USR-001',
    userName: 'Dr. Rajesh Kumar',
    userRole: 'superadmin',
    action: 'CREATE',
    entity: 'Vendor',
    entityId: 'VND-005',
    details: 'Added Dell India Enterprise to approved campus hardware supplier directory',
    created_at: '2026-09-06T13:00:00.000Z'
  }
];

// ─── 12. CATEGORIES ─────────────────────────────────────────────────────────
export const initialCategories = [
  {
    id: 'CAT-001',
    name: 'Chairs & Seating',
    mainCategory: 'Furniture',
    code: 'CHR',
    icon: 'Chair',
    depreciationRate: 15.00,
    usefulLifeYears: 7,
    description: 'Task chairs, executive chairs, conference chairs, and lab stools'
  },
  {
    id: 'CAT-002',
    name: 'Desks & Tables',
    mainCategory: 'Furniture',
    code: 'DSK',
    icon: 'Table',
    depreciationRate: 10.00,
    usefulLifeYears: 10,
    description: 'Faculty desks, student benches, podiums, conference tables'
  },
  {
    id: 'CAT-003',
    name: 'Display & Boards',
    mainCategory: 'Furniture',
    code: 'BRD',
    icon: 'Tv',
    depreciationRate: 12.50,
    usefulLifeYears: 8,
    description: 'Magnetic whiteboards, interactive smart boards, and pin-up notice boards'
  },
  {
    id: 'CAT-004',
    name: 'AV & Electronic Equipment',
    mainCategory: 'Electronics',
    code: 'AVE',
    icon: 'Monitor',
    depreciationRate: 20.00,
    usefulLifeYears: 5,
    description: 'Laser projectors, digital smart boards, sound systems, presentation gear'
  },
  {
    id: 'CAT-005',
    name: 'Storage & Cupboards',
    mainCategory: 'Furniture',
    code: 'STR',
    icon: 'Archive',
    depreciationRate: 10.00,
    usefulLifeYears: 12,
    description: 'Heavy-gauge steel almirahs, filing cabinets, library book racks'
  },
  {
    id: 'CAT-006',
    name: 'Laboratory Equipment & Benches',
    mainCategory: 'Laboratory',
    code: 'LAB',
    icon: 'FlaskConical',
    depreciationRate: 15.00,
    usefulLifeYears: 8,
    description: 'Acid-resistant granite tables, fume hoods, electronic test benches'
  }
];
