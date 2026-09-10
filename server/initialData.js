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
    department: 'Administration',
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
    username: 'ece_admin',
    password: 'password123',
    name: 'Prof. Ramesh Nair',
    role: 'deptadmin',
    department: 'ECE',
    email: 'ramesh.nair@nec.edu.in'
  },
  {
    id: 'USR-005',
    username: 'auditor',
    password: 'password123',
    name: 'Mr. Ravi Shankar',
    role: 'auditor',
    department: 'Auditor',
    email: 'ravi.shankar@nec.edu.in'
  },
  {
    id: 'USR-006',
    username: 'cs_faculty',
    password: 'password123',
    name: 'Prof. Suresh Babu',
    role: 'faculty',
    department: 'Computer Science',
    email: 'suresh.babu@nec.edu.in'
  },
  {
    id: 'USR-007',
    username: 'phy_faculty',
    password: 'password123',
    name: 'Prof. Dinesh Kumar',
    role: 'faculty',
    department: 'Physics',
    email: 'dinesh.kumar@nec.edu.in'
  },
  {
    id: 'USR-008',
    username: 'chem_faculty',
    password: 'password123',
    name: 'Dr. Lalitha Devi',
    role: 'faculty',
    department: 'Chemistry',
    email: 'lalitha.devi@nec.edu.in'
  },
  {
    id: 'USR-009',
    username: 'lib_head',
    password: 'password123',
    name: 'Ms. Geeta Nair',
    role: 'deptadmin',
    department: 'Library',
    email: 'geeta.nair@nec.edu.in'
  },
  {
    id: 'USR-010',
    username: 'estate_officer',
    password: 'password123',
    name: 'Ms. Priya Mehta',
    role: 'faculty',
    department: 'Administration',
    email: 'priya.mehta@nec.edu.in'
  }
];

// ─── 2. TRANSFERS ───────────────────────────────────────────────────────────
export const initialTransfers = [
  {
    id: 'TRF-001',
    assetId: 'AST-029',
    furniture: 'LCD Projector',
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
    assetId: 'AST-003',
    furniture: 'Student Chair (5 units)',
    source: 'ME-101',
    destination: 'CS-101',
    requestedBy: 'Prof. Suresh Babu',
    role: 'Faculty',
    department: 'Mechanical',
    date: '2026-09-03',
    status: 'Approved',
    reason: 'Additional student desks required for semester end practical exams'
  },
  {
    id: 'TRF-003',
    assetId: 'AST-030',
    furniture: 'Dell Workstation Tower (2 units)',
    source: 'CS-Lab1',
    destination: 'ECE-Lab2',
    requestedBy: 'Prof. Ramesh Nair',
    role: 'Dept Admin',
    department: 'ECE',
    date: '2026-09-05',
    status: 'Pending',
    reason: 'Inter-departmental VLSI layout & FPGA logic simulation lab test'
  },
  {
    id: 'TRF-004',
    assetId: 'AST-025',
    furniture: 'Magnetic Ceramic Whiteboard (8x4)',
    source: 'PH-201',
    destination: 'PH-202',
    requestedBy: 'Prof. Dinesh Kumar',
    role: 'Faculty',
    department: 'Physics',
    date: '2026-09-06',
    status: 'Rejected',
    reason: 'Whiteboard is wall-mounted and fixed with anchoring bolts to structural wall'
  },
  {
    id: 'TRF-005',
    assetId: 'AST-010',
    furniture: 'Boardroom Oval Office Table',
    source: 'ADM-101',
    destination: 'ADM-Hall',
    requestedBy: 'Ms. Priya Mehta',
    role: 'Faculty',
    department: 'Administration',
    date: '2026-09-07',
    status: 'Approved',
    reason: 'Scheduled for annual board of governors institutional review meeting'
  },
  {
    id: 'TRF-006',
    assetId: 'AST-018',
    furniture: 'Podium / Rostrum with Mic Mount',
    source: 'ADM-Hall',
    destination: 'CS-101',
    requestedBy: 'Prof. Anitha Sharma',
    role: 'Dept Admin',
    department: 'Computer Science',
    date: '2026-09-08',
    status: 'Pending',
    reason: 'Guest lecture on Artificial Intelligence and Large Language Models'
  }
];

// ─── 3. INSPECTIONS ─────────────────────────────────────────────────────────
export const initialInspections = [
  {
    id: 'INS-001',
    assetId: 'AST-029',
    furniture: 'LCD Projector',
    location: 'CS-101',
    condition: 'Fair',
    inspector: 'Mr. Ravi Shankar',
    date: '2026-08-05',
    notes: 'Lamp brightness measured at 2100 lumens. Recommend lamp replacement within 2 months.'
  },
  {
    id: 'INS-002',
    assetId: 'AST-026',
    furniture: 'Green Chalkboard',
    location: 'ME-101',
    condition: 'Poor',
    inspector: 'Ms. Geeta Nair',
    date: '2026-08-10',
    notes: 'Surface scratches and aluminum frame loosening. Surface resurfacing or replacement recommended.'
  },
  {
    id: 'INS-003',
    assetId: 'AST-032',
    furniture: 'Optoma Short-Throw Laser Projector',
    location: 'PH-202',
    condition: 'Damaged',
    inspector: 'Mr. Ravi Shankar',
    date: '2026-08-12',
    notes: 'Optical engine ballast fault causing shutoff after 10 minutes. Transferred to maintenance queue.'
  },
  {
    id: 'INS-004',
    assetId: 'AST-001',
    furniture: 'Ergonomic Mesh Task Chair',
    location: 'CS-Lab1',
    condition: 'Good',
    inspector: 'Prof. Suresh Babu',
    date: '2026-08-18',
    notes: 'Hydraulic lift inspected and lubricated. Lumbar support intact and smooth 360-degree swivel.'
  },
  {
    id: 'INS-005',
    assetId: 'AST-027',
    furniture: 'Interactive 75" Smart Board',
    location: 'PH-202',
    condition: 'Good',
    inspector: 'Prof. Dinesh Kumar',
    date: '2026-08-20',
    notes: 'Touch sensor matrix recalibrated with software v4.2. Stylus pens tested and functional.'
  },
  {
    id: 'INS-006',
    assetId: 'AST-007',
    furniture: 'Granite Top Student Lab Table',
    location: 'CH-301',
    condition: 'Fair',
    inspector: 'Dr. Lalitha Devi',
    date: '2026-08-25',
    notes: 'Under-shelf sink plumbing shows minor leak. Reagent racks sturdy and acid sealant intact.'
  }
];

// ─── 4. NOTIFICATIONS ───────────────────────────────────────────────────────
export const initialNotifications = [
  {
    id: 'NOTIF-001',
    title: 'Asset Updated',
    message: 'ViewSonic Portable 3000-Lumens LED Smart Projector (AST-030) was updated.',
    time: '10 min ago',
    read: false,
    department: 'ECE',
    type: 'asset',
    link: '/assets/AST-030'
  },
  {
    id: 'NOTIF-002',
    title: 'Campus-wide Asset Audit',
    message: 'Quarterly institutional physical asset audit initiated across all science laboratories.',
    time: '1 hour ago',
    read: false,
    department: 'All',
    type: 'system',
    link: '/inspections'
  },
  {
    id: 'NOTIF-003',
    title: 'New Asset Registered',
    message: 'Ergonomic Task Chair (AST-001) was registered in CS-Lab1.',
    time: '2 hours ago',
    read: false,
    department: 'Computer Science',
    type: 'asset',
    link: '/assets/AST-001'
  },
  {
    id: 'NOTIF-004',
    title: 'Maintenance Logged',
    message: 'Service ticket MNT-001 created for LCD Projector (AST-029).',
    time: '3 hours ago',
    read: true,
    department: 'Computer Science',
    type: 'maintenance',
    link: '/maintenance'
  },
  {
    id: 'NOTIF-005',
    title: 'Transfer Request Approved',
    message: 'Transfer of 5 Student Chairs to CS-101 has been approved by Estate Office.',
    time: '5 hours ago',
    read: true,
    department: 'Mechanical',
    type: 'transfer',
    link: '/transfers'
  }
];

// ─── 5. DEPARTMENTS ─────────────────────────────────────────────────────────
export const initialDepartments = [
  {
    id: 'D01',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    building: 'Engineering Block',
    hod: 'Prof. S. Krishnamurthy',
    admin: 'Prof. Anitha Sharma'
  },
  {
    id: 'D02',
    name: 'Electronics & Communication',
    code: 'ECE',
    building: 'Engineering Block',
    hod: 'Dr. M. Venkatesh',
    admin: 'Prof. Ramesh Nair'
  },
  {
    id: 'D03',
    name: 'Mechanical Engineering',
    code: 'ME',
    building: 'Engineering Block',
    hod: 'Dr. P. Subramaniam',
    admin: 'Prof. Kavitha Raj'
  },
  {
    id: 'D04',
    name: 'Physics',
    code: 'PHY',
    building: 'Science Block',
    hod: 'Dr. Nalini Patel',
    admin: 'Prof. Dinesh Kumar'
  },
  {
    id: 'D05',
    name: 'Chemistry',
    code: 'CHEM',
    building: 'Science Block',
    hod: 'Dr. Lalitha Devi',
    admin: 'Prof. Suresh Iyer'
  },
  {
    id: 'D06',
    name: 'Administration',
    code: 'ADM',
    building: 'Admin Block',
    hod: 'Dr. Rajesh Kumar',
    admin: 'Ms. Priya Mehta'
  },
  {
    id: 'D07',
    name: 'Mathematics',
    code: 'MATH',
    building: 'Science Block',
    hod: 'Dr. Karthik Rajan',
    admin: 'Prof. Meena Sundaram'
  },
  {
    id: 'D08',
    name: 'Civil Engineering',
    code: 'CIVIL',
    building: 'IT Block',
    hod: 'Dr. Senthil Kumar',
    admin: 'Prof. Aruna Devi'
  }
];

// ─── 6. BUILDINGS ───────────────────────────────────────────────────────────
export const initialBuildings = [
  { id: 'B01', name: 'Engineering Block', code: 'ENG', floors: 4 },
  { id: 'B02', name: 'Science Block', code: 'SCI', floors: 3 },
  { id: 'B03', name: 'Admin Block', code: 'ADM', floors: 2 },
  { id: 'B04', name: 'Central Library', code: 'LIB', floors: 3 },
  { id: 'B05', name: 'IT Block', code: 'ITB', floors: 4 },
  { id: 'B06', name: 'Management Block', code: 'MBA', floors: 3 },
  { id: 'B07', name: 'Humanities Block', code: 'HUM', floors: 3 },
  { id: 'B08', name: 'Sports & Arts Complex', code: 'SAC', floors: 2 }
];

// ─── 7. ROOMS ───────────────────────────────────────────────────────────────
export const initialRooms = [
  {
    id: 'R01',
    number: 'CS-101',
    building: 'Engineering Block',
    department: 'Computer Science & Engineering',
    floor: 1,
    type: 'Smart Classroom',
    capacity: 60
  },
  {
    id: 'R02',
    number: 'CS-102',
    building: 'Engineering Block',
    department: 'Computer Science & Engineering',
    floor: 1,
    type: 'Lecture Hall',
    capacity: 60
  },
  {
    id: 'R03',
    number: 'CS-Lab1',
    building: 'Engineering Block',
    department: 'Computer Science & Engineering',
    floor: 2,
    type: 'Computer Laboratory',
    capacity: 40
  },
  {
    id: 'R04',
    number: 'PH-201',
    building: 'Science Block',
    department: 'Physics',
    floor: 2,
    type: 'Physics Lab & Classroom',
    capacity: 50
  },
  {
    id: 'R05',
    number: 'CH-301',
    building: 'Science Block',
    department: 'Chemistry',
    floor: 3,
    type: 'Chemistry Research Lab',
    capacity: 30
  },
  {
    id: 'R06',
    number: 'ME-101',
    building: 'Engineering Block',
    department: 'Mechanical Engineering',
    floor: 1,
    type: 'Mechanical Workshop Hall',
    capacity: 60
  },
  {
    id: 'R07',
    number: 'ECE-Lab2',
    building: 'Engineering Block',
    department: 'Electronics & Communication',
    floor: 3,
    type: 'VLSI & Embedded Lab',
    capacity: 25
  },
  {
    id: 'R08',
    number: 'LIB-01',
    building: 'Central Library',
    department: 'Administration',
    floor: 1,
    type: 'Central Reading Hall',
    capacity: 200
  },
  {
    id: 'R09',
    number: 'ADM-Hall',
    building: 'Admin Block',
    department: 'Administration',
    floor: 1,
    type: 'Main Boardroom',
    capacity: 25
  },
  {
    id: 'R10',
    number: 'PH-202',
    building: 'Science Block',
    department: 'Physics',
    floor: 2,
    type: 'Digital Smart Classroom',
    capacity: 50
  }
];

// ─── 8. MAINTENANCE LOGS ────────────────────────────────────────────────────
export const initialMaintenanceLogs = [
  {
    id: 'MNT-001',
    assetId: 'AST-029',
    furniture: 'LCD Projector',
    issueDescription: 'Lamp dimming below acceptable lumens threshold during presentations',
    scheduledDate: '2026-09-15',
    completedDate: null,
    cost: 3500.00,
    status: 'Scheduled',
    vendor: 'Apex AV Solutions',
    technicianNotes: 'OEM replacement lamp scheduled for delivery and on-site testing'
  },
  {
    id: 'MNT-002',
    assetId: 'AST-032',
    furniture: 'Optoma Short-Throw Laser Projector',
    issueDescription: 'Power ballast issue causing periodic rebooting after 15 minutes of usage',
    scheduledDate: '2026-09-02',
    completedDate: '2026-09-07',
    cost: 7200.00,
    status: 'Completed',
    vendor: 'Matrix Electronics Care',
    technicianNotes: 'Replaced power supply unit, cleaned cooling filter and verified thermal sensor'
  },
  {
    id: 'MNT-003',
    assetId: 'AST-001',
    furniture: 'Ergonomic Mesh Task Chair',
    issueDescription: 'Hydraulic cylinder slipping down under load in workstation row 3',
    scheduledDate: '2026-09-10',
    completedDate: null,
    cost: 1200.00,
    status: 'In Progress',
    vendor: 'ErgoDesign Workspaces',
    technicianNotes: 'Class 4 gas lift cylinder dispatched with field service technician'
  },
  {
    id: 'MNT-004',
    assetId: 'AST-027',
    furniture: 'Interactive 75" Smart Board',
    issueDescription: 'IR touch sensor dead zone on bottom right quadrant',
    scheduledDate: '2026-08-20',
    completedDate: '2026-08-22',
    cost: 4500.00,
    status: 'Completed',
    vendor: 'Apex AV Solutions',
    technicianNotes: 'Re-aligned optical touch sensor bezel and flashed firmware update'
  },
  {
    id: 'MNT-005',
    assetId: 'AST-012',
    furniture: 'Heavy-Gauge Steel Storage Almirah',
    issueDescription: 'Central multi-lever lock jammed with key stuck inside barrel',
    scheduledDate: '2026-09-12',
    completedDate: null,
    cost: 850.00,
    status: 'Scheduled',
    vendor: 'Godrej Interio Care',
    technicianNotes: 'Lock mechanism replacement scheduled with master key set'
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
    contactPerson: 'Pooja Hegde',
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
    entityId: 'AST-001',
    details: 'Registered 40 units of Ergonomic High-Back Mesh Task Chair into CS-Lab1 inventory',
    created_at: '2026-09-01T09:30:00.000Z'
  },
  {
    id: 'AUD-002',
    userId: 'USR-002',
    userName: 'Prof. Anitha Sharma',
    userRole: 'deptadmin',
    action: 'TRANSFER',
    entity: 'Asset',
    entityId: 'AST-029',
    details: 'Transferred LCD Projector from CS-101 to CS-102 for online webinar series',
    created_at: '2026-09-02T11:15:00.000Z'
  },
  {
    id: 'AUD-003',
    userId: 'USR-005',
    userName: 'Mr. Ravi Shankar',
    userRole: 'auditor',
    action: 'INSPECT',
    entity: 'Asset',
    entityId: 'AST-032',
    details: 'Logged physical inspection: Optoma Projector diagnosed with faulty optical ballast',
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
    userId: 'USR-004',
    userName: 'Prof. Ramesh Nair',
    userRole: 'deptadmin',
    action: 'UPDATE',
    entity: 'Asset',
    entityId: 'AST-030',
    details: 'Updated custodian assignment to Prof. Ramesh Nair for VLSI lab operations',
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
