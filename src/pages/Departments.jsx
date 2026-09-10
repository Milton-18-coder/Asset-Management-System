import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Icon } from '../components/UIComponents';
import { api } from '../api';

export const Departments = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list) || [];
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    building: '',
    hod: '',
    admin: '',
  });

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await api.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    try {
      await api.addDepartment(formData);
      setShowAdd(false);
      setFormData({ name: '', code: '', building: '', hod: '', admin: '' });
      await loadDepartments();
    } catch (err) {
      alert('Error adding department: ' + err.message);
    }
  };

  if (!currentUser) return null;

  return (
    <div>
      <TopBar title="Departments" subtitle="All college departments" user={currentUser} />
      <div className="flex justify-end mb-4">
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> Add Department</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {['Code', 'Department', 'Building Sector', 'HOD', 'Dept Admin', 'Assets Qty'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">Loading departments...</td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">No departments found.</td>
                </tr>
              ) : (
                departments.map(d => {
                  const deptAssets = furnitureList.filter(f => f.department === d.name || f.department === d.code);
                  const totalUnits = deptAssets.reduce((sum, f) => sum + (f.quantity || 1), 0);

                  return (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                      <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{d.code}</td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{d.name}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{d.building || 'Main Campus'}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{d.hod || '—'}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{d.admin || '—'}</td>
                      <td className="px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">{totalUnits}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {showAdd && (
        <Modal title="Add College Department" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department Name *"
                placeholder="e.g. Mathematics"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Code *"
                placeholder="e.g. MATH"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                required
              />
            </div>
            <Input
              label="Building Sector"
              placeholder="e.g. Science Block"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            />
            <Input
              label="Head of Department"
              placeholder="Prof. Name"
              value={formData.hod}
              onChange={(e) => setFormData({ ...formData, hod: e.target.value })}
            />
            <Input
              label="Department Admin"
              placeholder="Prof. Name"
              value={formData.admin}
              onChange={(e) => setFormData({ ...formData, admin: e.target.value })}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn type="submit">Save Department</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default Departments;
