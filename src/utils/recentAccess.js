import { useState, useEffect } from 'react';

const RECENT_KEY = 'asset_recently_accessed_v1';
const MAX_RECENT = 15;

/**
 * Format relative time (e.g., 'Just now', '5m ago', '2h ago', 'Yesterday')
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 45) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

/**
 * Load recently accessed items from LocalStorage
 */
export function getRecentlyAccessed() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Error reading recently accessed:', e);
    return [];
  }
}

/**
 * Add or update an item in Recently Accessed
 * @param {Object} item - { id, name, category, department, room, cost, condition, status, type: 'asset' | 'vendor' | 'purchase' }
 */
export function recordRecentAccess(item) {
  if (!item || !item.id) return;
  try {
    const current = getRecentlyAccessed();
    // Remove if already exists (to bump to top)
    const filtered = current.filter(i => i.id !== item.id);
    
    const newItem = {
      id: item.id,
      name: item.name || 'Unnamed Asset',
      category: item.category || item.mainCategory || 'General',
      department: item.department || '',
      room: item.room || '',
      cost: item.cost || 0,
      condition: item.condition || 'Good',
      status: item.status || 'Available',
      type: item.type || 'asset',
      link: item.link || (item.type === 'vendor' ? `/vendors` : `/assets/${item.id}`),
      accessedAt: new Date().toISOString()
    };

    const updated = [newItem, ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));

    // Dispatch custom event for cross-component reactive updates
    window.dispatchEvent(new CustomEvent('recent-assets-updated', { detail: updated }));
  } catch (e) {
    console.warn('Error saving recent access:', e);
  }
}

/**
 * Remove an item from Recently Accessed
 */
export function removeRecentAccess(id) {
  try {
    const current = getRecentlyAccessed();
    const updated = current.filter(i => i.id !== id);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('recent-assets-updated', { detail: updated }));
  } catch (e) {
    console.warn('Error removing recent access:', e);
  }
}

/**
 * Clear all Recently Accessed
 */
export function clearAllRecentAccess() {
  try {
    localStorage.removeItem(RECENT_KEY);
    window.dispatchEvent(new CustomEvent('recent-assets-updated', { detail: [] }));
  } catch (e) {
    console.warn('Error clearing recent access:', e);
  }
}

/**
 * React Hook to subscribe to Recently Accessed changes
 */
export function useRecentAccess() {
  const [recentItems, setRecentItems] = useState(getRecentlyAccessed);

  useEffect(() => {
    // Initial sync
    setRecentItems(getRecentlyAccessed());

    const handleUpdate = (e) => {
      setRecentItems(e.detail || getRecentlyAccessed());
    };

    window.addEventListener('recent-assets-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('recent-assets-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    recentItems,
    recordAccess: recordRecentAccess,
    removeAccess: removeRecentAccess,
    clearAll: clearAllRecentAccess
  };
}
