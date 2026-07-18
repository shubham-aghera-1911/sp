import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI } from '../utils/api';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import '../styles/assignments.css';

export default function Assignments() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    dueDate: '',
    priority: 'Medium',
    maxMarks: '',
    notes: '',
  });

  useEffect(() => {
    fetchAssignments();
  }, [token]);

  useEffect(() => {
    filterAssignments();
  }, [assignments, selectedFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await assignmentAPI.getAll(token);
      setAssignments(res.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    let filtered = assignments;

    if (selectedFilter === 'pending') {
      filtered = filtered.filter((a) => a.status === 'Pending');
    } else if (selectedFilter === 'inProgress') {
      filtered = filtered.filter((a) => a.status === 'In Progress');
    } else if (selectedFilter === 'submitted') {
      filtered = filtered.filter((a) => a.status === 'Submitted');
    }

    setFilteredAssignments(filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await assignmentAPI.create(formData, token);
      setFormData({
        title: '',
        description: '',
        subject: '',
        dueDate: '',
        priority: 'Medium',
        maxMarks: '',
        notes: '',
      });
      setShowForm(false);
      fetchAssignments();
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await assignmentAPI.delete(id, token);
        fetchAssignments();
      } catch (error) {
        console.error('Failed to delete assignment:', error);
      }
    }
  };

  if (loading) {
    return <div className="assignments-page">Loading...</div>;
  }

  return (
    <div className="assignments-page">
      <div className="page-header">
        <h1>Assignments</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Add Assignment
        </button>
      </div>

      {showForm && (
        <div className="assignment-form">
          <h2>New Assignment</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Assignment title"
                />
              </div>
              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Subject name"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Assignment description"
                rows="3"
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Max Marks</label>
                <input
                  type="number"
                  value={formData.maxMarks}
                  onChange={(e) => setFormData({ ...formData, maxMarks: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
                rows="2"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                Save Assignment
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-section">
        <button
          className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${selectedFilter === 'pending' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`filter-btn ${selectedFilter === 'inProgress' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('inProgress')}
        >
          In Progress
        </button>
        <button
          className={`filter-btn ${selectedFilter === 'submitted' ? 'active' : ''}`}
          onClick={() => setSelectedFilter('submitted')}
        >
          Submitted
        </button>
      </div>

      <div className="assignments-list">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <div key={assignment._id} className="assignment-card">
              <div className="card-header">
                <div>
                  <h3>{assignment.title}</h3>
                  <p className="subject">{assignment.subject}</p>
                </div>
                <span className={`priority priority-${assignment.priority}`}>{assignment.priority}</span>
              </div>

              <div className="card-content">
                {assignment.description && <p>{assignment.description}</p>}

                <div className="card-meta">
                  <div className="meta-item">
                    <span className="label">Due Date:</span>
                    <span className="value">{format(new Date(assignment.dueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Status:</span>
                    <span className={`status status-${assignment.status}`}>{assignment.status}</span>
                  </div>
                  {assignment.maxMarks && (
                    <div className="meta-item">
                      <span className="label">Marks:</span>
                      <span className="value">{assignment.marks || 0} / {assignment.maxMarks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-actions">
                <button className="action-btn edit-btn">
                  <Edit2 size={18} /> Edit
                </button>
                <button className="action-btn delete-btn" onClick={() => handleDelete(assignment._id)}>
                  <Trash2 size={18} /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No assignments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
