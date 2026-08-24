import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileSuccess } from '../store/authSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Input, Icon } from '../components/UIComponents';

export const Profile = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(`${currentUser?.username || 'admin'}@nec.edu.in`);
  const [phone, setPhone] = useState('+91 98765 43210');

  if (!currentUser) return null;

  const handleUpdate = (e) => {
    e.preventDefault();
    dispatch(updateProfileSuccess({ name }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <TopBar title="Profile" subtitle="Your account details" user={currentUser} />
      
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm rounded-xl p-3.5 mb-4 font-semibold">
          <Icon.Check /> Profile updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 text-center flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white text-3xl font-extrabold flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20 font-display">
            {currentUser.avatar}
          </div>
          <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-1 font-display leading-none">{currentUser.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 capitalize font-semibold">
            {currentUser.role === 'superadmin' ? 'Super Administrator' : 'Department Administrator'}
          </p>
          <Badge label="Active" />
          <div className="mt-6 w-full text-left space-y-3 text-xs font-semibold">
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
              <span className="text-slate-400 dark:text-slate-505">Department</span>
              <span className="text-slate-700 dark:text-slate-350">{currentUser.department}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
              <span className="text-slate-400 dark:text-slate-505">Username</span>
              <span className="text-slate-700 dark:text-slate-350 font-mono">{currentUser.username}</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-slate-400 dark:text-slate-505">Last Session Login</span>
              <span className="text-slate-700 dark:text-slate-350">Today, 09:14 AM</span>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdate}>
            <Card className="p-5 space-y-4">
              <p className="text-sm font-bold text-slate-755 dark:text-slate-250 font-display tracking-tight">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input label="Username" value={currentUser.username} readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-450 font-mono font-bold" />
                <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} />
                <Input label="Department" value={currentUser.department} readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-450 font-bold" />
                <Input label="Employee ID" value="EMP-2026-NEC" readOnly className="bg-slate-50 dark:bg-slate-800 text-slate-450 font-mono font-bold" />
              </div>
              <div className="flex justify-end pt-2">
                <Btn type="submit">Save Changes</Btn>
              </div>
            </Card>
          </form>

          <Card className="p-5">
            <p className="text-sm font-bold text-slate-755 dark:text-slate-250 mb-4 font-display tracking-tight">Change Password</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Current Password" type="password" placeholder="••••••••" />
              <Input label="New Password" type="password" placeholder="••••••••" />
              <Input label="Confirm Password" type="password" placeholder="••••••••" />
            </div>
            <div className="flex justify-end mt-4">
              <Btn onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}>Update Password</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
