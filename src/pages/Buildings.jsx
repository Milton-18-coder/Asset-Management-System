import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Icon } from '../components/UIComponents';

const buildingsData = [
  { id: 'B01', name: 'Engineering Block', code: 'ENG', floors: 4, departments: 3, rooms: 60, assets: 900 },
  { id: 'B02', name: 'Science Block', code: 'SCI', floors: 3, departments: 2, rooms: 45, assets: 650 },
  { id: 'B03', name: 'Admin Block', code: 'ADM', floors: 2, departments: 1, rooms: 25, assets: 300 },
  { id: 'B04', name: 'Library', code: 'LIB', floors: 3, departments: 1, rooms: 30, assets: 500 },
  { id: 'B05', name: 'IT Block', code: 'ITB', floors: 4, departments: 1, rooms: 50, assets: 550 },
  { id: 'B06', name: 'Management Block', code: 'MBA', floors: 3, departments: 1, rooms: 35, assets: 450 },
  { id: 'B07', name: 'Humanities Block', code: 'HUM', floors: 3, departments: 1, rooms: 40, assets: 350 },
  { id: 'B08', name: 'Sports & Arts Block', code: 'SAB', floors: 2, departments: 0, rooms: 35, assets: 300 },
];

export const Buildings = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const [showAdd, setShowAdd] = useState(false);
  const [buildings, setBuildings] = useState(buildingsData);

  if (!currentUser) return null;

  return (
    <div>
      <TopBar title="Buildings" subtitle="All campus buildings" user={currentUser} />
      <div className="flex justify-end mb-4">
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> Add Building</Btn>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buildings.map(b => (
          <Card key={b.id} className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-650 dark:text-indigo-400"><Icon.Building /></div>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded font-mono font-bold">{b.code}</span>
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1 font-display">{b.name}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-semibold">{b.floors} floors</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[['Departments', b.departments], ['Rooms', b.rooms], ['Assets', b.assets]].map(([l, v]) => (
                <div key={l} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2.5 border border-slate-100/50 dark:border-slate-800/50">
                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 font-display leading-none">{v}</p>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1.5">{l}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {showAdd && (
        <Modal title="Add Building Sector" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <Input label="Building Name *" placeholder="e.g. Physics Block" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Sector Code *" placeholder="e.g. PHY" />
              <Input label="Number of Floors" type="number" defaultValue="3" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={() => setShowAdd(false)}>Save Building</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
