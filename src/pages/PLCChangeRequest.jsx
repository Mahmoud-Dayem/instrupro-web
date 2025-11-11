import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import {
  Plus,
  Search,
  Clock,
  SortAsc,
  SortDesc,
  Pencil,
  X,
  Loader2,
  XCircle,
  Home,
  RefreshCcw,
} from 'lucide-react';
import './PLCChangeRequest.css';

const extractComparableDate = (record) => {
  if (!record) return null;
  const candidates = [record.updatedAt, record.createdAt, record.date];
  for (const candidate of candidates) {
    const parsed = tryParseDate(candidate);
    if (parsed) {
      return parsed;
    }
  }
  return null;
};

const defaultDateValue = () => new Date().toISOString().split('T')[0];
const defaultTimeValue = () => new Date().toTimeString().slice(0, 5);

const tryParseDate = (input) => {
  if (!input) return null;

  const direct = new Date(input);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const match = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (match) {
    const [, part1, part2, part3] = match;
    const year = part3.length === 2 ? `20${part3}` : part3;
    const monthFirst = new Date(`${year}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`);
    if (!Number.isNaN(monthFirst.getTime())) {
      return monthFirst;
    }
    const dayFirst = new Date(`${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`);
    if (!Number.isNaN(dayFirst.getTime())) {
      return dayFirst;
    }
  }

  return null;
};

const CACHE_KEY = 'plc_modifications_cache_v1';

const loadCache = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const parsed = JSON.parse(cached);
    if (!parsed || !Array.isArray(parsed.data)) {
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('Error loading PLC cache:', error);
    return null;
  }
};

const saveCache = (data) => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const payload = {
      data,
      timestamp: new Date().toISOString(),
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    return payload;
  } catch (error) {
    console.error('Error saving PLC cache:', error);
    return null;
  }
};

const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
};

const parseDateInput = (input) => {
  if (!input) return defaultDateValue();

  // Already in yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const fromDate = new Date(input);
  if (!Number.isNaN(fromDate.getTime())) {
    return fromDate.toISOString().split('T')[0];
  }

  // try to parse dd/mm/yyyy or mm/dd/yyyy
  const parsed = tryParseDate(input);
  if (parsed) {
    return parsed.toISOString().split('T')[0];
  }

  return defaultDateValue();
};

const parseTimeInput = (input) => {
  if (!input) return defaultTimeValue();
  if (/^\d{2}:\d{2}$/.test(input)) return input;

  const date = new Date(`1970-01-01T${input}`);
  if (!Number.isNaN(date.getTime())) {
    return date.toTimeString().slice(0, 5);
  }

  const meridiemMatch = input.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (meridiemMatch) {
    let [ , hours, minutes, seconds, period ] = meridiemMatch;
    hours = parseInt(hours, 10);
    if (period.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }
    if (period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
    const secondsValue = seconds ? `:${seconds}` : '';
    const formatted = `${String(hours).padStart(2, '0')}:${minutes}${secondsValue}`;
    return formatted.slice(0, 5);
  }

  const parts = input.split(':');
  if (parts.length >= 2) {
    const hoursValue = parseInt(parts[0], 10);
    const hours = Number.isNaN(hoursValue)
      ? '00'
      : String(Math.min(Math.max(hoursValue, 0), 23)).padStart(2, '0');
    const minutesRaw = String(parts[1] || '0').replace(/[^0-9]/g, '');
    const minutes = minutesRaw ? minutesRaw.slice(0, 2).padStart(2, '0') : '00';
    return `${hours}:${minutes}`;
  }

  return defaultTimeValue();
};

const formatDisplayDate = (dateValue) => {
  if (!dateValue) return '—';
  const date = tryParseDate(dateValue) || new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString();
};

const formatDisplayTime = (timeValue) => {
  if (!timeValue) return '—';
  const base = new Date(`1970-01-01T${timeValue}`);
  if (Number.isNaN(base.getTime())) return timeValue;
  return base.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getRelativeDay = (input) => {
  const date = input instanceof Date ? input : tryParseDate(input);
  if (!date) return '—';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  const diffMs = today.getTime() - date.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays > 1) return `${diffDays}d ago`;
  if (diffDays === -1) return 'Tomorrow';
  return `${Math.abs(diffDays)}d ahead`;
};

const initialFormState = {
  requestName: '',
  signalName: '',
  date: defaultDateValue(),
  time: defaultTimeValue(),
  details: '',
};

const PLCChangeRequest = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formState, setFormState] = useState(initialFormState);
  const [modifications, setModifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingItem, setEditingItem] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setEditingItem(null);
  }, []);

  const fetchModifications = useCallback(
    async ({ initial = false } = {}) => {
      if (initial) {
        setLoading(true);
      } else {
        setIsFetching(true);
      }

      try {
        const snapshot = await getDocs(collection(db, 'plcModifications'));
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setModifications(list);
        const payload = saveCache(list);
        const timestamp = payload?.timestamp || new Date().toISOString();
        setLastFetched(timestamp);
      } catch (error) {
        console.error('Error fetching modifications:', error);
        window.alert('Failed to load PLC modifications. Please try again.');
      } finally {
        if (initial) {
          setLoading(false);
        }
        setIsFetching(false);
      }
    },
    [db]
  );

  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setModifications(cached.data);
      if (cached.timestamp) {
        setLastFetched(cached.timestamp);
      }
      setLoading(false);
    } else {
      fetchModifications({ initial: true });
    }
  }, [fetchModifications]);

  const sortedModifications = useMemo(() => {
    const list = [...modifications];
    list.sort((a, b) => {
      const dateA = extractComparableDate(a);
      const dateB = extractComparableDate(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return list;
  }, [modifications, sortOrder]);

  const filteredModifications = useMemo(() => {
    const queryLower = searchQuery.trim().toLowerCase();
    return sortedModifications.filter((mod) => {
      if (statusFilter && mod.status !== statusFilter) {
        return false;
      }

      if (!queryLower) {
        return true;
      }

      const haystack = [
        mod.requestName,
        mod.signalName,
        mod.details,
        mod.userName,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      return haystack.some((value) => value.includes(queryLower));
    });
  }, [sortedModifications, searchQuery, statusFilter]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleCancelModification = async (id) => {
    const shouldCancel = window.confirm('Are you sure you want to cancel this modification?');
    if (!shouldCancel) return;

    try {
      const docRef = doc(db, 'plcModifications', id);
      await updateDoc(docRef, {
        status: 'cancelled',
        cancelledDate: new Date().toISOString(),
        cancelledBy: auth.currentUser?.uid || 'anonymous',
      });
      await fetchModifications();
    } catch (error) {
      console.error('Error cancelling modification:', error);
      window.alert('Failed to cancel modification. Please try again.');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormState({
      requestName: item.requestName || '',
      signalName: item.signalName || '',
      details: item.details || '',
      date: parseDateInput(item.date),
      time: parseTimeInput(item.time),
    });
    setModalOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'signalName' ? value.toUpperCase() : value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formState.requestName.trim()) {
      window.alert('Request name is required.');
      return;
    }

    if (!formState.signalName.trim()) {
      window.alert('Signal name is required.');
      return;
    }

    setSaving(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        window.alert('No authenticated user found.');
        return;
      }

      const payload = {
        requestName: formState.requestName.trim(),
        signalName: formState.signalName.trim(),
        details: formState.details.trim(),
        date: formatDisplayDate(formState.date),
        time: formatDisplayTime(formState.time),
      };

      if (editingItem) {
        const docRef = doc(db, 'plcModifications', editingItem.id);
        await updateDoc(docRef, {
          ...payload,
          updatedAt: new Date().toISOString(),
          updatedBy: user.uid,
        });
      } else {
        await addDoc(collection(db, 'plcModifications'), {
          ...payload,
          createdAt: new Date().toISOString(),
          uid: user.uid,
          userName: user.displayName || user.email || 'Anonymous',
          status: 'active',
        });
      }

      setModalOpen(false);
      resetForm();
      await fetchModifications();
    } catch (error) {
      console.error('Error saving PLC modification:', error);
      window.alert(`Failed to save modification: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="plc-page">
      <div className="plc-header">
        <div className="plc-header-left">
          <button
            type="button"
            className="plc-home-btn"
            onClick={() => navigate('/home')}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          <div className="plc-status-filters">
            <button
              type="button"
              className={`plc-filter-btn ${statusFilter === 'active' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              Active
            </button>
            <button
              type="button"
              className={`plc-filter-btn ${statusFilter === 'cancelled' ? 'is-active' : ''}`}
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>
        </div>

        <div className="plc-header-right">
          {lastFetched && (
            <span className="plc-last-sync">Last sync: {formatTimestamp(lastFetched)}</span>
          )}
          <div className="plc-header-actions">
            <button
              type="button"
              className="plc-refresh-btn"
              onClick={() => fetchModifications()}
              disabled={isFetching || loading}
            >
              {isFetching ? (
                <>
                  <Loader2 size={16} className="plc-spinner" />
                  <span>Refreshing…</span>
                </>
              ) : (
                <>
                  <RefreshCcw size={16} />
                  <span>Refresh Data</span>
                </>
              )}
            </button>
            <button
              type="button"
              className="plc-sort-btn"
              onClick={toggleSortOrder}
            >
              {sortOrder === 'asc' ? (
                <>
                  <SortAsc size={18} />
                  <span>Oldest first</span>
                </>
              ) : (
                <>
                  <SortDesc size={18} />
                  <span>Newest first</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="plc-search">
        <div className="plc-search-box">
          <Search size={18} className="plc-search-icon" />
          <input
            type="text"
            placeholder="Search by signal, details, or requester"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {searchQuery && (
            <button type="button" className="plc-search-clear" onClick={() => setSearchQuery('')}>
              <XCircle size={18} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="plc-loader">
          <Loader2 size={36} className="plc-spinner" />
          <span>Loading modifications…</span>
        </div>
      ) : filteredModifications.length === 0 ? (
        <div className="plc-empty">
          <h3>No modifications found</h3>
          <p>Try changing the filters or create a new request.</p>
        </div>
      ) : (
        <div className="plc-list">
          {filteredModifications.map((mod) => {
            const comparableDate = extractComparableDate(mod);
            return (
              <div key={mod.id} className={`plc-card status-${mod.status || 'unknown'}`}>
              <div className="plc-card-header">
                <div className="plc-card-title">
                  <h3>{mod.signalName || 'Unnamed Signal'}</h3>
                  <span className={`plc-status ${mod.status}`}>{mod.status || 'unknown'}</span>
                </div>
                <span className="plc-relative-time" title={formatDisplayDate(mod.date) || ''}>
                  {getRelativeDay(comparableDate || mod.date)}
                </span>
              </div>

              <div className="plc-card-meta">
                <span>
                  <Clock size={16} />
                  {formatDisplayDate(mod.date)} · {mod.time || '—'}
                </span>
                <span>Requester: {mod.requestName || '—'}</span>
                <span>Created by: {mod.userName || '—'}</span>
              </div>

              {mod.details && <p className="plc-card-details">{mod.details}</p>}

              {mod.status === 'cancelled' && mod.cancelledDate && (
                <div className="plc-card-cancelled">
                  Cancelled on {formatDisplayDate(mod.cancelledDate)}
                </div>
              )}

              <div className="plc-card-actions">
                <button type="button" onClick={() => handleEditItem(mod)}>
                  <Pencil size={16} />
                  Edit
                </button>
                {mod.status === 'active' && (
                  <button
                    type="button"
                    className="plc-cancel-btn"
                    onClick={() => handleCancelModification(mod.id)}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>
              </div>
            );
          })}
        </div>
      )}

      <button type="button" className="plc-add-button" onClick={openCreateModal}>
        <Plus size={24} />
        New Request
      </button>

      {modalOpen && (
        <div className="plc-modal" role="dialog" aria-modal="true">
          <div className="plc-modal-content">
            <div className="plc-modal-header">
              <h2>{editingItem ? 'Edit PLC Change Request' : 'New PLC Change Request'}</h2>
              <button type="button" className="plc-modal-close" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <form className="plc-form" onSubmit={handleSave}>
              <div className="plc-form-grid">
                <label>
                  <span>Request Name</span>
                  <input
                    name="requestName"
                    type="text"
                    placeholder="Enter request name"
                    value={formState.requestName}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  <span>Signal Name</span>
                  <input
                    name="signalName"
                    type="text"
                    placeholder="Enter signal name"
                    value={formState.signalName}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  <span>Date</span>
                  <input
                    name="date"
                    type="date"
                    value={formState.date}
                    onChange={handleInputChange}
                    required
                  />
                </label>

                <label>
                  <span>Time</span>
                  <input
                    name="time"
                    type="time"
                    value={formState.time}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>

              <label className="plc-form-full">
                <span>Details</span>
                <textarea
                  name="details"
                  placeholder="Enter additional details"
                  rows={4}
                  value={formState.details}
                  onChange={handleInputChange}
                />
              </label>

              <div className="plc-form-actions">
                <button type="submit" className="plc-save-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 size={16} className="plc-spinner" />
                      Saving…
                    </>
                  ) : (
                    <>{editingItem ? 'Update' : 'Save'}</>
                  )}
                </button>
                <button type="button" className="plc-close-btn" onClick={closeModal}>
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PLCChangeRequest;
