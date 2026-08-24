import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Badge, Icon } from '../components/UIComponents';

const roomsData = [
  { id: 'R01', number: 'CS-101', building: 'Engineering Block', department: 'Computer Science', floor: 1, type: 'Classroom', capacity: 60, assetCount: 32 },
  { id: 'R02', number: 'CS-102', building: 'Engineering Block', department: 'Computer Science', floor: 1, type: 'Classroom', capacity: 60, assetCount: 28 },
  { id: 'R03', number: 'CS-Lab1', building: 'Engineering Block', department: 'Computer Science', floor: 2, type: 'Laboratory', capacity: 40, assetCount: 45 },
  { id: 'R04', number: 'PH-201', building: 'Science Block', department: 'Physics', floor: 2, type: 'Classroom', capacity: 50, assetCount: 22 },
  { id: 'R05', number: 'CH-301', building: 'Science Block', department: 'Chemistry', floor: 3, type: 'Laboratory', capacity: 30, assetCount: 38 },
  { id: 'R06', number: 'ME-101', building: 'Engineering Block', department: 'Mechanical', floor: 1, type: 'Classroom', capacity: 60, assetCount: 48 },
  { id: 'R07', number: 'ECE-Lab2', building: 'Engineering Block', department: 'ECE', floor: 3, type: 'Laboratory', capacity: 25, assetCount: 36 },
  { id: 'R08', number: 'LIB-01', building: 'Library', department: 'Administration', floor: 1, type: 'Reading Hall', capacity: 200, assetCount: 52 },
  { id: 'R09', number: 'ADM-Hall', building: 'Admin Block', department: 'Administration', floor: 1, type: 'Conference Room', capacity: 20, assetCount: 12 },
  { id: 'R10', number: 'PH-202', building: 'Science Block', department: 'Physics', floor: 2, type: 'Smart Classroom', capacity: 50, assetCount: 18 },
];

export const Rooms = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list);
  const [selected, setSelected] = useState(null);

  if (!currentUser) return null;

  const source = currentUser.role === 'superadmin' 
    ? roomsData 
    : roomsData.filter(r => r.department === currentUser.department);

  return (
    <div>
      <TopBar title="Rooms" subtitle={`${source.length} rooms`} user={currentUser} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {source.map(r => (
          <Card key={r.id} className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 cursor-pointer" onClick={() => setSelected(r)}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900 flex items-center justify-center text-indigo-650 dark:text-indigo-400"><Icon.Room /></div>
              <span className="text-xs bg-slate-100 dark:bg-slate-805 text-slate-600 dark:text-slate-400 rounded-lg px-2 py-0.5 font-bold">{r.type}</span>
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-0.5 font-display">{r.number}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-semibold">{r.department} · Floor {r.floor}</p>
            <div className="grid grid-cols-2 gap-2.5 text-center font-bold">
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-100/50 dark:border-slate-800/50">
                <p className="text-sm font-extrabold text-slate-850 dark:text-slate-200">{r.capacity}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mt-1">Capacity</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-100/50 dark:border-slate-800/50">
                <p className="text-sm font-extrabold text-slate-855 dark:text-slate-200">{r.assetCount}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mt-1">Assets Qty</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selected && (
        <Modal title={`Room Details - ${selected.number}`} onClose={() => setSelected(null)}>
          <div className="space-y-3.5 text-sm font-semibold">
            {[
              ['Room Number', selected.number],
              ['Building Block', selected.building],
              ['Department', selected.department],
              ['Floor Level', `Floor ${selected.floor}`],
              ['Space Type', selected.type],
              ['Max Capacity', `${selected.capacity} persons`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">{k}</span>
                <span className="text-slate-800 dark:text-slate-200">{v}</span>
              </div>
            ))}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Assets allocated in this room</p>
              <div className="space-y-2">
                {furnitureList.filter(f => f.room === selected.number).map(f => (
                  <div key={f.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-100/50 dark:border-slate-800/50 rounded-xl px-3.5 py-2.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{f.name}</span>
                    <span className="text-slate-400 font-bold">{f.quantity} units</span>
                    <Badge label={f.condition} type="condition" />
                  </div>
                ))}
                {furnitureList.filter(f => f.room === selected.number).length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">No assets currently assigned to this room.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
