import { createSlice } from '@reduxjs/toolkit';

const getInitialInspections = () => {
  const saved = localStorage.getItem('inspections_list');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 10) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  const initial = [
    { id: 'INS-001', assetId: 'AST-003', furniture: 'LCD Projector', location: 'CS-101', condition: 'Fair', inspector: 'Mr. Ravi Shankar', date: '2026-08-05', notes: 'Lamp brightness measured at 2100 lumens. Recommend lamp replacement within 2 months.' },
    { id: 'INS-002', assetId: 'AST-009', furniture: 'Student Chair (Set of 30)', location: 'ME-101', condition: 'Poor', inspector: 'Ms. Geeta Nair', date: '2026-08-10', notes: 'Multiple chairs have loose welding and cracked seat plywood. Immediate repair needed.' },
    { id: 'INS-003', assetId: 'AST-012', furniture: 'Digital Storage Oscilloscope', location: 'ECE-Lab2', condition: 'Damaged', inspector: 'Mr. Ravi Shankar', date: '2026-08-12', notes: 'Display channel 2 input port faulty. Internal fuse blown. Sent for OEM service.' },
    { id: 'INS-004', assetId: 'AST-006', furniture: 'Dell Workstation Tower', location: 'CS-Lab1', condition: 'Good', inspector: 'Prof. Suresh Babu', date: '2026-08-18', notes: 'All RAM modules and GPU benchmarks verified. OS upgraded to latest security patch.' },
    { id: 'INS-005', assetId: 'AST-010', furniture: 'Interactive 75" Smart Board', location: 'PH-202', condition: 'Good', inspector: 'Prof. Dinesh Kumar', date: '2026-08-20', notes: 'Touch sensor matrix recalibrated. Stylus pens replaced. Firmware up to date.' },
    { id: 'INS-006', assetId: 'AST-001', furniture: 'Ergonomic Mesh Task Chair', location: 'CS-102', condition: 'Good', inspector: 'Prof. Anitha Sharma', date: '2026-08-22', notes: 'Hydraulic lift inspected and lubricated. Lumbar support intact.' },
    { id: 'INS-007', assetId: 'AST-004', furniture: 'Magnetic Ceramic Whiteboard (8x4)', location: 'PH-201', condition: 'Fair', inspector: 'Prof. Dinesh Kumar', date: '2026-08-25', notes: 'Surface has minor ghosting marks. Cleaned with specialized whiteboard rejuvenator.' },
    { id: 'INS-008', assetId: 'AST-007', furniture: 'Heavy-Duty Steel Filing Cabinet', location: 'ADM-Hall', condition: 'Good', inspector: 'Dr. Rajesh Kumar', date: '2026-08-28', notes: 'Central locking mechanism tested. Drawers slide smoothly on heavy ball-bearing tracks.' },
    { id: 'INS-009', assetId: 'AST-014', furniture: 'Analytical Electronic Balance (0.1mg)', location: 'CH-301', condition: 'Good', inspector: 'Dr. Lalitha Devi', date: '2026-08-30', notes: 'Draft shield glass intact. Standard calibration weight test passed with zero drift.' },
    { id: 'INS-010', assetId: 'AST-002', furniture: 'Teak Wood Conference Table (12-Seater)', location: 'ADM-Hall', condition: 'Good', inspector: 'Dr. Rajesh Kumar', date: '2026-09-01', notes: 'Wood polish in excellent condition. Cable raceways cleared and cable grommets aligned.' },
    { id: 'INS-011', assetId: 'AST-008', furniture: 'Modular Modular Lab Workstation', location: 'CS-Lab1', condition: 'Good', inspector: 'Prof. Suresh Babu', date: '2026-09-02', notes: 'Under-desk cable trays inspected. Power sockets tested for earthing and ground safety.' },
    { id: 'INS-012', assetId: 'AST-015', furniture: 'Solid Oak Library Study Carrel', location: 'LIB-01', condition: 'Fair', inspector: 'Ms. Geeta Nair', date: '2026-09-03', notes: 'Minor surface scratches on laminate top. LED reading lamp working normally.' },
    { id: 'INS-013', assetId: 'AST-011', furniture: 'Fiberglass Server Rack Enclosure (42U)', location: 'CS-Lab1', condition: 'Good', inspector: 'Prof. Suresh Babu', date: '2026-09-04', notes: 'Exhaust fan cooling unit functional. Intake dust filters cleaned.' },
    { id: 'INS-014', assetId: 'AST-005', furniture: 'Split Air Conditioner (2.0 Ton Inverter)', location: 'ECE-Lab2', condition: 'Fair', inspector: 'Prof. Ramesh Nair', date: '2026-09-05', notes: 'Condenser coils washed. Gas pressure normal. Filter mesh cleaned.' },
    { id: 'INS-015', assetId: 'AST-013', furniture: 'Fume Hood Chemical Exhaust Cabinet', location: 'CH-301', condition: 'Good', inspector: 'Mr. Ravi Shankar', date: '2026-09-06', notes: 'Blower airflow velocity verified at 100 FPM. Sash counterweights inspected.' }
  ];
  localStorage.setItem('inspections_list', JSON.stringify(initial));
  return initial;
};

const inspectionsSlice = createSlice({
  name: 'inspections',
  initialState: { 
    list: getInitialInspections(),
    loading: false,
    error: null,
  },
  reducers: {
    setInspectionsList: (state, action) => {
      state.list = action.payload;
      localStorage.setItem('inspections_list', JSON.stringify(state.list));
    },
    addInspection: (state, action) => {
      const exists = state.list.some(i => i.id === action.payload.id);
      if (!exists) {
        state.list.unshift(action.payload);
        localStorage.setItem('inspections_list', JSON.stringify(state.list));
      }
    }
  }
});

export const { setInspectionsList, addInspection } = inspectionsSlice.actions;
export default inspectionsSlice.reducer;
