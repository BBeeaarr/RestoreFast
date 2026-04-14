import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi, itemsApi } from '../api/client';
import PunchItemForm from '../components/PunchItemForm';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  
  // Sort state
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getById(id);
      setProject(data);
      setItems(data.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (formData) => {
    try {
      await itemsApi.create({ ...formData, projectId: id });
      setShowForm(false);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    try {
      await itemsApi.update(itemId, updates);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await itemsApi.delete(itemId);
      loadProject();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // Get unique values for filters
  const uniqueLocations = [...new Set(items.map(item => item.location))].sort();
  const uniqueAssignees = [...new Set(items.map(item => item.assignedTo).filter(Boolean))].sort();

  // Apply filters
  const filteredItems = items.filter(item => {
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    if (filterPriority !== 'all' && item.priority !== filterPriority) return false;
    if (filterLocation !== 'all' && item.location !== filterLocation) return false;
    if (filterAssignee !== 'all' && item.assignedTo !== filterAssignee) return false;
    return true;
  });

  // Apply sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle null/undefined values
    if (!aVal) return 1;
    if (!bVal) return -1;

    // Compare
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Calculate stats
  const totalItems = items.length;
  const filteredCount = filteredItems.length;

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;
  if (!project) return <div className="container">Project not found</div>;

  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" style={{ color: '#646cff', textDecoration: 'none' }}>
          ← Back to Projects
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.5rem' }}>{project.name}</h2>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>{project.address}</p>
          <span className={`badge badge-${project.status}`}>
            {project.status}
          </span>
        </div>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Punch Item'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <PunchItemForm
            item={editingItem}
            onSubmit={handleCreateItem}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* Summary Stats */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#646cff' }}>
              {totalItems}
            </div>
            <div style={{ color: '#666', fontSize: '0.9em' }}>Total Items</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#155724' }}>
              {items.filter(i => i.status === 'complete').length}
            </div>
            <div style={{ color: '#666', fontSize: '0.9em' }}>Complete</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#856404' }}>
              {items.filter(i => i.status === 'in_progress').length}
            </div>
            <div style={{ color: '#666', fontSize: '0.9em' }}>In Progress</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#721c24' }}>
              {items.filter(i => i.status === 'open').length}
            </div>
            <div style={{ color: '#666', fontSize: '0.9em' }}>Open</div>
          </div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Filters & Sort</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
              Status
            </label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
              Priority
            </label>
            <select 
              value={filterPriority} 
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
              Location
            </label>
            <select 
              value={filterLocation} 
              onChange={(e) => setFilterLocation(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All</option>
              {uniqueLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Assignee Filter */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
              Assignee
            </label>
            <select 
              value={filterAssignee} 
              onChange={(e) => setFilterAssignee(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">All</option>
              {uniqueAssignees.map(assignee => (
                <option key={assignee} value={assignee}>{assignee}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          {/* Sort By */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
              Sort By
            </label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="createdAt">Created Date</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="location">Location</option>
              <option value="assignedTo">Assignee</option>
            </select>
          </div>

          {/* Sort Order */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
              Order
            </label>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setFilterStatus('all');
              setFilterPriority('all');
              setFilterLocation('all');
              setFilterAssignee('all');
            }}
            style={{ padding: '0.6em 1.2em', background: '#666' }}
          >
            Clear Filters
          </button>
        </div>

        <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9em' }}>
          Showing {filteredCount} of {totalItems} items
        </div>
      </div>

      {/* Punch Items Grid */}
      {sortedItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>No punch items match the current filters.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1rem'
        }}>
          {sortedItems.map(item => (
            <DashboardItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function DashboardItemCard({ item }) {
  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header with Status and Priority */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem',
        paddingBottom: '0.75rem',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <span className={`badge badge-${item.status}`} style={{ fontSize: '0.85em' }}>
          {item.status.replace('_', ' ').toUpperCase()}
        </span>
        <span className={`badge badge-${item.priority}`} style={{ fontSize: '0.85em' }}>
          {item.priority.toUpperCase()}
        </span>
      </div>

      {/* Location */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.75em', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Location
        </div>
        <div style={{ fontSize: '1.1em', fontWeight: '600', color: '#333' }}>
          {item.location}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '0.75rem', flex: 1 }}>
        <div style={{ fontSize: '0.75em', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>
          Description
        </div>
        <div style={{ color: '#555', fontSize: '0.95em', lineHeight: '1.4' }}>
          {item.description}
        </div>
      </div>

      {/* Assignee */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.75em', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Assigned To
        </div>
        <div style={{ fontSize: '0.95em', color: item.assignedTo ? '#333' : '#999', fontStyle: item.assignedTo ? 'normal' : 'italic' }}>
          {item.assignedTo || 'Unassigned'}
        </div>
      </div>

      {/* Photo */}
      {item.photo && (
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
          <a 
            href={item.photo} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#646cff',
              textDecoration: 'none',
              fontSize: '0.9em',
              fontWeight: '500'
            }}
          >
            <span style={{ fontSize: '1.2em' }}>📷</span>
            View Photo
          </a>
        </div>
      )}
    </div>
  );
}
