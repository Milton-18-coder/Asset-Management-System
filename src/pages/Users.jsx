import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addUser, editUser, deleteUser } from '../store/usersSlice';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Badge, Modal, Input, Select, Icon } from '../components/UIComponents';

export const Users = () => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const usersList = useSelector((state) => state.users.list);

  const [showAdd, setShowAdd] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editSelection, setEditSelection] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Dept Admin');
  const [dept, setDept] = useState('Computer Science');
  const [status, setStatus] = useState('Active');

  if (!currentUser) return null;

  const handleOpenAdd = () => {
    setEditSelection(null);
    setName('');
    setUsername('');
    setEmail('');
    setRole('Dept Admin');
    setDept('Computer Science');
    setStatus('Active');
    setShowAdd(true);
    setSuccess(false);
  };

  const handleOpenEdit = (user) => {
    setEditSelection(user);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);
    setDept(user.department);
    setStatus(user.status);
    setShowAdd(true);
    setSuccess(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      id: editSelection ? editSelection.id : 'U0' + (usersList.length + 1),
      name,
      username,
      email,
      role,
      department: dept,
      status,
    };

    if (editSelection) {
      dispatch(editUser(payload));
    } else {
      dispatch(addUser(payload));
    }
    setSuccess(true);
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div>
      <TopBar title="Users" subtitle="Manage system users" user={currentUser} />
      <div className="flex justify-end mb-4">
        <Btn onClick={handleOpenAdd}><Icon.Plus /> Add User</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-805 text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold whitespace-nowrap">
                {['Name', 'Username', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {usersList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
                        {u.name.split(' ').map(p => p[0]).slice(0, 2).join('')}
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-slate-550 dark:text-slate-400 font-semibold">{u.username}</td>
                  <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-semibold">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition duration-300 ${
                      u.role === 'Super Admin' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50' 
                        : 'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900/50'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400 font-semibold">{u.department}</td>
                  <td className="px-5 py-4"><Badge label={u.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleOpenEdit(u)} className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"><Icon.Edit /></button>
                      <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"><Icon.Trash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showAdd && (
        <Modal title={editSelection ? "Edit System User" : "Create System User"} onClose={() => setShowAdd(false)}>
          {success ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-900/50">
                <Icon.Check />
              </div>
              <p className="font-bold text-slate-800 dark:text-white mb-2 font-display">User Logged</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">The user database entry has been saved successfully.</p>
              <Btn onClick={() => setShowAdd(false)}>Close Dialog</Btn>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name *" value={name} onChange={e => setName(e.target.value)} placeholder="Prof. John Doe" required />
                <Input label="Username *" value={username} onChange={e => setUsername(e.target.value)} placeholder="john.doe" required />
              </div>
              <Input label="Email Address *" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@nec.edu.in" required />
              <div className="grid grid-cols-2 gap-4">
                <Select label="System Role" value={role} onChange={e => setRole(e.target.value)} options={['Dept Admin', 'Super Admin']} />
                <Select label="Department" value={dept} onChange={e => setDept(e.target.value)} options={['Computer Science', 'Electronics & Communication', 'Mechanical Engineering', 'Physics', 'Chemistry', 'Administration', 'Mathematics', 'Civil Engineering']} />
              </div>
              <Select label="Account Status" value={status} onChange={e => setStatus(e.target.value)} options={['Active', 'Inactive']} />
              <div className="flex gap-3 justify-end pt-2">
                <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
                <Btn type="submit">{editSelection ? "Update User" : "Create User"}</Btn>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
