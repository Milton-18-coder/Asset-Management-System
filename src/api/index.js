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
};
