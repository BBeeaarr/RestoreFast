# RestoreFast - Construction Punch List Tracker

A full-stack web application for managing construction project punch lists, tracking deficiencies, and monitoring completion status.

## Tech Stack

- **Backend**: Flask (Python), SQLAlchemy ORM, SQLite
- **Frontend**: React (Vite), React Router
- **API**: RESTful JSON API

## Features

- ✅ Create and manage multiple construction projects
- ✅ Edit project details (name, address, status)
- ✅ Add punch items with location, description, priority, assignee
- ✅ Multi-photo gallery support with thumbnail selection
- ✅ Fullscreen photo viewer with navigation
- ✅ Fullscreen edit modal for punch items
- ✅ Track item status through workflow: Open → In Progress → Complete
- ✅ Completion percentage display on project list and detail pages
- ✅ Real-time dashboard with summary stats and breakdowns
- ✅ Filter and sort items by location, priority, status, and assignee
- ✅ Project filtering by name, address, and status
- ✅ Skeleton loading states for better UX

## Project Structure

```
restorefast/
├── backend/
│   ├── app.py              # Flask app factory
│   ├── models.py           # SQLAlchemy models (Project, PunchItem)
│   ├── routes/
│   │   ├── projects.py     # Project API endpoints
│   │   └── items.py        # Punch item API endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── api/            # API client utilities
    │   ├── components/     # Reusable React components
    │   └── pages/          # Route-level views
    ├── index.html
    └── package.json
```

## Prerequisites

- Python 3.9+
- Node.js 18+

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# The .env file is already configured for SQLite (no database setup needed!)

# Run the Flask server (database will be created automatically)
python app.py
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

| Method | Path                          | Description                      |
|--------|-------------------------------|----------------------------------|
| GET    | /api/projects                 | List all projects with stats     |
| POST   | /api/projects                 | Create a project                 |
| GET    | /api/projects/:id             | Get project with items           |
| PATCH  | /api/projects/:id             | Update project fields            |
| GET    | /api/items                    | List items (filter by projectId) |
| POST   | /api/items                    | Create a punch item              |
| PATCH  | /api/items/:id                | Update item fields               |
| DELETE | /api/items/:id                | Delete an item                   |

## Data Models

### Project
```json
{
  "id": "uuid",
  "name": "string",
  "address": "string",
  "status": "active|completed|archived",
  "createdAt": "datetime",
  "totalItems": "number (calculated)",
  "completedItems": "number (calculated)",
  "completionPercentage": "number (calculated)"
}
```

**Note**: The `totalItems`, `completedItems`, and `completionPercentage` fields are calculated dynamically when fetching the project list.

### PunchItem
```json
{
  "id": "uuid",
  "projectId": "uuid",
  "location": "string",
  "description": "string",
  "status": "open|in_progress|complete",
  "priority": "low|normal|high",
  "assignedTo": "string?",
  "photo": "string? (single URL) or JSON { photos: string[], thumbnailIndex: number }",
  "createdAt": "datetime"
}
```

**Note**: The `photo` field supports both legacy single-photo strings (base64 data URLs) and the new multi-photo gallery format stored as JSON. This maintains backward compatibility with existing data.

## Development

### Backend Development

The Flask app uses auto-reload in debug mode. Changes to Python files will automatically restart the server.

### Frontend Development

Vite provides hot module replacement (HMR). Changes to React components update instantly.

### Database Migrations

The app uses `db.create_all()` for initial setup. For production, consider using Flask-Migrate for schema changes:

```bashThe SQLite database file (`restorefast.db`) will be created automatically on first run.

For production deployments, consider migrating to PostgreSQL and using Flask-Migrate for schema changes.

## Production Deployment

### Backend
- Migrate to PostgreSQL for production use
- Set `FLASK_ENV=production` in `.env`
- Use a production WSGI server (gunicorn, uWSGI)
### Frontend
```bash
npm run build
# Serve the dist/ folder with nginx or similar
```

## Future Enhancements

- Photo upload to cloud storage (S3, Cloudinary) - currently using base64 encoding
- User authentication and role-based access
- Email notifications for status changes
- PDF report generation
- Enhanced mobile-responsive design
- Real-time updates with WebSockets
- Bulk operations (import/export CSV)
- Advanced search with full-text indexing
- Activity logs and audit trails
- Custom fields and templates per project type

## License

MIT
