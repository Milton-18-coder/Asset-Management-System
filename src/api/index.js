const API_BASE = '/api';

export const api = {
  // Assets
  async getAssets() {
    const res = await fetch(`${API_BASE}/assets`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    return res.json();
  },
  async getAssetById(id) {
    const res = await fetch(`${API_BASE}/assets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch asset');
    return res.json();
  },
  async addAsset(asset) {
    const res = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    if (!res.ok) throw new Error('Failed to add asset');
    return res.json();
  },
  async updateAsset(id, asset) {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    if (!res.ok) throw new Error('Failed to update asset');
    return res.json();
  },
  async deleteAsset(id) {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete asset');
    return res.json();
  },
  async updateAssetLocation(id, locationData) {
    const res = await fetch(`${API_BASE}/assets/${id}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData),
    });
    if (!res.ok) throw new Error('Failed to update asset location');
    return res.json();
  },
  async updateAssetCustodian(id, custodianData) {
    const res = await fetch(`${API_BASE}/assets/${id}/custodian`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(custodianData),
    });
    if (!res.ok) throw new Error('Failed to update asset custodian');
    return res.json();
  },
  async updateAssetCondition(id, condition) {
    const res = await fetch(`${API_BASE}/assets/${id}/condition`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition }),
    });
    if (!res.ok) throw new Error('Failed to update asset condition');
    return res.json();
  },
  async bulkAssignCustodians(bulkData) {
    const res = await fetch(`${API_BASE}/assets/bulk-assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bulkData),
    });
    if (!res.ok) throw new Error('Failed to bulk assign');
    return res.json();
  },

  // Transfers
  async getTransfers() {
    const res = await fetch(`${API_BASE}/transfers`);
    if (!res.ok) throw new Error('Failed to fetch transfers');
    return res.json();
  },
  async addTransfer(transfer) {
    const res = await fetch(`${API_BASE}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transfer),
    });
    if (!res.ok) throw new Error('Failed to add transfer');
    return res.json();
  },
  async updateTransferStatus(id, status) {
    const res = await fetch(`${API_BASE}/transfers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update transfer status');
    return res.json();
  },

  // Inspections
  async getInspections() {
    const res = await fetch(`${API_BASE}/inspections`);
    if (!res.ok) throw new Error('Failed to fetch inspections');
    return res.json();
  },
  async addInspection(inspection) {
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inspection),
    });
    if (!res.ok) throw new Error('Failed to add inspection');
    return res.json();
  },

  // Users
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },
  async addUser(user) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to add user');
    return res.json();
  },
  async updateUser(id, user) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },
  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },
  async addNotification(notif) {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notif),
    });
    if (!res.ok) throw new Error('Failed to add notification');
    return res.json();
  },
  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },
  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to mark all read');
    return res.json();
  },

  // Departments
  async getDepartments() {
    const res = await fetch(`${API_BASE}/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return res.json();
  },
  async addDepartment(dept) {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept),
    });
    if (!res.ok) throw new Error('Failed to add department');
    return res.json();
  },
  async updateDepartment(id, dept) {
    const res = await fetch(`${API_BASE}/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dept),
    });
    if (!res.ok) throw new Error('Failed to update department');
    return res.json();
  },
  async deleteDepartment(id) {
    const res = await fetch(`${API_BASE}/departments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete department');
    return res.json();
  },

  // Buildings
  async getBuildings() {
    const res = await fetch(`${API_BASE}/buildings`);
    if (!res.ok) throw new Error('Failed to fetch buildings');
    return res.json();
  },
  async addBuilding(bldg) {
    const res = await fetch(`${API_BASE}/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bldg),
    });
    if (!res.ok) throw new Error('Failed to add building');
    return res.json();
  },
  async updateBuilding(id, bldg) {
    const res = await fetch(`${API_BASE}/buildings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bldg),
    });
    if (!res.ok) throw new Error('Failed to update building');
    return res.json();
  },
  async deleteBuilding(id) {
    const res = await fetch(`${API_BASE}/buildings/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete building');
    return res.json();
  },

  // Rooms
  async getRooms(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/rooms${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch rooms');
    return res.json();
  },
  async addRoom(room) {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    if (!res.ok) throw new Error('Failed to add room');
    return res.json();
  },
  async updateRoom(id, room) {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room),
    });
    if (!res.ok) throw new Error('Failed to update room');
    return res.json();
  },
  async deleteRoom(id) {
    const res = await fetch(`${API_BASE}/rooms/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete room');
    return res.json();
  },

  // Maintenance
  async getMaintenanceLogs() {
    const res = await fetch(`${API_BASE}/maintenance`);
    if (!res.ok) throw new Error('Failed to fetch maintenance logs');
    return res.json();
  },
  async addMaintenanceLog(log) {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (!res.ok) throw new Error('Failed to add maintenance log');
    return res.json();
  },
  async updateMaintenanceStatus(id, statusData) {
    const res = await fetch(`${API_BASE}/maintenance/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData),
    });
    if (!res.ok) throw new Error('Failed to update maintenance status');
    return res.json();
  },
  async deleteMaintenanceLog(id) {
    const res = await fetch(`${API_BASE}/maintenance/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete maintenance log');
    return res.json();
  },

  // Disposals
  async getDisposals() {
    const res = await fetch(`${API_BASE}/disposals`);
    if (!res.ok) throw new Error('Failed to fetch disposals');
    return res.json();
  },
  async addDisposal(disp) {
    const res = await fetch(`${API_BASE}/disposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(disp),
    });
    if (!res.ok) throw new Error('Failed to add disposal');
    return res.json();
  },

  // Vendors
  async getVendors() {
    const res = await fetch(`${API_BASE}/vendors`);
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },
  async addVendor(vendor) {
    const res = await fetch(`${API_BASE}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to add vendor');
    return res.json();
  },
  async updateVendor(id, vendor) {
    const res = await fetch(`${API_BASE}/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },
  async deleteVendor(id) {
    const res = await fetch(`${API_BASE}/vendors/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete vendor');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(limit = 100) {
    const res = await fetch(`${API_BASE}/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },
  async addAuditLog(log) {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    if (!res.ok) throw new Error('Failed to log audit record');
    return res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },
  async addCategory(cat) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to add category');
    return res.json();
  },
  async updateCategory(id, cat) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to update category');
    return res.json();
  },
  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },
};
