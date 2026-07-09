import { useEffect, useState } from 'react';
import * as categoryApi from '../../api/categoryApi.js';
import { useToast } from '../../hooks/useToast.js';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Null for create, ID for edit
  const [form, setForm] = useState({
    categoryName: '',
    description: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ categoryName: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setForm({
      categoryName: cat.categoryName || '',
      description: cat.description || ''
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.categoryName) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await categoryApi.updateCategory(editingId, form);
        toast.success('Category updated successfully');
      } else {
        await categoryApi.createCategory(form);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? All associated events might be affected.')) return;
    try {
      await categoryApi.deleteCategory(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) return <LoadingSpinner label="Loading categories..." />;

  return (
    <div>
      <div className="header-actions">
        <div>
          <h1 className="page-title">Event Categories</h1>
          <p className="muted">Manage the classification of events on the platform.</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>ID</th>
              <th>Category Name</th>
              <th>Description</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td style={{ fontWeight: 600 }}>{c.categoryName}</td>
                <td className="muted">{c.description || 'No description provided'}</td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-icon" onClick={() => openEditModal(c)} title="Edit Category">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon danger" onClick={() => handleDelete(c.id)} title="Delete Category">
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
              <h2>{editingId ? 'Edit Category' : 'Create Category'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body stack">
                <div>
                  <label className="label-text">Category Name *</label>
                  <input
                    className="input-field"
                    required
                    value={form.categoryName}
                    onChange={(e) => setForm({ ...form, categoryName: e.target.value })}
                    placeholder="e.g. Music, Conferences, Arts"
                  />
                </div>

                <div>
                  <label className="label-text">Description</label>
                  <textarea
                    className="input-field"
                    rows="4"
                    style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Short description of this category..."
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
