import { useState } from 'react';

export default function PunchItemForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    location: item?.location || '',
    description: item?.description || '',
    priority: item?.priority || 'normal',
    status: item?.status || 'open',
    assignedTo: item?.assignedTo || '',
    photo: item?.photo || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{item ? 'Edit Punch Item' : 'New Punch Item'}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            style={{ width: '100%' }}
            placeholder="e.g., Unit 204 - Kitchen"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={3}
            style={{ width: '100%' }}
            placeholder="e.g., Drywall patch needed behind door"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ width: '100%' }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Assigned To
          </label>
          <input
            type="text"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            style={{ width: '100%' }}
            placeholder="e.g., John Smith"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>
            Photo URL
          </label>
          <input
            type="text"
            name="photo"
            value={formData.photo}
            onChange={handleChange}
            style={{ width: '100%' }}
            placeholder="e.g., https://example.com/photo.jpg"
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit">
            {item ? 'Update' : 'Create'} Punch Item
          </button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              style={{ background: '#666' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
