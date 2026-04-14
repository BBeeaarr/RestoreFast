import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api/client';

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    status: 'active'
  });

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
      await projectsApi.create(formData);
      setFormData({ name: '', address: '', status: 'active' });
      setShowForm(false);
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error) return <div className="container">Error: {error}</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Projects</h2>
        <button onClick={() => setShowForm(!showForm)}>
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
              <button type="submit">Create Project</button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            No projects yet. Create one to get started!
          </p>
        </div>
      ) : (
        <div>
          {projects.map(project => (
            <div key={project.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to={`/projects/${project.id}`}
                      style={{ color: '#1a1a1a', textDecoration: 'none' }}
                    >
                      {project.name}
                    </Link>
                  </h3>
                  <p style={{ color: '#666', marginBottom: '0.5rem' }}>{project.address}</p>
                  <span className={`badge badge-${project.status}`}>
                    {project.status}
                  </span>
                </div>
                <Link to={`/projects/${project.id}`}>
                  <button>Dashboard</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
