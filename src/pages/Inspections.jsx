import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addInspection } from '../store/inspectionsSlice';
import { updateFurnitureCondition } from '../store/furnitureSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Modal, Select, Input, Icon } from '../components/UIComponents';

export const Inspections = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const inspections = useSelector((state) => state.inspections.list);
  const furnitureList = useSelector((state) => state.furniture.list);

  const [showAdd, setShowAdd] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [selectedAssetId, setSelectedAssetId] = useState(furnitureList[0]?.id || '');
  const [condition, setCondition] = useState('Good');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!currentUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const asset = furnitureList.find(f => f.id === selectedAssetId);
    if (!asset) return;

    const newInspection = {
      id: 'INS-' + Math.floor(100 + Math.random() * 900),
      assetId: selectedAssetId,
      furniture: asset.name,
      location: asset.room,
      condition: condition,
      inspector: currentUser.name,
      date: date,
      notes: notes,
    };

    dispatch(addInspection(newInspection));
    dispatch(updateFurnitureCondition({ id: selectedAssetId, condition }));
    setSuccess(true);
  };

  return (
    <div>
      <TopBar title="Inspections" subtitle="Asset inspection audits" user={currentUser} />

      <div className="flex justify-end mb-4">
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> New Inspection</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {['Inspection ID', 'Asset ID', 'Furniture', 'Location Room', 'Inspector', 'Log Date', 'Condition State', 'Notes / Remarks'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {inspections.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 dark:text-slate-505 font-medium">No inspection logs found.</td>
                </tr>
              ) : (
                inspections.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td className="px-5 py-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{i.id}</td>
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">{i.assetId}</td>
                    <td className="px-5 py-4 font-bold text-slate-850 dark:text-slate-200">{i.furniture}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-semibold">{i.location}</td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300 font-bold">{i.inspector}</td>
                    <td className="px-5 py-4 text-slate-500 font-semibold">{i.date}</td>
                    <td className="px-5 py-4"><Badge label={i.condition} type="condition" /></td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium max-w-xs truncate" title={i.notes}>{i.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <Modal title="Log Asset Condition Inspection" onClose={() => { setShowAdd(false); setSuccess(false); }}>
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/50">
                <Icon.Check />
              </div>
              <p className="font-bold text-slate-800 dark:text-white mb-2 font-display">Inspection Saved</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">The asset condition audit report has been logged successfully.</p>
              <Btn onClick={() => { setShowAdd(false); setSuccess(false); }}>Close Dialog</Btn>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select 
                label="Select Asset to Inspect *" 
                onChange={e => setSelectedAssetId(e.target.value.split(' — ')[0])}
                options={furnitureList.map(f => `${f.id} — ${f.name} (Room: ${f.room})`)} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Condition *" 
                  value={condition}
                  onChange={e => setCondition(e.target.value)}
                  options={['Good', 'Fair', 'Poor', 'Damaged']} 
                />
                <Input 
                  label="Inspection Date *" 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <Input label="Inspector (Auto)" value={currentUser.name} readOnly className="bg-slate-50 dark:bg-slate-800" />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Inspector Remarks / Audit Notes</label>
                <textarea 
                  rows={3} 
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe issues, damages, or adjustments needed..." 
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25" 
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
                <Btn type="submit">Log Inspection</Btn>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
