import { useEffect, useState } from 'react';
import * as eventApi from '../../api/eventApi.js';
import * as categoryApi from '../../api/categoryApi.js';
import * as venueApi from '../../api/venueApi.js';
import useAuth from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { Plus, Edit2, Trash2, X, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/csvExport.js';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function EventsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Null for create, ID for edit
  const [form, setForm] = useState({
    eventTitle: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    ticketPrice: '',
    totalSeats: '',
    bannerUrl: '',
    eventStatus: 'PUBLISHED',
    categoryId: '',
    venueId: '',
    organizerId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [e, c, v] = await Promise.all([
        eventApi.getEvents(),
        categoryApi.getCategories(),
        venueApi.getVenues()
      ]);
      setEvents(e);
      setCategories(c);
      setVenues(v);
    } catch (err) {
      toast.error('Failed to load events data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      eventTitle: '',
      description: '',
      eventDate: '',
      startTime: '',
      endTime: '',
      ticketPrice: '',
      totalSeats: '',
      bannerUrl: '',
      eventStatus: 'PUBLISHED',
      categoryId: categories[0]?.id || '',
      venueId: venues[0]?.id || '',
      organizerId: user?.id || ''
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setEditingId(event.id);
    setForm({
      eventTitle: event.eventTitle || '',
      description: event.description || '',
      eventDate: event.eventDate || '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      ticketPrice: event.ticketPrice || '',
      totalSeats: event.totalSeats || '',
      bannerUrl: event.bannerUrl || '',
      eventStatus: event.eventStatus || 'PUBLISHED',
      categoryId: event.categoryId || '',
      venueId: event.venueId || '',
      organizerId: event.organizerId || user?.id || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventTitle || !form.eventDate || !form.startTime || !form.ticketPrice || !form.totalSeats) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const formattedStartTime = form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime;
    const formattedEndTime = form.endTime ? (form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime) : null;

    const payload = {
      ...form,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      ticketPrice: Number(form.ticketPrice),
      totalSeats: Number(form.totalSeats),
      categoryId: Number(form.categoryId),
      venueId: Number(form.venueId),
      organizerId: Number(form.organizerId || user?.id)
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await eventApi.updateEvent(editingId, payload);
        toast.success('Event updated successfully');
      } else {
        await eventApi.createEvent(payload);
        toast.success('Event created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await eventApi.deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete event');
    }
  };

  // Excel/CSV Exporter
  const handleExportEvents = () => {
    if (!events.length) return;
    const clean = events.map(e => ({
      EventId: e.id,
      Title: e.eventTitle,
      Category: e.categoryName,
      Venue: e.venueName,
      Date: e.eventDate,
      StartTime: e.startTime,
      EndTime: e.endTime || 'N/A',
      TicketPrice: e.ticketPrice,
      CapacitySeats: e.totalSeats,
      AvailableSeats: e.availableSeats,
      Status: e.eventStatus
    }));
    exportToCSV(clean, 'Events_Platform_Telemetry.csv');
    toast.success('Event spreadsheet exported successfully!');
  };

  if (loading) return <LoadingSpinner label="Loading events..." />;

  return (
    <div>
      <div className="header-actions">
        <div>
          <h1 className="page-title">Manage Events</h1>
          <p className="muted">Create, update, and manage your events listing.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={handleExportEvents}>
            <Download size={16} /> Export to Excel
          </button>
          <button className="btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Create Event
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Price</th>
              <th>Seats Sold</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.eventTitle}</td>
                <td><span className="badge">{e.categoryName || 'Event'}</span></td>
                <td>
                  <div>{e.eventDate}</div>
                  <div className="muted text-xs">{e.startTime}</div>
                </td>
                <td>{e.venueName || 'TBA'}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(e.ticketPrice || 0)}</td>
                <td>
                  {e.totalSeats - e.availableSeats} / {e.totalSeats}
                </td>
                <td>
                  <span className={`status-chip ${e.eventStatus?.toLowerCase() === 'published' ? 'confirmed' : 'pending'}`}>
                    {e.eventStatus}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-icon" onClick={() => openEditModal(e)} title="Edit Event">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDelete(e.id)} title="Delete Event">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Event' : 'Create Event'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body stack">
                <div>
                  <label className="label-text">Event Title *</label>
                  <input
                    className="input-field"
                    required
                    value={form.eventTitle}
                    onChange={(e) => setForm({ ...form, eventTitle: e.target.value })}
                    placeholder="e.g. Tech Conference 2026"
                  />
                </div>

                <div>
                  <label className="label-text">Description</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detailed description of the event..."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="label-text">Category *</label>
                    <select
                      className="select-field"
                      required
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label-text">Venue *</label>
                    <select
                      className="select-field"
                      required
                      value={form.venueId}
                      onChange={(e) => setForm({ ...form, venueId: e.target.value })}
                    >
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.venueName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label-text">Event Date *</label>
                    <input
                      className="input-field"
                      type="date"
                      required
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label-text">Start Time *</label>
                    <input
                      className="input-field"
                      type="time"
                      required
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label-text">End Time</label>
                    <input
                      className="input-field"
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="label-text">Ticket Price *</label>
                    <input
                      className="input-field"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.ticketPrice}
                      onChange={(e) => setForm({ ...form, ticketPrice: e.target.value })}
                      placeholder="e.g. 499"
                    />
                  </div>

                  <div>
                    <label className="label-text">Total Seats *</label>
                    <input
                      className="input-field"
                      type="number"
                      min="1"
                      required
                      value={form.totalSeats}
                      onChange={(e) => setForm({ ...form, totalSeats: e.target.value })}
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">Banner Image URL</label>
                  <input
                    className="input-field"
                    value={form.bannerUrl}
                    onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="label-text">Status</label>
                  <select
                    className="select-field"
                    value={form.eventStatus}
                    onChange={(e) => setForm({ ...form, eventStatus: e.target.value })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ONGOING">Ongoing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
