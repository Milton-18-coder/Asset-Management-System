import fs from 'fs';
import { initialPurchaseHistory, initialVendors } from './initialData.js';
import { initDatabase, getPool } from './db.js';
import { seedInitialDataIfEmpty } from './seedData.js';

// 1. Read furnitureSlice.js
let furnitureContent = fs.readFileSync('./src/store/furnitureSlice.js', 'utf8');

// Align AST-001
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-001'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-001',
    name: 'Ergonomic High-Back Mesh Task Chair',
    mainCategory: 'Furniture',
    category: 'Chair',
    itemType: 'Task Chair',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-Lab1',
    assignedTo: 'Prof. Suresh Babu',
    assignedRole: 'Lab In-Charge & Faculty',
    assignedEmail: 'suresh.babu@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-01-15',
    cost: 7800,
    supplier: 'ErgoDesign Workspaces',
    warranty: '3 Years (Till Jan 2029)',
    quantity: 40,
    description: 'High-back breathable mesh task chairs with adjustable lumbar support and pneumatic height lift for CS Lab workstations.'`
);

// Align AST-002
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-002'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-002',
    name: 'Student Chair with Wooden Writing Pad',
    mainCategory: 'Furniture',
    category: 'Chair',
    itemType: 'Student Chair with Writing Pad',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-101',
    assignedTo: 'Prof. Anitha Sharma',
    assignedRole: 'Classroom Coordinator',
    assignedEmail: 'anitha.sharma@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-02-05',
    cost: 3200,
    supplier: 'Godrej Interio Commercial',
    warranty: '3 Years (Till Feb 2029)',
    quantity: 60,
    description: 'Heavy-duty steel tubular framed student lecture chairs with laminated writing pad and lower wire storage basket.'`
);

// Align AST-003 and insert AST-004
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-003'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-003',
    name: 'Moulded Polypropylene Student Chair',
    mainCategory: 'Furniture',
    category: 'Chair',
    itemType: 'Student Chair',
    building: 'Engineering Block',
    department: 'Mechanical',
    room: 'MECH-101',
    assignedTo: 'Prof. Kavitha Raj',
    assignedRole: 'Classroom In-Charge',
    assignedEmail: 'kavitha.raj@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2025-06-25',
    cost: 1850,
    supplier: 'Godrej Interio Commercial',
    warranty: '2 Years (Till Jun 2027)',
    quantity: 65,
    description: 'Ergonomic contoured stackable student chair with powder-coated steel frame.'
  },
  {
    id: 'AST-004',
    name: 'Executive High-Back Leatherette Faculty Chair',
    mainCategory: 'Furniture',
    category: 'Chair',
    itemType: 'Faculty Chair',
    building: 'Admin Block',
    department: 'Admin Block',
    room: 'ADM-101',
    assignedTo: 'Dr. Rajesh Kumar',
    assignedRole: 'Principal & Super Admin',
    assignedEmail: 'rajesh.kumar@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2025-10-15',
    cost: 15500,
    supplier: 'ErgoDesign Workspaces',
    warranty: '3 Years (Till Oct 2028)',
    quantity: 6,
    description: 'Premium bonded leatherette executive ergonomic swivel chairs with synchronized tilting mechanism for senior chambers.'`
);

// Align AST-007
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-007'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-007',
    name: 'Granite Top 3-Person Student Chemistry Lab Table',
    mainCategory: 'Furniture',
    category: 'Table',
    itemType: 'Student Table',
    building: 'Science Block',
    department: 'Science & Humanities',
    room: 'SH-ChemLab',
    assignedTo: 'Dr. Lalitha Devi',
    assignedRole: 'Chemistry Faculty',
    assignedEmail: 'lalitha.devi@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2025-11-20',
    cost: 28500,
    supplier: 'ErgoDesign Workspaces',
    warranty: '5 Years (Till Nov 2030)',
    quantity: 12,
    description: 'Acid, alkali and heat resistant thick jet black granite top laboratory workbench with integrated reagent racks and PP sink.'`
);

// Align AST-009
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-009'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-009',
    name: 'Executive Teak Wood Faculty Work Desk',
    mainCategory: 'Furniture',
    category: 'Table',
    itemType: 'Faculty Table',
    building: 'Engineering Block',
    department: 'ECE',
    room: 'ECE-Lab2',
    assignedTo: 'Prof. Ramesh Nair',
    assignedRole: 'ECE Dept In-Charge',
    assignedEmail: 'ramesh.nair@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-01-10',
    cost: 22500,
    supplier: 'Godrej Interio Commercial',
    warranty: '5 Years (Till Jan 2031)',
    quantity: 4,
    description: '5x3 ft melamine finished faculty desk with 3-drawer side pedestal, central lock, and cable pass-through port.'`
);

// Align AST-015
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-015'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-015',
    name: 'High-Lumen 4K Laser Classroom Projector',
    mainCategory: 'Teaching Equipment',
    category: 'Projector',
    itemType: 'Laser Projector',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-Lab1',
    assignedTo: 'Prof. Suresh Babu',
    assignedRole: 'Lab In-Charge',
    assignedEmail: 'suresh.babu@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-03-01',
    cost: 88000,
    supplier: 'Apex AV Solutions',
    warranty: '3 Years Onsite (Till Mar 2029)',
    quantity: 8,
    description: '4K UHD ultra-bright laser projection system for smart multimedia lecture classrooms and seminar halls.'`
);

// Align AST-016
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-016'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-016',
    name: 'Interactive Multi-Touch Smart Whiteboard',
    mainCategory: 'Teaching Equipment',
    category: 'Boards',
    itemType: 'Interactive Smart Board',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-102',
    assignedTo: 'Prof. Anitha Sharma',
    assignedRole: 'Classroom Coordinator',
    assignedEmail: 'anitha.sharma@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-02-18',
    cost: 122000,
    supplier: 'Apex AV Solutions',
    warranty: '3 Years (Till Feb 2029)',
    quantity: 5,
    description: '75-inch infrared multi-touch interactive digital smart display board with pen and multi-gesture support.'`
);

// Align AST-021 & AST-022 and insert AST-020
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-021'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-020',
    name: 'Dell OptiPlex Desktop Workstation',
    mainCategory: 'IT Hardware',
    category: 'Computing & Workstations',
    itemType: 'Desktop Workstation',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-Lab1',
    assignedTo: 'Prof. Suresh Babu',
    assignedRole: 'Lab In-Charge',
    assignedEmail: 'suresh.babu@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-01-20',
    cost: 65000,
    supplier: 'Dell India Enterprise',
    warranty: '3 Years ProSupport (Till Jan 2029)',
    quantity: 40,
    description: 'High-performance commercial desktop workstations equipped with Intel Core i7 13th Gen, 32GB DDR5 RAM, and 1TB NVMe SSD.'
  },
  {
    id: 'AST-021',
    name: 'Dell Latitude Core i7 Faculty Laptop',
    mainCategory: 'IT Hardware',
    category: 'Computing & Workstations',
    itemType: 'Faculty Laptop',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-101',
    assignedTo: 'Prof. Anitha Sharma',
    assignedRole: 'Dept Admin',
    assignedEmail: 'anitha.sharma@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-02-10',
    cost: 76500,
    supplier: 'Dell India Enterprise',
    warranty: '3 Years Complete Care (Till Feb 2029)',
    quantity: 10,
    description: 'Enterprise ultrabook with 14-inch FHD IPS display, Intel Core i7, 16GB RAM and 512GB NVMe SSD.'`
);

furnitureContent = furnitureContent.replace(
  /id:\s*'AST-022'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-022',
    name: 'Matrix Smart UPS & Power Backup 5KVA',
    mainCategory: 'Electricals',
    category: 'Fans & Cooling',
    itemType: 'Online UPS',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-Lab1',
    assignedTo: 'Prof. Suresh Babu',
    assignedRole: 'Power Infrastructure Lead',
    assignedEmail: 'suresh.babu@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-02-28',
    cost: 46500,
    supplier: 'Matrix Electronics Care',
    warranty: '2 Years Battery + Inverter (Till Feb 2028)',
    quantity: 6,
    description: '5KVA pure sine wave online uninterruptible power supply with external battery pack.'`
);

// Align AST-101 to AST-104
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-101'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-101',
    name: 'Digital Precision Electronic Analytical Laboratory Balance 0.1mg',
    mainCategory: 'Laboratory',
    category: 'Analytical Instruments',
    itemType: 'Digital Precision Analytical Balance',
    building: 'Science Block',
    department: 'Science & Humanities',
    room: 'SH-ChemLab',
    assignedTo: 'Prof. Dinesh Kumar',
    assignedRole: 'Chemistry Lab Head',
    assignedEmail: 'dinesh.kumar@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-01-22',
    cost: 46200,
    supplier: 'ThermoFisher Scientific Lab Solutions',
    warranty: '3 Years Calibration (Till Jan 2029)',
    quantity: 13,
    description: 'High-precision electromagnetic force restoration balance with 0.1mg readability and internal motor calibration.'`
);

furnitureContent = furnitureContent.replace(
  /id:\s*'AST-102'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-102',
    name: 'Binocular Research Compound Microscope with LED Illumination',
    mainCategory: 'Laboratory',
    category: 'Optical & Microscopy',
    itemType: 'Binocular Research Compound Microscope',
    building: 'Science Block',
    department: 'Science & Humanities',
    room: 'SH-PhyLab',
    assignedTo: 'Prof. Dinesh Kumar',
    assignedRole: 'Lab Custodian',
    assignedEmail: 'dinesh.kumar@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-02-14',
    cost: 21000,
    supplier: 'ThermoFisher Scientific Lab Solutions',
    warranty: '3 Years Optics (Till Feb 2029)',
    quantity: 33,
    description: 'Quadruple revolving nosepiece plan achromatic objective microscope with coaxial coarse and fine focus controls and LED illumination.'`
);

furnitureContent = furnitureContent.replace(
  /id:\s*'AST-103'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-103',
    name: 'Horizontal Laminar Air Flow Chamber Ultra Clean Workstation',
    mainCategory: 'Laboratory',
    category: 'Glassware & Biosafety',
    itemType: 'Horizontal Laminar Air Flow Chamber',
    building: 'Science Block',
    department: 'Science & Humanities',
    room: 'SH-ChemLab',
    assignedTo: 'Prof. Dinesh Kumar',
    assignedRole: 'Biosafety Lead',
    assignedEmail: 'dinesh.kumar@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2025-08-12',
    cost: 82500,
    supplier: 'ThermoFisher Scientific Lab Solutions',
    warranty: '2 Years HEPA & Motor (Till Aug 2027)',
    quantity: 5,
    description: 'ISO Class 5 sterile airflow environment with 99.99% efficient HEPA filtration for microbiological cultures.'
  },
  {
    id: 'AST-104',
    name: 'Pelton Wheel Turbine Fluid Mechanics Rig',
    mainCategory: 'Laboratory',
    category: 'Engineering & Testing',
    itemType: 'Pelton Wheel Turbine Fluid Mechanics Rig',
    building: 'Engineering Block',
    department: 'Mechanical',
    room: 'MECH-Workshop',
    assignedTo: 'Prof. Kavitha Raj',
    assignedRole: 'Fluids Lab In-Charge',
    assignedEmail: 'kavitha.raj@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2025-10-15',
    cost: 152000,
    supplier: 'ThermoFisher Scientific Lab Solutions',
    warranty: '3 Years Comprehensive (Till Oct 2028)',
    quantity: 2,
    description: 'Recirculating fluid mechanics test rig with transparent spear valve casing, pressure gauge and mechanical brake dynamometer.'`
);

// Align AST-201 to AST-204
furnitureContent = furnitureContent.replace(
  /id:\s*'AST-201'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-201',
    name: 'All-in-One Desktop Core i7 Workstation (32GB RAM, 1TB SSD)',
    mainCategory: 'IT Hardware',
    category: 'Computing & Workstations',
    itemType: 'All-in-One Desktop Core i7 Workstation',
    building: 'Engineering Block',
    department: 'Computer Science',
    room: 'CS-Lab1',
    assignedTo: 'Prof. Suresh Babu',
    assignedRole: 'Computing Lab Admin',
    assignedEmail: 'suresh.babu@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-01-30',
    cost: 74000,
    supplier: 'Dell India Enterprise',
    warranty: '3 Years ProSupport NBD (Till Jan 2029)',
    quantity: 70,
    description: 'High-performance commercial desktop workstations equipped with Intel Core i7 14th Gen, 32GB DDR5 RAM, and 1TB NVMe Gen4 SSD.'`
);

furnitureContent = furnitureContent.replace(
  /id:\s*'AST-202'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-202',
    name: '24-Port Gigabit Managed PoE+ Network Switch',
    mainCategory: 'IT Hardware',
    category: 'Networking & Infrastructure',
    itemType: '24-Port Gigabit Managed PoE+ Network Switch',
    building: 'Engineering Block',
    department: 'IT',
    room: 'IT-Lab1',
    assignedTo: 'Dr. M. Venkatesh',
    assignedRole: 'Network Administrator',
    assignedEmail: 'venkatesh.m@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-02-18',
    cost: 43500,
    supplier: 'Cisco Networks & IT Infrastructure',
    warranty: '5 Years Enhanced Limited Lifetime (Till Feb 2031)',
    quantity: 18,
    description: 'Layer 2/3 enterprise managed rackmount Ethernet switch with 370W PoE+ budget and 4x 10G SFP+ uplink ports.'`
);

furnitureContent = furnitureContent.replace(
  /id:\s*'AST-203'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-203',
    name: '27-inch 4K UHD IPS Professional Monitor',
    mainCategory: 'IT Hardware',
    category: 'Displays & Peripherals',
    itemType: '27-inch 4K UHD IPS Professional Monitor',
    building: 'Engineering Block',
    department: 'AIDS',
    room: 'AIDS-Lab',
    assignedTo: 'Dr. Nalini Patel',
    assignedRole: 'Research Coordinator',
    assignedEmail: 'nalini.patel@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-01-18',
    cost: 27200,
    supplier: 'Dell India Enterprise',
    warranty: '3 Years Advanced Exchange (Till Jan 2029)',
    quantity: 42,
    description: 'Factory color-calibrated 3840x2160 UHD IPS anti-glare display with USB-C 90W power delivery connectivity.'`
);

furnitureContent = furnitureContent.replace(
  /id:\s*'AST-204'[\s\S]*?description:\s*'.*?'/,
  `id: 'AST-204',
    name: 'Online Modular Rackmount UPS 5KVA',
    mainCategory: 'IT Hardware',
    category: 'Power & UPS',
    itemType: 'Online Modular Rackmount UPS 5KVA',
    building: 'Engineering Block',
    department: 'IT',
    room: 'IT-Lab1',
    assignedTo: 'Dr. M. Venkatesh',
    assignedRole: 'Infrastructure Engineer',
    assignedEmail: 'venkatesh.m@nec.edu.in',
    condition: 'Good',
    status: 'In Use',
    purchaseDate: '2026-02-05',
    cost: 58000,
    supplier: 'Matrix Electronics Care',
    warranty: '2 Years Battery & Inverter (Till Feb 2028)',
    quantity: 9,
    description: 'Zero-millisecond transfer time true online double-conversion rackmount power supply with pure sine wave output.'`
);

// Bump catalog version
furnitureContent = furnitureContent.replace(
  /const ASSET_CATALOG_VERSION = '.*?';/,
  `const ASSET_CATALOG_VERSION = 'v12_fully_reconciled_catalog';`
);

fs.writeFileSync('./src/store/furnitureSlice.js', furnitureContent, 'utf8');
console.log('src/store/furnitureSlice.js updated successfully!');
