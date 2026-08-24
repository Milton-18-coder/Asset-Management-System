import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Icon } from '../components/UIComponents';

const departmentsData = [
  { id: 'D01', name: 'Computer Science', code: 'CSE', building: 'Engineering Block', hod: 'Prof. S. Krishnamurthy', rooms: 8, assets: 145, admin: 'Prof. Anitha Sharma' },
  { id: 'D02', name: 'Electronics & Communication', code: 'ECE', building: 'Engineering Block', hod: 'Dr. M. Venkatesh', rooms: 7, assets: 112, admin: 'Prof. Ramesh Nair' },
  { id: 'D03', name: 'Mechanical Engineering', code: 'ME', building: 'Engineering Block', hod: 'Dr. P. Subramaniam', rooms: 6, assets: 63, admin: 'Prof. Kavitha Raj' },
  { id: 'D04', name: 'Physics', code: 'PHY', building: 'Science Block', hod: 'Dr. Nalini Patel', rooms: 5, assets: 78, admin: 'Prof. Dinesh Kumar' },
  { id: 'D05', name: 'Chemistry', code: 'CHEM', building: 'Science Block', hod: 'Dr. Lalitha Devi', rooms: 5, assets: 132, admin: 'Prof. Suresh Iyer' },
  { id: 'D06', name: 'Administration', code: 'ADM', building: 'Admin Block', hod: 'Dr. Rajesh Kumar', rooms: 12, assets: 85, admin: 'Ms. Priya Mehta' },
  { id: 'D07', name: 'Mathematics', code: 'MATH', building: 'Science Block', hod: 'Dr. Karthik Rajan', rooms: 6, assets: 72, admin: 'Prof. Meena Sundaram' },
  { id: 'D08', name: 'Civil Engineering', code: 'CIVIL', building: 'IT Block', hod: 'Dr. Senthil Kumar', rooms: 8, assets: 98, admin: 'Prof. Aruna Devi' },
];

export const Departments = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const [showAdd, setShowAdd] = useState(false);

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
                {['Code', 'Department', 'Building Sector', 'HOD', 'Dept Admin', 'Rooms Count', 'Assets Qty'].map(h => (
                  <th key={h} className="px-5 py-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
              {departmentsData.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition">
                  <td className="px-5 py-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{d.code}</td>
                  <td className="px-5 py-4 font-bold text-slate-800 dark:text-slate-200">{d.name}</td>
                  <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-semibold">{d.building}</td>
                  <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-semibold">{d.hod}</td>
                  <td className="px-5 py-4 text-slate-550 dark:text-slate-400 font-semibold">{d.admin}</td>
                  <td className="px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-300">{d.rooms}</td>
                  <td className="px-5 py-4 text-center font-bold text-slate-700 dark:text-slate-300">{d.assets}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showAdd && (
        <Modal title="Add College Department" onClose={() => setShowAdd(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Department Name *" placeholder="e.g. Mathematics" />
              <Input label="Code *" placeholder="e.g. MATH" />
            </div>
            <Input label="Head of Department" placeholder="Prof. Name" />
            <Input label="Department Admin" placeholder="Prof. Name" />
            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn onClick={() => setShowAdd(false)}>Save Department</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
