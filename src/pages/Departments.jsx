import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Select, Icon } from '../components/UIComponents';
import { api } from '../api';
import { ALLOWED_DEPARTMENTS, mapLegacyDepartment } from '../constants/departments';

export const CANONICAL_DEPARTMENTS = [
  { id: 'D01', name: 'Computer Science', code: 'CS', building: 'Engineering Block', hod: 'Prof. S. Krishnamurthy', admin: 'Prof. Anitha Sharma' },
  { id: 'D02', name: 'Mechanical', code: 'MECH', building: 'Engineering Block', hod: 'Dr. P. Subramaniam', admin: 'Prof. Kavitha Raj' },
  { id: 'D03', name: 'Civil', code: 'CIVIL', building: 'Engineering Block', hod: 'Dr. Senthil Kumar', admin: 'Prof. Aruna Devi' },
  { id: 'D04', name: 'IT', code: 'IT', building: 'IT Block', hod: 'Dr. M. Venkatesh', admin: 'Prof. R. Revathi' },
  { id: 'D05', name: 'AIDS', code: 'AIDS', building: 'IT Block', hod: 'Dr. Nalini Patel', admin: 'Prof. K. Swaminathan' },
  { id: 'D06', name: 'ECE', code: 'ECE', building: 'Engineering Block', hod: 'Dr. S. Sundararajan', admin: 'Prof. Ramesh Nair' },
  { id: 'D07', name: 'EEE', code: 'EEE', building: 'Engineering Block', hod: 'Dr. R. Vijay Anand', admin: 'Prof. G. Murugan' },
  { id: 'D08', name: 'Science & Humanities', code: 'S&H', building: 'Science Block', hod: 'Dr. Lalitha Devi', admin: 'Prof. Dinesh Kumar' },
  { id: 'D09', name: 'Admin Block', code: 'ADM', building: 'Admin Block', hod: 'Dr. Rajesh Kumar', admin: 'Ms. Priya Mehta' },
];

export const Departments = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list) || [];
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Computer Science',
    code: 'CS',
    building: 'Engineering Block',
    hod: '',
    admin: '',
  });

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await api.getDepartments();
      const valid = (data || []).filter(d => ALLOWED_DEPARTMENTS.includes(d.name));
      if (valid.length === ALLOWED_DEPARTMENTS.length) {
        setDepartments(valid);
      } else {
        const merged = CANONICAL_DEPARTMENTS.map(cd => {
          const found = (data || []).find(d => d.name === cd.name);
          return found || cd;
        });
        setDepartments(merged);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
      setDepartments(CANONICAL_DEPARTMENTS);
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
      setFormData({ name: 'Computer Science', code: 'CS', building: 'Engineering Block', hod: '', admin: '' });
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
                  const deptAssets = furnitureList.filter(f => {
                    if (!f.department) return false;
                    const fDept = mapLegacyDepartment(f.department);
                    const dName = mapLegacyDepartment(d.name) || d.name;
                    return fDept === dName || f.department === d.name;
                  });
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
              <Select
                label="Department Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                options={ALLOWED_DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
                required
              />
              <Input
                label="Code *"
                placeholder="e.g. CS"
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
