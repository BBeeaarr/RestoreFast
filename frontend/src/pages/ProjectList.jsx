import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/client';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'active'
  });
  
  // Filter states
  const [filterName, setFilterName] = useState('');
  const [filterAddress, setFilterAddress] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsApi.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await projectsApi.create(formData);
      setFormData({ name: '', address: '', status: 'active' });
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Apply filters
  const filteredProjects = projects.filter(project => {
    // Name filter (case-insensitive search)
    if (filterName && !project.name.toLowerCase().includes(filterName.toLowerCase())) {
      return false;
    }
    // Address filter (case-insensitive search)
    if (filterAddress && !project.address.toLowerCase().includes(filterAddress.toLowerCase())) {
      return false;
    }
    // Status filter
    if (filterStatus !== 'all' && project.status !== filterStatus) {
      return false;
    }
    return true;
  });

  const totalProjects = projects.length;
  const filteredCount = filteredProjects.length;

  if (loading) return <ProjectListSkeleton />;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Projects</h2>
        <button onClick={() => setShowForm(!showForm)} disabled={isSubmitting}>
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Create Project</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  style={{ width: '100%' }}
                  placeholder="e.g., Downtown Office Renovation"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  style={{ width: '100%' }}
                  placeholder="e.g., 123 Main St, City, State"
                />
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
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <button type="submit" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                {isSubmitting ? '⏳ Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      {projects.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Filters</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* Name Search */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
                Search by Name
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Type to search..."
                style={{ width: '100%' }}
              />
            </div>

            {/* Address Search */}
            <div>
              <label style={{ display: 'block', fontSize: '0.9em', marginBottom: '0.25rem', fontWeight: '500' }}>
                Search by Address
              </label>
              <input
                type="text"
                value={filterAddress}
                onChange={(e) => setFilterAddress(e.target.value)}
                placeholder="Type to search..."
                style={{ width: '100%' }}
              />
            </div>

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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div style={{ color: '#666', fontSize: '0.9em' }}>
              Showing {filteredCount} of {totalProjects} projects
            </div>
            <button
              onClick={() => {
                setFilterName('');
                setFilterAddress('');
                setFilterStatus('all');
              }}
              style={{ padding: '0.5em 1em', background: '#666', fontSize: '0.9em' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            No projects yet. Create one to get started!
          </p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            No projects match the current filters.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '1rem'
        }}>
          {filteredProjects.map(project => (
            <div key={project.id} className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to={`/projects/${project.id}`}
                      style={{ color: '#1a1a1a', textDecoration: 'none' }}
                    >
                      {project.name}
                    </Link>
                  </h3>
                  <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '0.95em' }}>
                    📍 {project.address}
                  </p>
                  <span className={`badge badge-${project.status}`}>
                    {project.status}
                  </span>
                </div>
                <Link to={`/projects/${project.id}`} style={{ marginTop: 'auto' }}>
                  <button style={{ width: '100%' }}>View Project</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectListSkeleton() {
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '120px', height: '32px' }}></div>
        <div className="skeleton" style={{ width: '130px', height: '44px', borderRadius: '8px' }}></div>
      </div>

      {/* Create Form Skeleton (optional) */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: '100px', height: '24px', marginBottom: '1rem' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '4px' }}></div>
          </div>
          <div>
            <div className="skeleton" style={{ width: '100px', height: '14px', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '4px' }}></div>
          </div>
          <div>
            <div className="skeleton" style={{ width: '80px', height: '14px', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '4px' }}></div>
          </div>
          <div className="skeleton" style={{ width: '100%', height: '44px', borderRadius: '8px' }}></div>
        </div>
      </div>

      {/* Projects Grid Skeleton */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '1rem'
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div className="skeleton" style={{ width: '70%', height: '24px', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '0.5rem' }}></div>
                <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '4px' }}></div>
              </div>
              <div className="skeleton" style={{ width: '100%', height: '44px', borderRadius: '8px', marginTop: 'auto' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
