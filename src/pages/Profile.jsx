import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileSuccess } from '../store/authSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Input, Icon } from '../components/UIComponents';

export const Profile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const [saved, setSaved] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || `${currentUser?.username || 'admin'}@nec.edu.in`);
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98401 23456');
  const [office, setOffice] = useState(currentUser?.office || 'ADM-101 (Admin Block)');
  const [bio, setBio] = useState(currentUser?.bio || 'Campus Asset & Inventory Administrator');

  if (!currentUser) return null;

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfileSuccess({ 
      name, 
      email, 
      phone, 
      office, 
      bio 
    }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <TopBar title="Profile" subtitle="Your account details" user={currentUser} />
      
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl p-3.5 mb-4 font-semibold">
          <Icon.Check /> Profile details updated successfully.
        </div>
      )}

      {pwSaved && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl p-3.5 mb-4 font-semibold">
          <Icon.Check /> Password changed successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white text-3xl font-extrabold flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20 font-display">
            {currentUser.avatar || 'AD'}
          </div>
          <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-1 font-display leading-none">{currentUser.name}</h2>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-3">
            {currentUser.designation || (currentUser.role === 'superadmin' ? 'Super Administrator' : 'Department Administrator')}
          </p>
          <Badge label="Active" />
          
          <div className="mt-6 w-full text-left space-y-3 text-xs font-semibold">
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
              <span className="text-slate-400 dark:text-slate-500">Department</span>
              <span className="text-slate-700 dark:text-slate-300">{currentUser.department}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
              <span className="text-slate-400 dark:text-slate-500">Employee ID</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">{currentUser.employeeId || 'EMP-2026-NEC'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
              <span className="text-slate-400 dark:text-slate-500">Office Room</span>
              <span className="text-slate-700 dark:text-slate-300">{currentUser.office || 'Main Block'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
              <span className="text-slate-400 dark:text-slate-500">Username</span>
              <span className="text-slate-700 dark:text-slate-300 font-mono">{currentUser.username}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400 dark:text-slate-500">Session Status</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active Online</span>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdate}>
            <Card className="p-5 space-y-4">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 font-display tracking-tight">Personal & Official Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Username" value={currentUser.username} readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-mono font-bold" />
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                <Input label="Department" value={currentUser.department} readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold" />
                <Input label="Office / Room" value={office} onChange={e => setOffice(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role & Responsibilities Bio</label>
                <textarea 
                  rows={2} 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25" 
                />
              </div>
              <div className="flex justify-end pt-2">
                <Btn type="submit">Save Changes</Btn>
              </div>
            </Card>
          </form>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 font-display tracking-tight">Change Password</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="••••••••" />
              <Input label="Confirm Password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex justify-end mt-4">
              <Btn onClick={() => { setPwSaved(true); setTimeout(() => setPwSaved(false), 2500); }}>Update Password</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

