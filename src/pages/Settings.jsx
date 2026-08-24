import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Input, Icon } from '../components/UIComponents';

export const Settings = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const [saved, setSaved] = useState(false);

  if (!currentUser) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <TopBar title="Settings" subtitle="System configuration" user={currentUser} />
      
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl p-3.5 mb-4 font-semibold">
          <Icon.Check /> Settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <p className="text-sm font-bold text-slate-750 dark:text-slate-200 mb-4 font-display tracking-tight">College Information</p>
          <div className="space-y-4">
            <Input label="College Name" defaultValue="National Engineering College" />
            <Input label="College Code" defaultValue="NEC" />
            <Input label="Address" defaultValue="Kovilpatti, Thoothukudi, Tamil Nadu 628503" />
            <Input label="Contact Email" defaultValue="admin@nec.edu.in" />
            <Input label="Phone" defaultValue="+91 4632 220 999" />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-sm font-bold text-slate-755 dark:text-slate-250 mb-4 font-display tracking-tight">Asset Categories List</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Desk', 'Chair', 'Table', 'Board', 'Electronics', 'Storage', 'Equipment'].map(c => (
                <div key={c} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 text-xs rounded-xl px-3 py-1.5 font-semibold">
                  {c} 
                  <button className="text-slate-400 hover:text-rose-500 ml-1 cursor-pointer font-bold">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="New category name" />
              <Btn size="sm">Add</Btn>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-755 dark:text-slate-250 mb-4 font-display tracking-tight">Condition Level Badges</p>
            <div className="space-y-3 font-semibold">
              {['Good', 'Fair', 'Poor', 'Damaged'].map(c => (
                <div key={c} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <Badge label={c} type="condition" />
                  <button className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg text-xs cursor-pointer"><Icon.Edit /></button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Btn onClick={handleSave}>Save Settings</Btn>
      </div>
    </div>
  );
};
