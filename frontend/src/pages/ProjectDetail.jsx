import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi, itemsApi } from '../api/client';
import PunchItemForm from '../components/PunchItemForm';

function parsePhotoData(photoValue) {
  if (!photoValue) {
    return { photos: [], thumbnailIndex: 0 };
  }

  if (typeof photoValue === 'string') {
    try {
      const parsed = JSON.parse(photoValue);
      if (parsed && Array.isArray(parsed.photos)) {
        const safeIndex = Math.min(Math.max(parsed.thumbnailIndex || 0, 0), Math.max(parsed.photos.length - 1, 0));
        return { photos: parsed.photos, thumbnailIndex: safeIndex };
      }
    } catch {
      return { photos: [photoValue], thumbnailIndex: 0 };
    }
    return { photos: [photoValue], thumbnailIndex: 0 };
  }

  return { photos: [], thumbnailIndex: 0 };
}

function serializePhotoData(photos, thumbnailIndex) {
  if (!photos.length) return '';
  const safeIndex = Math.min(Math.max(thumbnailIndex, 0), photos.length - 1);
  return JSON.stringify({ photos, thumbnailIndex: safeIndex });
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);
  const [expandedEditItemId, setExpandedEditItemId] = useState(null);
  const [expandedEditData, setExpandedEditData] = useState({
    location: '',
    description: '',
    priority: 'normal',
    status: 'open',
    assignedTo: '',
    photos: [],
    thumbnailIndex: 0
  });
  const [isSavingExpandedItem, setIsSavingExpandedItem] = useState(false);
  const [photoGalleryState, setPhotoGalleryState] = useState({
    itemId: '',
    photos: [],
    currentIndex: 0,
    thumbnailIndex: 0
  });
  const [isUpdatingThumbnail, setIsUpdatingThumbnail] = useState(false);
  
  // Edit project states
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [editProjectData, setEditProjectData] = useState({
    name: '',
    address: '',
    status: 'active'
  });
  
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
      setEditProjectData({
        name: data.name,
        address: data.address,
        status: data.status
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItem = async (formData) => {
    try {
      setIsSubmittingItem(true);
      await itemsApi.create({ ...formData, projectId: id });
      setShowForm(false);
      setEditingItem(null);
      loadProject();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmittingItem(false);
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

  const handleOpenExpandedEdit = (item) => {
    const photoData = parsePhotoData(item.photo);
    setExpandedEditItemId(item.id);
    setExpandedEditData({
      location: item.location || '',
      description: item.description || '',
      priority: item.priority || 'normal',
      status: item.status || 'open',
      assignedTo: item.assignedTo || '',
      photos: photoData.photos,
      thumbnailIndex: photoData.thumbnailIndex
    });
  };

  const handleCloseExpandedEdit = () => {
    if (isSavingExpandedItem) return;
    setExpandedEditItemId(null);
    setExpandedEditData({
      location: '',
      description: '',
      priority: 'normal',
      status: 'open',
      assignedTo: '',
      photos: [],
      thumbnailIndex: 0
    });
  };

  const handleExpandedEditChange = (e) => {
    setExpandedEditData({
      ...expandedEditData,
      [e.target.name]: e.target.value
    });
  };

  const handleExpandedPhotoUpload = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const readOne = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.readAsDataURL(file);
      });

    Promise.all(selectedFiles.map(readOne)).then((results) => {
      const valid = results.filter(Boolean);
      if (!valid.length) return;

      setExpandedEditData((prev) => {
        const nextPhotos = [...prev.photos, ...valid];
        return {
          ...prev,
          photos: nextPhotos,
          thumbnailIndex: prev.photos.length ? prev.thumbnailIndex : 0
        };
      });
    });

    e.target.value = '';
  };

  const handleRemoveExpandedPhoto = (indexToRemove) => {
    setExpandedEditData((prev) => {
      const nextPhotos = prev.photos.filter((_, idx) => idx !== indexToRemove);
      let nextThumbnailIndex = prev.thumbnailIndex;

      if (!nextPhotos.length) {
        nextThumbnailIndex = 0;
      } else if (prev.thumbnailIndex === indexToRemove) {
        nextThumbnailIndex = 0;
      } else if (prev.thumbnailIndex > indexToRemove) {
        nextThumbnailIndex = prev.thumbnailIndex - 1;
      }

      return {
        ...prev,
        photos: nextPhotos,
        thumbnailIndex: nextThumbnailIndex
      };
    });
  };

  const handleOpenGalleryForItem = (item) => {
    const photoData = parsePhotoData(item.photo);
    if (!photoData.photos.length) return;
    setPhotoGalleryState({
      itemId: item.id,
      photos: photoData.photos,
      currentIndex: photoData.thumbnailIndex,
      thumbnailIndex: photoData.thumbnailIndex
    });
  };

  const handleCloseGallery = () => {
    if (isUpdatingThumbnail) return;
    setPhotoGalleryState({ itemId: '', photos: [], currentIndex: 0, thumbnailIndex: 0 });
  };

  const handleMakeThumbnail = async () => {
    if (!photoGalleryState.itemId || !photoGalleryState.photos.length) return;

    try {
      setIsUpdatingThumbnail(true);
      const updatedPhotoValue = serializePhotoData(photoGalleryState.photos, photoGalleryState.currentIndex);
      await itemsApi.update(photoGalleryState.itemId, { photo: updatedPhotoValue });
      await loadProject();
      setPhotoGalleryState((prev) => ({ ...prev, thumbnailIndex: prev.currentIndex }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdatingThumbnail(false);
    }
  };

  const handleSaveExpandedEdit = async (e) => {
    e.preventDefault();

    if (!expandedEditData.location || !expandedEditData.description) {
      setError('Location and description are required');
      return;
    }

    try {
      setIsSavingExpandedItem(true);
      await itemsApi.update(expandedEditItemId, {
        ...expandedEditData,
        photo: serializePhotoData(expandedEditData.photos, expandedEditData.thumbnailIndex)
      });
      await loadProject();
      setExpandedEditItemId(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingExpandedItem(false);
    }
  };

  const handleEditProject = () => {
    setIsEditingProject(true);
  };

  const handleCancelEditProject = () => {
    setIsEditingProject(false);
    if (project) {
      setEditProjectData({
        name: project.name,
        address: project.address,
        status: project.status
      });
    }
  };

  const handleSubmitEditProject = async () => {
    if (!editProjectData.name || !editProjectData.address) {
      setError('Name and address are required');
      return;
    }

    try {
      setIsSubmittingProject(true);
      const updated = await projectsApi.update(id, editProjectData);
      setProject(updated);
      setIsEditingProject(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmittingProject(false);
    }
  };

  const handleEditProjectChange = (e) => {
    setEditProjectData({
      ...editProjectData,
      [e.target.name]: e.target.value
    });
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

  if (loading) return <ProjectDetailSkeleton />;
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
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleEditProject} disabled={isSubmittingItem}>
            Edit Project
          </button>
          <button onClick={() => setShowForm(!showForm)} disabled={isSubmittingItem}>
            {showForm ? 'Cancel' : 'Add Punch Item'}
          </button>
        </div>
      </div>

      {/* Edit Project Form */}
      {isEditingProject && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Edit Project</h3>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmitEditProject(); }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editProjectData.name}
                  onChange={handleEditProjectChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={editProjectData.address}
                  onChange={handleEditProjectChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  name="status"
                  value={editProjectData.status}
                  onChange={handleEditProjectChange}
                  style={{ width: '100%' }}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={isSubmittingProject} style={{ opacity: isSubmittingProject ? 0.6 : 1, cursor: isSubmittingProject ? 'not-allowed' : 'pointer' }}>
                  {isSubmittingProject ? '⏳ Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditProject}
                  disabled={isSubmittingProject}
                  style={{ background: '#666', opacity: isSubmittingProject ? 0.6 : 1, cursor: isSubmittingProject ? 'not-allowed' : 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <PunchItemForm
            item={editingItem}
            onSubmit={handleCreateItem}
            onCancel={handleCancelForm}
            isLoading={isSubmittingItem}
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
            <DashboardItemCard
              key={item.id}
              item={item}
              onEdit={() => handleOpenExpandedEdit(item)}
              onOpenPhoto={() => handleOpenGalleryForItem(item)}
            />
          ))}
        </div>
      )}

      {expandedEditItemId && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'stretch'
        }}>
          <div style={{
            width: '100vw',
            minHeight: '100vh',
            background: '#fff',
            overflowY: 'auto',
            padding: '2rem'
          }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{ margin: 0 }}>Edit Punch Item</h2>
                <button
                  type="button"
                  onClick={handleCloseExpandedEdit}
                  disabled={isSavingExpandedItem}
                  style={{
                    background: '#666',
                    opacity: isSavingExpandedItem ? 0.6 : 1,
                    cursor: isSavingExpandedItem ? 'not-allowed' : 'pointer'
                  }}
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleSaveExpandedEdit} className="card" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={expandedEditData.location}
                      onChange={handleExpandedEditChange}
                      required
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description *</label>
                    <textarea
                      name="description"
                      value={expandedEditData.description}
                      onChange={handleExpandedEditChange}
                      required
                      rows={6}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Priority</label>
                      <select
                        name="priority"
                        value={expandedEditData.priority}
                        onChange={handleExpandedEditChange}
                        style={{ width: '100%' }}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem' }}>Status</label>
                      <select
                        name="status"
                        value={expandedEditData.status}
                        onChange={handleExpandedEditChange}
                        style={{ width: '100%' }}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Assigned To</label>
                    <input
                      type="text"
                      name="assignedTo"
                      value={expandedEditData.assignedTo}
                      onChange={handleExpandedEditChange}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Upload Photos</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleExpandedPhotoUpload}
                      disabled={isSavingExpandedItem}
                      style={{ width: '100%' }}
                    />
                    {expandedEditData.photos.length > 0 && (
                      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                        {expandedEditData.photos.map((photoSrc, index) => (
                          <div key={`${photoSrc.slice(0, 20)}-${index}`} style={{ border: expandedEditData.thumbnailIndex === index ? '2px solid #646cff' : '1px solid #ddd', borderRadius: '8px', padding: '0.4rem' }}>
                            <img
                              src={photoSrc}
                              alt={`Punch item upload ${index + 1}`}
                              style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem' }}>
                              <button
                                type="button"
                                onClick={() => setExpandedEditData({ ...expandedEditData, thumbnailIndex: index })}
                                disabled={isSavingExpandedItem}
                                style={{ background: expandedEditData.thumbnailIndex === index ? '#646cff' : '#666', fontSize: '0.75rem', padding: '0.35em 0.5em' }}
                              >
                                {expandedEditData.thumbnailIndex === index ? 'Thumbnail' : 'Make Thumbnail'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveExpandedPhoto(index)}
                                disabled={isSavingExpandedItem}
                                style={{ background: '#8a8a8a', fontSize: '0.75rem', padding: '0.35em 0.5em' }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={handleCloseExpandedEdit}
                      disabled={isSavingExpandedItem}
                      style={{
                        background: '#666',
                        opacity: isSavingExpandedItem ? 0.6 : 1,
                        cursor: isSavingExpandedItem ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingExpandedItem}
                      style={{
                        opacity: isSavingExpandedItem ? 0.6 : 1,
                        cursor: isSavingExpandedItem ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isSavingExpandedItem ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {photoGalleryState.photos.length > 0 && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 2100,
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            padding: '1rem'
          }}
          onClick={handleCloseGallery}
        >
          <div
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ color: '#fff', fontWeight: 600 }}>
                Photo {photoGalleryState.currentIndex + 1} of {photoGalleryState.photos.length}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleMakeThumbnail}
                  disabled={isUpdatingThumbnail || photoGalleryState.currentIndex === photoGalleryState.thumbnailIndex}
                  style={{
                    background: '#2a8f5b',
                    opacity: (isUpdatingThumbnail || photoGalleryState.currentIndex === photoGalleryState.thumbnailIndex) ? 0.6 : 1,
                    cursor: (isUpdatingThumbnail || photoGalleryState.currentIndex === photoGalleryState.thumbnailIndex) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isUpdatingThumbnail ? 'Saving...' : 'Make Thumbnail'}
                </button>
                <button type="button" onClick={handleCloseGallery} disabled={isUpdatingThumbnail} style={{ background: '#666' }}>
                  Close
                </button>
              </div>
            </div>

            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <button
                type="button"
                onClick={() => setPhotoGalleryState((prev) => ({ ...prev, currentIndex: Math.max(prev.currentIndex - 1, 0) }))}
                disabled={photoGalleryState.currentIndex === 0}
                style={{ background: '#555', opacity: photoGalleryState.currentIndex === 0 ? 0.5 : 1 }}
              >
                Prev
              </button>
              <img
                src={photoGalleryState.photos[photoGalleryState.currentIndex]}
                alt="Punch item full size"
                style={{ maxWidth: '90vw', maxHeight: '78vh', objectFit: 'contain' }}
              />
              <button
                type="button"
                onClick={() => setPhotoGalleryState((prev) => ({ ...prev, currentIndex: Math.min(prev.currentIndex + 1, prev.photos.length - 1) }))}
                disabled={photoGalleryState.currentIndex === photoGalleryState.photos.length - 1}
                style={{ background: '#555', opacity: photoGalleryState.currentIndex === photoGalleryState.photos.length - 1 ? 0.5 : 1 }}
              >
                Next
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {photoGalleryState.photos.map((photoSrc, index) => (
                <button
                  key={`${photoSrc.slice(0, 20)}-${index}`}
                  type="button"
                  onClick={() => setPhotoGalleryState((prev) => ({ ...prev, currentIndex: index }))}
                  style={{
                    border: index === photoGalleryState.currentIndex ? '2px solid #646cff' : '2px solid transparent',
                    borderRadius: '6px',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={photoSrc}
                    alt={`Gallery thumbnail ${index + 1}`}
                    style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardItemCard({ item, onEdit, onOpenPhoto }) {
  const photoData = parsePhotoData(item.photo);
  const thumbnailSrc = photoData.photos[photoData.thumbnailIndex] || photoData.photos[0] || '';

  return (
    <div className="card" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%',
      position: 'relative'
    }}>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Edit punch item"
        style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          width: '34px',
          height: '34px',
          borderRadius: '999px',
          padding: 0,
          fontSize: '1rem',
          lineHeight: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#666'
        }}
      >
        ✏
      </button>

      {/* Header with Status and Priority */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '0.75rem',
        paddingRight: '2.25rem',
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
        <div style={{
          color: '#555',
          fontSize: '0.95em',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          wordBreak: 'break-word'
        }}>
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
      {thumbnailSrc && (
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
          <button
            type="button"
            onClick={onOpenPhoto}
            style={{
              border: 'none',
              padding: 0,
              background: 'transparent',
              cursor: 'pointer'
            }}
            aria-label="Open photo"
          >
            <img
              src={thumbnailSrc}
              alt="Punch item thumbnail"
              style={{
                width: '96px',
                height: '96px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            />
          </button>
          {photoData.photos.length > 1 && (
            <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#666' }}>
              {photoData.photos.length} photos
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectDetailSkeleton() {
  return (
    <div className="container">
      <div style={{ marginBottom: '1rem' }}>
        <div className="skeleton" style={{ width: '150px', height: '20px' }}></div>
      </div>

      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ width: '60%', height: '32px', marginBottom: '0.5rem' }}></div>
          <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '0.5rem' }}></div>
          <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '4px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '140px', height: '44px', borderRadius: '8px' }}></div>
      </div>

      {/* Summary Stats Skeleton */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="skeleton" style={{ width: '80px', height: '48px', margin: '0 auto 0.5rem' }}></div>
              <div className="skeleton" style={{ width: '100px', height: '16px', margin: '0 auto' }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="skeleton" style={{ width: '150px', height: '24px', marginBottom: '1rem' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <div className="skeleton" style={{ width: '60px', height: '14px', marginBottom: '0.5rem' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60px', height: '14px', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '4px' }}></div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '60px', height: '14px', marginBottom: '0.5rem' }}></div>
            <div className="skeleton" style={{ width: '100%', height: '38px', borderRadius: '4px' }}></div>
          </div>
          <div className="skeleton" style={{ width: '130px', height: '44px', borderRadius: '8px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '150px', height: '14px', marginTop: '1rem' }}></div>
      </div>

      {/* Cards Grid Skeleton */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '1rem'
      }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f0f0f0' }}>
              <div className="skeleton" style={{ width: '80px', height: '24px', borderRadius: '4px' }}></div>
              <div className="skeleton" style={{ width: '60px', height: '24px', borderRadius: '4px' }}></div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div className="skeleton" style={{ width: '60px', height: '12px', marginBottom: '0.25rem' }}></div>
              <div className="skeleton" style={{ width: '80%', height: '20px' }}></div>
            </div>
            <div style={{ marginBottom: '0.75rem', flex: 1 }}>
              <div className="skeleton" style={{ width: '80px', height: '12px', marginBottom: '0.25rem' }}></div>
              <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '0.25rem' }}></div>
              <div className="skeleton" style={{ width: '90%', height: '16px' }}></div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <div className="skeleton" style={{ width: '80px', height: '12px', marginBottom: '0.25rem' }}></div>
              <div className="skeleton" style={{ width: '120px', height: '16px' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
