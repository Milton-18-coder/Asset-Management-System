import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { TopBar } from '../components/TopBar';
import { Card, Btn, Modal, Input, Icon } from '../components/UIComponents';
import { VendorPurchaseHistoryModal } from '../components/VendorPurchaseHistoryModal';
import { Store, Star, Mail, Phone, MapPin, FileText, Plus, Search, Trash2, History, DollarSign, Package } from 'lucide-react';
import { api } from '../api';
import { initialVendors } from '../constants/initialVendors';

const STORAGE_KEY = 'asset_vendors_list';

const getInitialVendorsList = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const combined = [...parsed];
        for (const iv of initialVendors) {
          if (!combined.some(v => v.id === iv.id || v.name?.toLowerCase().trim() === iv.name?.toLowerCase().trim())) {
            combined.push(iv);
          }
        }
        return combined;
      }
    }
  } catch (e) {
    console.error('Error reading vendors cache:', e);
  }
  return initialVendors;
};

export const Vendors = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const purchaseList = useSelector((state) => state.purchaseHistory?.list || []);
  const [vendors, setVendors] = useState(getInitialVendorsList);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedVendorForHistory, setSelectedVendorForHistory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    rating: 4.5,
    services: '',
  });

  const loadVendors = async () => {
    try {
      const data = await api.getVendors();
      if (Array.isArray(data) && data.length > 0) {
        const combined = [...data];
        for (const iv of initialVendors) {
          if (!combined.some(v => v.id === iv.id || v.name?.toLowerCase().trim() === iv.name?.toLowerCase().trim())) {
            combined.push(iv);
          }
        }
        setVendors(combined);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
      } else {
        const fallback = getInitialVendorsList();
        setVendors(fallback);
      }
    } catch (err) {
      console.warn('API unavailable, using cached vendors:', err.message);
      const fallback = getInitialVendorsList();
      setVendors(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    const newVendor = {
      ...formData,
      id: `VND-${Date.now()}`
    };

    // Optimistically save to local state and localStorage
    const updated = [newVendor, ...vendors];
    setVendors(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setShowAdd(false);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      rating: 4.5,
      services: '',
    });

    try {
      await api.addVendor(formData);
    } catch (err) {
      console.warn('Backend addVendor sync failed:', err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    const updated = vendors.filter(v => v.id !== id);
    setVendors(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      await api.deleteVendor(id);
    } catch (err) {
      console.warn('Backend deleteVendor sync failed:', err.message);
    }
  };

  const filteredVendors = useMemo(() => {
    const allVendors = [...vendors];
    const existingNames = new Set(allVendors.map(v => v.name?.toLowerCase().trim()));

    // Automatically incorporate any vendor found in purchase history
    purchaseList.forEach(p => {
      if (p.vendorName && !existingNames.has(p.vendorName.toLowerCase().trim())) {
        existingNames.add(p.vendorName.toLowerCase().trim());
        allVendors.push({
          id: p.vendorId || `VND-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          name: p.vendorName,
          contactPerson: 'Institutional Representative',
          email: `contact@${p.vendorName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
          phone: '+91 (Institutional Partner)',
          address: 'Approved Institutional Hardware & Equipment Supplier',
          gstin: '33AAACT0000A1Z5',
          rating: 4.8,
          services: `${p.categoryName || 'Equipment'} Supplier`
        });
      }
    });

    return allVendors.map(v => {
      const vPurchases = purchaseList.filter(
        p => (v.id && p.vendorId === v.id) ||
             (p.vendorName && v.name && p.vendorName.trim().toLowerCase() === v.name.trim().toLowerCase())
      );
      const totalSpend = vPurchases.reduce((s, p) => s + Number(p.totalAmount || p.purchasePrice * (p.quantity || 1)), 0);
      const totalUnits = vPurchases.reduce((s, p) => s + Number(p.quantity || 1), 0);
      return {
        ...v,
        totalSpend,
        totalUnits,
        transactionCount: vPurchases.length
      };
    }).filter(v => {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
        (v.services && v.services.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q))
      );
    });
  }, [vendors, purchaseList, searchQuery]);

  if (!currentUser) return null;

  return (
    <div className="space-y-6 pb-12">
      <TopBar title="Vendors & Suppliers Directory" subtitle="Manage registered hardware suppliers, AMC partners, and procurement history" user={currentUser} />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendors by name, service, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <Btn onClick={() => setShowAdd(true)} className="w-full sm:w-auto">
          <Plus size={16} /> Add New Vendor
        </Btn>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading vendors...</div>
      ) : filteredVendors.length === 0 ? (
        <Card className="p-8 text-center text-slate-400">No vendors registered or matching search.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map(v => (
            <Card key={v.id} className="p-5 hover:shadow-md hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    <Store size={20} />
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 px-2 py-0.5 rounded-lg text-xs font-bold">
                    <Star size={12} className="fill-amber-400" />
                    <span>{parseFloat(v.rating || 4.5).toFixed(1)}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-slate-800 dark:text-white text-base mb-1 font-display">{v.name}</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{v.services || 'General Supplier'}</p>

                {/* Procurement Snapshot */}
                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-2.5 mb-3 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Spend</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                      ₹{v.totalSpend.toLocaleString()}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders</span>
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{v.transactionCount} batches</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {v.contactPerson && (
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Contact: {v.contactPerson}</p>
                  )}
                  {v.email && (
                    <p className="flex items-center gap-2 truncate">
                      <Mail size={13} className="text-slate-400 flex-shrink-0" />
                      <a href={`mailto:${v.email}`} className="hover:underline">{v.email}</a>
                    </p>
                  )}
                  {v.phone && (
                    <p className="flex items-center gap-2 truncate">
                      <Phone size={13} className="text-slate-400 flex-shrink-0" />
                      <span>{v.phone}</span>
                    </p>
                  )}
                  {v.address && (
                    <p className="flex items-center gap-2 truncate">
                      <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                      <span>{v.address}</span>
                    </p>
                  )}
                  {v.gstin && (
                    <p className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <FileText size={13} className="text-slate-400 flex-shrink-0" />
                      <span>GST: {v.gstin}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
                <Btn
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedVendorForHistory(v)}
                  className="!py-1.5 !px-3 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-1 justify-center"
                >
                  <History size={13} className="mr-1" /> View Purchase History
                </Btn>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                  title="Delete Vendor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Vendor Purchase History */}
      {selectedVendorForHistory && (
        <VendorPurchaseHistoryModal
          vendor={selectedVendorForHistory}
          vendorId={selectedVendorForHistory.id}
          vendorName={selectedVendorForHistory.name}
          onClose={() => setSelectedVendorForHistory(null)}
        />
      )}

      {showAdd && (
        <Modal title="Register New Vendor / Service Partner" onClose={() => setShowAdd(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Company / Vendor Name *"
              placeholder="e.g. Dell India Commercial Solutions"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Primary Contact Person"
                placeholder="e.g. Vikram Sharma"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
              <Input
                label="Rating (1.0 to 5.0)"
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value || '4.5') })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="contact@vendor.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <Input
              label="Services & Products Offered"
              placeholder="e.g. Smart Projectors, AMC, Networking Cables"
              value={formData.services}
              onChange={(e) => setFormData({ ...formData, services: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="GSTIN / Tax ID"
                placeholder="e.g. 29ABCDE1234F1Z5"
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              />
              <Input
                label="City / Address"
                placeholder="e.g. Tech Park, Chennai"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Btn variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancel</Btn>
              <Btn type="submit">Save Vendor</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default Vendors;
