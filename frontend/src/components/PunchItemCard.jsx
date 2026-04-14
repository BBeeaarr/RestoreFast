export default function PunchItemCard({ item, onStatusChange, onDelete, onEdit }) {
  const handleStatusChange = (e) => {
    onStatusChange(e.target.value);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>{item.location}</strong>
            <span className={`badge badge-${item.priority}`} style={{ marginLeft: '0.5rem' }}>
              {item.priority}
            </span>
          </div>
          
          <p style={{ color: '#444', marginBottom: '1rem' }}>
            {item.description}
          </p>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9em', color: '#666' }}>
            {item.assignedTo && (
              <div>
                <strong>Assigned:</strong> {item.assignedTo}
              </div>
            )}
            {item.photo && (
              <div>
                <a href={item.photo} target="_blank" rel="noopener noreferrer">
                  📷 View Photo
                </a>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '200px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '0.25rem' }}>
              Status
            </label>
            <select
              value={item.status}
              onChange={handleStatusChange}
              style={{ width: '100%' }}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={onEdit}
              style={{ flex: 1, padding: '0.4em 0.8em', fontSize: '0.9em', background: '#666' }}
            >
              Edit
            </button>
            <button 
              onClick={onDelete}
              style={{ flex: 1, padding: '0.4em 0.8em', fontSize: '0.9em', background: '#c33' }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
