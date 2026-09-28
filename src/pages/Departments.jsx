import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Select, Badge, Icon } from '../components/UIComponents';
import { setFurnitureList } from '../store/furnitureSlice';
import { api } from '../api';
import { ALLOWED_DEPARTMENTS, mapLegacyDepartment } from '../constants/departments';
import { User, ArrowUpRight, Building2, MapPin, Layers, IndianRupee } from 'lucide-react';

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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list) || [];
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Computer Science',
    code: 'CS',
    building: 'Engineering Block',
    hod: '',
    admin: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch both departments and assets to ensure fresh state
      const [deptData, assetData, roomData] = await Promise.all([
        api.getDepartments().catch(() => []),
        api.getAssets().catch(() => []),
        api.getRooms().catch(() => []),
      ]);

      if (assetData && assetData.length > 0) {
        dispatch(setFurnitureList(assetData));
      }

      if (roomData && roomData.length > 0) {
        setRooms(roomData);
      }

      const valid = (deptData || []).filter(d => ALLOWED_DEPARTMENTS.includes(d.name));
      if (valid.length === ALLOWED_DEPARTMENTS.length) {
        setDepartments(valid);
      } else {
        const merged = CANONICAL_DEPARTMENTS.map(cd => {
          const found = (deptData || []).find(d => d.name === cd.name);
          return found || cd;
        });
        setDepartments(merged);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      setDepartments(CANONICAL_DEPARTMENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    try {
      await api.addDepartment(formData);
      setShowAdd(false);
      setFormData({ name: 'Computer Science', code: 'CS', building: 'Engineering Block', hod: '', admin: '' });
      await loadData();
    } catch (err) {
      alert('Error adding department: ' + err.message);
    }
  };

  // Selected department assets & rooms
  const selectedDeptDetails = useMemo(() => {
    if (!selectedDept) return null;
    const mappedTarget = mapLegacyDepartment(selectedDept.name);
    
    const assets = furnitureList.filter(f => {
      if (!f.department) return false;
      return mapLegacyDepartment(f.department) === mappedTarget || f.department === selectedDept.name;
    });

    const deptRooms = rooms.filter(r => {
      if (!r.department) return false;
      return mapLegacyDepartment(r.department) === mappedTarget || r.department === selectedDept.name;
    });

    const totalUnits = assets.reduce((s, f) => s + (f.quantity || 1), 0);
    const totalCost = assets.reduce((s, f) => s + ((f.cost || 0) * (f.quantity || 1)), 0);
    const custodians = Array.from(new Set(assets.map(f => f.assignedTo).filter(Boolean)));

    return {
      assets,
      deptRooms,
      totalUnits,
      totalCost,
      custodians,
    };
  }, [selectedDept, furnitureList, rooms]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-12">
      <TopBar 
        title="College Departments & Academic Blocks" 
        subtitle="Click any department to view full asset allocation, rooms, and custody records" 
        user={currentUser} 
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing all <span className="font-bold text-slate-900 dark:text-white font-mono">{departments.length}</span> recognized institutional departments & blocks
        </p>
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> Add Department</Btn>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {['Code', 'Department / Block', 'Building Sector', 'HOD', 'Dept Admin', 'Assets Qty', 'Action'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">Loading departments & live assets...</td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">No departments found.</td>
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
                    <tr 
                      key={d.id} 
                      onClick={() => setSelectedDept(d)}
                      className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition cursor-pointer group"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{d.code}</td>
                      <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {d.name}
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{d.building || 'Main Campus'}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{d.hod || '—'}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-semibold">{d.admin || '—'}</td>
                      <td className="px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-300 font-mono">
                        <span className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                          {totalUnits} units
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline inline-flex items-center gap-1">
                          View Details <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* DEPARTMENT DETAILS MODAL */}
      {selectedDept && selectedDeptDetails && (
        <Modal 
          title={`${selectedDept.name} (${selectedDept.code}) — Department Details`} 
          onClose={() => setSelectedDept(null)}
          resizable={true}
          defaultSize="max-w-2xl"
        >
          <div className="flex flex-col h-full min-h-0 space-y-4 text-xs">
            {/* Header info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Building Sector</span>
                <p className="font-extrabold text-slate-800 dark:text-white mt-0.5 text-xs truncate">{selectedDept.building || 'Campus Block'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Head of Dept (HOD)</span>
                <p className="font-extrabold text-slate-800 dark:text-white mt-0.5 text-xs truncate">{selectedDept.hod || 'Dr. Department Head'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Department Admin</span>
                <p className="font-extrabold text-slate-800 dark:text-white mt-0.5 text-xs truncate">{selectedDept.admin || 'Prof. Admin Officer'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Quantity</span>
                <p className="font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 text-xs font-mono">{selectedDeptDetails.totalUnits} units</p>
              </div>
            </div>

            {/* Metrics summary */}
            <div className="grid grid-cols-3 gap-3 text-center flex-shrink-0">
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-2.5">
                <p className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {selectedDeptDetails.assets.length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">Unique Asset Types</p>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-2.5">
                <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  ₹{selectedDeptDetails.totalCost.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">Total Value (INR)</p>
              </div>
              <div className="bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/50 rounded-xl p-2.5">
                <p className="text-base font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                  {selectedDeptDetails.deptRooms.length}
                </p>
                <p className="text-[10px] uppercase font-semibold text-slate-500 mt-0.5">Allocated Rooms / Labs</p>
              </div>
            </div>

            {/* Allocated Assets List (Flex-1 stretches with box height) */}
            <div className="flex-1 min-h-0 flex flex-col pt-1">
              <div className="flex items-center justify-between mb-2 flex-shrink-0">
                <p className="font-bold text-slate-800 dark:text-white font-display text-sm flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Allocated Assets ({selectedDeptDetails.assets.length} items recorded)
                </p>
                <button
                  onClick={() => {
                    setSelectedDept(null);
                    navigate('/assets');
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                >
                  View All in Assets Table →
                </button>
              </div>

              <div className="space-y-2 flex-1 min-h-[180px] overflow-y-auto pr-1">
                {selectedDeptDetails.assets.map(f => (
                  <div 
                    key={f.id} 
                    className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{f.name}</span>
                          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">({f.id})</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {f.category} · {f.itemType || 'General'} · Room: <span className="font-semibold text-slate-700 dark:text-slate-300">{f.room || 'General'}</span>
                        </p>
                        {f.assignedTo && (
                          <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 truncate">
                            <User className="w-3 h-3 flex-shrink-0" /> Custodian: {f.assignedTo} ({f.assignedRole || 'Staff'})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 flex-shrink-0 ml-2">
                      <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{f.quantity || 1} units</span>
                      <Badge label={f.condition || 'Good'} type="condition" />
                      <button
                        onClick={() => {
                          setSelectedDept(null);
                          navigate(`/assets/${f.id}`);
                        }}
                        className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer"
                        title="View Asset Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedDeptDetails.assets.length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">
                    No assets currently allocated to {selectedDept.name}.
                  </p>
                )}
              </div>
            </div>

            {/* Department Rooms / Labs */}
            {selectedDeptDetails.deptRooms.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
                <p className="font-bold text-slate-800 dark:text-white font-display text-xs mb-2 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Department Laboratories & Space ({selectedDeptDetails.deptRooms.length} rooms)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDeptDetails.deptRooms.map(r => (
                    <div key={r.id || r.number} className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{r.number}</p>
                        <p className="text-[10px] text-slate-400">{r.type} · Floor {r.floor}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                        Cap: {r.capacity || 30}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ADD DEPARTMENT MODAL */}
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
