import { useEffect, useState } from 'react';
import * as venueApi from '../../api/venueApi.js';
import { useToast } from '../../hooks/useToast.js';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function VenuesPage() {
  const toast = useToast();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Null for create, ID for edit
  const [form, setForm] = useState({
    venueName: '',
    address: '',
    city: '',
    stateName: '',
    country: 'India',
    capacity: '',
    contactPerson: '',
    contactPhone: ''
  });

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const data = await venueApi.getVenues();
      setVenues(data);
    } catch (err) {
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      venueName: '',
      address: '',
      city: '',
      stateName: '',
      country: 'India',
      capacity: '',
      contactPerson: '',
      contactPhone: ''
    });
    setShowModal(true);
  };

  const openEditModal = (venue) => {
    setEditingId(venue.id);
    setForm({
      venueName: venue.venueName || '',
      address: venue.address || '',
      city: venue.city || '',
      stateName: venue.stateName || '',
      country: venue.country || 'India',
      capacity: venue.capacity || '',
      contactPerson: venue.contactPerson || '',
      contactPhone: venue.contactPhone || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.venueName || !form.address || !form.city || !form.capacity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      ...form,
      capacity: Number(form.capacity)
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await venueApi.updateVenue(editingId, payload);
        toast.success('Venue updated successfully');
      } else {
        await venueApi.createVenue(payload);
        toast.success('Venue created successfully');
      }
      setShowModal(false);
      fetchVenues();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save venue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this venue? All events linked to this venue might fail to load.')) return;
    try {
      await venueApi.deleteVenue(id);
      toast.success('Venue deleted successfully');
      fetchVenues();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete venue');
    }
  };

  if (loading) return <LoadingSpinner label="Loading venues..." />;

  return (
    <div>
      <div className="header-actions">
        <div>
          <h1 className="page-title">Manage Venues</h1>
          <p className="muted">Configure locations and seat capacities for your events.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add Venue
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Venue Name</th>
              <th>Location</th>
              <th>Max Capacity</th>
              <th>Contact Person</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {venues.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td style={{ fontWeight: 600 }}>{v.venueName}</td>
                <td>
                  <div>{v.address}</div>
                  <div className="muted text-xs">{v.city}, {v.stateName ? `${v.stateName}, ` : ''}{v.country}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{v.capacity} seats</td>
                <td>
                  <div>{v.contactPerson || '-'}</div>
                  <div className="muted text-xs">{v.contactPhone || ''}</div>
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-icon" onClick={() => openEditModal(v)} title="Edit Venue">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDelete(v.id)} title="Delete Venue">
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
              <h2>{editingId ? 'Edit Venue' : 'Create Venue'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body stack">
                <div>
                  <label className="label-text">Venue Name *</label>
                  <input
                    className="input-field"
                    required
                    value={form.venueName}
                    onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                    placeholder="e.g. Grand Ballroom, Tech Park Hall"
                  />
                </div>

                <div>
                  <label className="label-text">Street Address *</label>
                  <input
                    className="input-field"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. 123 Event Street"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label className="label-text">City *</label>
                    <input
                      className="input-field"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="e.g. Bangalore"
                    />
                  </div>

                  <div>
                    <label className="label-text">State</label>
                    <input
                      className="input-field"
                      value={form.stateName}
                      onChange={(e) => setForm({ ...form, stateName: e.target.value })}
                      placeholder="e.g. Karnataka"
                    />
                  </div>

                  <div>
                    <label className="label-text">Country</label>
                    <input
                      className="input-field"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      placeholder="e.g. India"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="label-text">Max Seating Capacity *</label>
                    <input
                      className="input-field"
                      type="number"
                      min="1"
                      required
                      value={form.capacity}
                      onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                      placeholder="e.g. 250"
                    />
                  </div>

                  <div>
                    <label className="label-text">Contact Person</label>
                    <input
                      className="input-field"
                      value={form.contactPerson}
                      onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                      placeholder="e.g. Manager Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">Contact Phone</label>
                  <input
                    className="input-field"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="e.g. +91 99999 99999"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
