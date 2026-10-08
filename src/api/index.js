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
  async updateAsset(id, asset, updatedBy) {
    const payload = updatedBy ? { ...asset, updatedBy } : asset;
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
  async updateAssetCondition(id, condition, updatedBy) {
    const res = await fetch(`${API_BASE}/assets/${id}/condition`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition, updatedBy }),
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
  async addInspection(inspection, updatedBy) {
    const payload = updatedBy ? { ...inspection, updatedBy } : inspection;
    const res = await fetch(`${API_BASE}/inspections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/notifications${query ? `?${query}` : ''}`);
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

  // Purchase History & Price Tracking
  async getPurchaseHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/purchase-history${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch purchase history');
    return res.json();
  },
  async getPurchaseHistoryStats() {
    const res = await fetch(`${API_BASE}/purchase-history/stats`);
    if (!res.ok) throw new Error('Failed to fetch procurement statistics');
    return res.json();
  },
  async getPurchaseHistoryById(id) {
    const res = await fetch(`${API_BASE}/purchase-history/${id}`);
    if (!res.ok) throw new Error('Failed to fetch purchase transaction');
    return res.json();
  },
  async getPurchaseHistoryByDateRange(from, to, extraParams = {}) {
    const query = new URLSearchParams({
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...extraParams
    }).toString();
    const res = await fetch(`${API_BASE}/purchase-history/date-range?${query}`);
    if (!res.ok) throw new Error('Failed to fetch purchase history by date range');
    return res.json();
  },
  async getPurchaseHistoryByVendor(vendorId) {
    const res = await fetch(`${API_BASE}/purchase-history/vendor/${encodeURIComponent(vendorId)}`);
    if (!res.ok) throw new Error('Failed to fetch vendor purchase history');
    return res.json();
  },
  async getPurchaseHistoryVendorDateRange(vendorId, params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/purchase-history/vendor/${encodeURIComponent(vendorId)}/date-range${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch vendor date range purchases');
    return res.json();
  },
  async getPurchaseHistoryByAsset(assetId) {
    const res = await fetch(`${API_BASE}/purchase-history/asset/${encodeURIComponent(assetId)}`);
    if (!res.ok) throw new Error('Failed to fetch asset purchase history');
    return res.json();
  },
  async getPurchaseHistoryByCategory(categoryId) {
    const res = await fetch(`${API_BASE}/purchase-history/category/${encodeURIComponent(categoryId)}`);
    if (!res.ok) throw new Error('Failed to fetch category purchase history');
    return res.json();
  },
  async getPurchaseHistoryBySubcategory(subcategoryId) {
    const res = await fetch(`${API_BASE}/purchase-history/subcategory/${encodeURIComponent(subcategoryId)}`);
    if (!res.ok) throw new Error('Failed to fetch subcategory purchase history');
    return res.json();
  },
  async addPurchaseHistory(data) {
    const res = await fetch(`${API_BASE}/purchase-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add purchase transaction');
    }
    return res.json();
  },
  async updatePurchaseHistory(id, data) {
    const res = await fetch(`${API_BASE}/purchase-history/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update purchase transaction');
    }
    return res.json();
  },
  async deletePurchaseHistory(id) {
    const res = await fetch(`${API_BASE}/purchase-history/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete purchase transaction');
    return res.json();
  },
  async bulkImportPurchases(payload) {
    const res = await fetch(`${API_BASE}/purchase-history/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to process bulk purchase import');
    }
    return data;
  },

  // Reports (PDF, Email, WhatsApp)
  async downloadAnalyticsPdf({ timeframe = 'all', department = 'All' } = {}) {
    const query = new URLSearchParams({ timeframe, department }).toString();
    const res = await fetch(`${API_BASE}/reports/analytics/pdf?${query}`);
    if (!res.ok) throw new Error('Failed to generate Analytics PDF report');
    return res.blob();
  },
  async downloadPurchasesPdf(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports/purchases/pdf?${query}`);
    if (!res.ok) throw new Error('Failed to generate Purchase History PDF report');
    return res.blob();
  },
  async sendReportEmail(payload) {
    const res = await fetch(`${API_BASE}/reports/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to dispatch email');
    return data;
  },
  async sendReportWhatsApp(payload) {
    const res = await fetch(`${API_BASE}/reports/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Failed to dispatch WhatsApp message');
    return data;
  },

  // AI Assistant & Hybrid Engine
  async sendAiChat(payload) {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.error || 'AI request failed');
    }
    return res.json();
  },
  async sendRuleQuery(payload) {
    const res = await fetch(`${API_BASE}/ai/rule-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Rule query failed');
    return res.json();
  },
  async getAiAuditLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/ai/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch AI audit logs');
    return res.json();
  },
  async getAiAssetSearch(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/ai/assets/search?${query}`);
    if (!res.ok) throw new Error('Failed to search assets for AI');
    return res.json();
  },
  async getAiPurchaseStats(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/ai/purchases/stats?${query}`);
    if (!res.ok) throw new Error('Failed to get purchase stats for AI');
    return res.json();
  },
  async getAiTopVendors(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/ai/vendors/top?${query}`);
    if (!res.ok) throw new Error('Failed to get top vendors for AI');
    return res.json();
  },
  async getAiDepartmentSummary() {
    const res = await fetch(`${API_BASE}/ai/departments/summary`);
    if (!res.ok) throw new Error('Failed to get department summary for AI');
    return res.json();
  },
  async getAiAnalyticsSummary(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/ai/analytics/summary?${query}`);
    if (!res.ok) throw new Error('Failed to get analytics summary for AI');
    return res.json();
  },
};
