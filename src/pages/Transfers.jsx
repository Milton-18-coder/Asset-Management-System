import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addTransfer, approveTransfer, rejectTransfer } from '../store/transfersSlice';
import { updateFurnitureLocation } from '../store/furnitureSlice';
import { addNotification } from '../store/notificationsSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Modal, Select, Input, Icon } from '../components/UIComponents';

export const Transfers = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const transfers = useSelector((state) => state.transfers.list);
  const furnitureList = useSelector((state) => state.furniture.list);

  const [showAdd, setShowAdd] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states
  const [selectedAssetId, setSelectedAssetId] = useState(furnitureList[0]?.id || '');
  const [fromRoom, setFromRoom] = useState(furnitureList[0]?.room || 'CS-101');
  const [toRoom, setToRoom] = useState('CS-102');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');

  if (!currentUser) return null;

  const handleAssetSelect = (assetText) => {
    const id = assetText.split(' — ')[0];
    setSelectedAssetId(id);
    const asset = furnitureList.find(f => f.id === id);
    if (asset) {
      setFromRoom(asset.room);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const asset = furnitureList.find(f => f.id === selectedAssetId);
    if (!asset) return;

    const newTransfer = {
      id: 'TRF-' + Math.floor(100 + Math.random() * 900),
      assetId: selectedAssetId,
      furniture: asset.name,
      source: fromRoom,
      destination: toRoom,
      requester: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
    };

    dispatch(addTransfer(newTransfer));
    dispatch(
      addNotification({
        title: 'New Transfer Requested',
        message: `${currentUser.name} requested transfer of ${asset.name} (${selectedAssetId}) from ${fromRoom} to ${toRoom}.`,
        type: 'transfer',
        link: '/transfers',
        department: asset.department,
      })
    );
    setSuccess(true);
  };

  const handleApprove = (id, assetId, destRoom) => {
    const asset = furnitureList.find(f => f.id === assetId);
    dispatch(approveTransfer(id));
    if (asset) {
      dispatch(updateFurnitureLocation({ id: assetId, room: destRoom, building: asset.building }));
      dispatch(
        addNotification({
          title: 'Transfer Approved',
          message: `Transfer ${id} approved. ${asset.name} moved to Room ${destRoom}.`,
          type: 'transfer',
          link: '/transfers',
          department: asset.department,
        })
      );
    }
  };

  const handleReject = (id) => {
    dispatch(rejectTransfer(id));
    dispatch(
      addNotification({
        title: 'Transfer Rejected',
        message: `Transfer request ${id} was rejected by ${currentUser.name}.`,
        type: 'transfer',
        link: '/transfers',
      })
    );
  };

  const pendingCount = transfers.filter(t => t.status === 'Pending').length;
  const approvedCount = transfers.filter(t => t.status === 'Approved').length;
  const completedCount = transfers.filter(t => t.status === 'Completed').length;
  const rejectedCount = transfers.filter(t => t.status === 'Rejected').length;

  return (
    <div>
      <TopBar title="Transfers" subtitle="Asset transfer management" user={currentUser} />

      <div className="flex justify-end mb-4">
        <Btn onClick={() => setShowAdd(true)}><Icon.Plus /> New Transfer</Btn>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending Requests', count: pendingCount, color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50' },
          { label: 'Approved Requests', count: approvedCount, color: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50' },
          { label: 'Completed Transfers', count: completedCount, color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50' },
          { label: 'Rejected Requests', count: rejectedCount, color: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-900/50' },
        ].map(s => (
          <Card key={s.label} className={`p-4 border ${s.color}`}>
            <p className="text-3xl font-extrabold font-display leading-none">{s.count}</p>
            <p className="text-xs font-semibold mt-2">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {['Transfer ID', 'Asset ID', 'Furniture', 'From', 'To', 'Requester', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">No transfers logged.</td>
                </tr>
              ) : (
                transfers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                    <td className="px-5 py-4 font-mono text-indigo-650 dark:text-indigo-400 font-bold">{t.id}</td>
                    <td className="px-5 py-4 font-mono text-slate-600 dark:text-slate-400">{t.assetId}</td>
                    <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{t.furniture}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-semibold">{t.source}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-semibold">{t.destination}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-semibold">{t.requester}</td>
                    <td className="px-5 py-4 text-slate-505 font-semibold">{t.date}</td>
                    <td className="px-5 py-4"><Badge label={t.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        {t.status === 'Pending' && currentUser.role === 'superadmin' ? (
                          <>
                            <button 
                              onClick={() => handleApprove(t.id, t.assetId, t.destination)}
                              className="px-2.5 py-1.5 text-[10px] bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleReject(t.id)}
                              className="px-2.5 py-1.5 text-[10px] bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455 rounded-lg border border-rose-100 dark:border-rose-900/50 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 font-medium">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && (
        <Modal title="Create Location Transfer Request" onClose={() => { setShowAdd(false); setSuccess(false); }}>
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/50">
                <Icon.Check />
              </div>
              <p className="font-bold text-slate-800 dark:text-white mb-2 font-display">Transfer Submitted</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Your request is logged and awaiting Super Admin approval.</p>
              <Btn onClick={() => { setShowAdd(false); setSuccess(false); }}>Close Dialog</Btn>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select 
                label="Select Asset *" 
                onChange={e => handleAssetSelect(e.target.value)}
                options={furnitureList.map(f => `${f.id} — ${f.name} (Room: ${f.room})`)} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Origin Room (Auto)" value={fromRoom} readOnly className="bg-slate-50 dark:bg-slate-800" />
                <Select 
                  label="Target Room *" 
                  value={toRoom}
                  onChange={e => setToRoom(e.target.value)}
                  options={['CS-101', 'CS-102', 'CS-Lab1', 'PH-201', 'CH-301', 'ME-101', 'ECE-Lab2', 'LIB-01', 'ADM-Hall', 'PH-202']} 
                />
              </div>
              <Input 
                label="Quantity to Transfer" 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
                min="1" 
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Reason for Transfer</label>
                <textarea 
                  rows={3} 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain why this asset needs to move..." 
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25" 
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
                <Btn type="submit">Submit Request</Btn>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
