import { useState } from 'react';

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

export default function PunchItemForm({ item, onSubmit, onCancel, isLoading = false }) {
  const initialPhotoData = parsePhotoData(item?.photo || '');
  const [formData, setFormData] = useState({
    location: item?.location || '',
    description: item?.description || '',
    priority: item?.priority || 'normal',
    status: item?.status || 'open',
    assignedTo: item?.assignedTo || '',
    photo: item?.photo || ''
  });
  const [photos, setPhotos] = useState(initialPhotoData.photos);
  const [thumbnailIndex, setThumbnailIndex] = useState(initialPhotoData.thumbnailIndex);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      photo: serializePhotoData(photos, thumbnailIndex)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = (e) => {
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
      setPhotos((prev) => {
        const next = [...prev, ...valid];
        if (!prev.length) {
          setThumbnailIndex(0);
        }
        return next;
      });
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove) => {
    setPhotos((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToRemove);
      if (!next.length) {
        setThumbnailIndex(0);
      } else if (thumbnailIndex === indexToRemove) {
        setThumbnailIndex(0);
      } else if (thumbnailIndex > indexToRemove) {
        setThumbnailIndex(thumbnailIndex - 1);
      }
      return next;
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
            Upload Photos
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            disabled={isLoading}
            style={{ width: '100%' }}
          />
          {photos.length > 0 && (
            <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
              {photos.map((photoSrc, index) => (
                <div key={`${photoSrc.slice(0, 20)}-${index}`} style={{ border: thumbnailIndex === index ? '2px solid #646cff' : '1px solid #ddd', borderRadius: '8px', padding: '0.4rem' }}>
                  <img
                    src={photoSrc}
                    alt={`Punch item upload ${index + 1}`}
                    style={{ width: '100%', height: '72px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.4rem' }}>
                    <button
                      type="button"
                      onClick={() => setThumbnailIndex(index)}
                      disabled={isLoading}
                      style={{ background: thumbnailIndex === index ? '#646cff' : '#666', fontSize: '0.75rem', padding: '0.35em 0.5em' }}
                    >
                      {thumbnailIndex === index ? 'Thumbnail' : 'Make Thumbnail'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      disabled={isLoading}
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

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}>
            {isLoading ? '⏳ Saving...' : (item ? 'Update' : 'Create') + ' Punch Item'}
          </button>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              disabled={isLoading}
              style={{ background: '#666', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
