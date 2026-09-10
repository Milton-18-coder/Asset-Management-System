import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Badge, Input, Icon } from '../components/UIComponents';
import { User, ArrowUpRight } from 'lucide-react';
import { api } from '../api';

export const Rooms = () => {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const furnitureList = useSelector((state) => state.furniture.list) || [];
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    building: 'Engineering Block',
    department: 'Computer Science & Engineering',
    floor: 1,
    type: 'Smart Classroom',
    capacity: 40,
  });

  const loadRooms = async () => {
    try {
      setLoading(true);
      const data = await api.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.number) return;
    try {
      await api.addRoom(formData);
      setShowAdd(false);
      setFormData({
        number: '',
        building: 'Engineering Block',
        department: currentUser?.department || 'Computer Science & Engineering',
        floor: 1,
        type: 'Smart Classroom',
        capacity: 40,
      });
      await loadRooms();
    } catch (err) {
      alert('Error adding room: ' + err.message);
    }
  };

  if (!currentUser) return null;

  const source = currentUser.role === 'superadmin' 
    ? rooms 
    : rooms.filter(r => r.department === currentUser.department);

  return (
    <div className="space-y-6 pb-12">
      <TopBar title="Campus Rooms & Space Inventory" subtitle={`${source.length} rooms tracked`} user={currentUser} />

      <div className="flex justify-end">
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> Add Room</Btn>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading rooms...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {source.map(r => {
            const roomAssets = furnitureList.filter(f => f.room === r.number);
            const totalUnits = roomAssets.reduce((s, f) => s + (f.quantity || 1), 0);
            const custodians = Array.from(new Set(roomAssets.map(f => f.assignedTo).filter(Boolean)));

            return (
              <Card key={r.id} className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 cursor-pointer" onClick={() => setSelected(r)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Icon.Room />
                  </div>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg px-2 py-0.5 font-bold">
                    {r.type}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-0.5 font-display">{r.number}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-semibold">{r.department} · {r.building}</p>
                
                <div className="grid grid-cols-2 gap-2.5 text-center font-bold mb-3">
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{r.capacity}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mt-0.5">Capacity</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2 border border-slate-100/50 dark:border-slate-800/50">
                    <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">{totalUnits}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase mt-0.5">Assets Qty</p>
                  </div>
                </div>

                {custodians.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <User className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                    <span className="truncate font-medium">{custodians.join(', ')}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Add New Campus Room / Hall" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Room Identifier *"
                placeholder="e.g. CS-105"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                required
              />
              <Input
                label="Building Name"
                placeholder="e.g. Engineering Block"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Department"
                placeholder="e.g. Computer Science"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <Input
                label="Room Type"
                placeholder="e.g. Smart Classroom, Lab"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Floor Number"
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value || '1', 10) })}
              />
              <Input
                label="Seating Capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value || '30', 10) })}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn type="submit">Save Room</Btn>
            </div>
          </form>
        </Modal>
      )}

      {selected && (
        <Modal title={`Room Details & Asset Custody — ${selected.number}`} onClose={() => setSelected(null)}>
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 font-medium">Building:</span>
                <p className="font-bold text-slate-800 dark:text-white">{selected.building}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Department:</span>
                <p className="font-bold text-slate-800 dark:text-white">{selected.department}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Space Type:</span>
                <p className="font-bold text-slate-800 dark:text-white">{selected.type}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Capacity:</span>
                <p className="font-bold text-slate-800 dark:text-white">{selected.capacity} persons</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-800 dark:text-white font-display text-sm">
                  Assets Allocated in Room {selected.number}
                </p>
                <button
                  onClick={() => {
                    setSelected(null);
                    navigate(`/category`);
                  }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Locate all →
                </button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {furnitureList.filter(f => f.room === selected.number).map(f => (
                  <div key={f.id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{f.name}</span>
                          <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">({f.id})</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {f.category} · {f.itemType || 'General'}
                        </p>
                        {f.assignedTo && (
                          <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1 truncate">
                            <User className="w-3 h-3 flex-shrink-0" /> Using: {f.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{f.quantity || 1} units</span>
                      <Badge label={f.condition} type="condition" />
                      <button
                        onClick={() => {
                          setSelected(null);
                          navigate(`/assets/${f.id}`);
                        }}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {furnitureList.filter(f => f.room === selected.number).length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
                    No assets currently assigned to this room.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
export default Rooms;
