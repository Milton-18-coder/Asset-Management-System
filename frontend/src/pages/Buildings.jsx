import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Icon } from '../components/UIComponents';
import { api } from '../api';

export const Buildings = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list) || [];
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    floors: 3,
  });

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const data = await api.getBuildings();
      setBuildings(data);
    } catch (err) {
      console.error('Failed to load buildings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    try {
      await api.addBuilding(formData);
      setShowAdd(false);
      setFormData({ name: '', code: '', floors: 3 });
      await loadBuildings();
    } catch (err) {
      alert('Error adding building: ' + err.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div>
      <TopBar title="Buildings" subtitle="All campus buildings" user={currentUser} />
      <div className="flex justify-end mb-4">
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> Add Building</Btn>
      </div>
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading buildings...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buildings.map(b => {
            const bldgAssets = furnitureList.filter(f => f.building === b.name || f.building === b.code);
            const totalUnits = bldgAssets.reduce((sum, f) => sum + (f.quantity || 1), 0);

            return (
              <Card key={b.id} className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Icon.Building />
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded font-mono font-bold">{b.code}</span>
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-1 font-display">{b.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-semibold">{b.floors} floors</p>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2.5 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-200 font-display leading-none">{b.floors}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1.5">Floors</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2.5 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-mono leading-none">{totalUnits}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1.5">Assets Qty</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {showAdd && (
        <Modal title="Add Building Sector" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Building Name *"
              placeholder="e.g. Physics Block"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Sector Code *"
                placeholder="e.g. PHY"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
              <Input
                label="Number of Floors"
                type="number"
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value || '1', 10) })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn type="submit">Save Building</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default Buildings;
