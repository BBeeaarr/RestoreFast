# RestoreFast - Construction Punch List Tracker

A full-stack web application for managing construction project punch lists, tracking deficiencies, and monitoring completion status.

## Tech Stack

- **Backend**: Flask (Python), SQLAlchemy ORM, SQLite
- **Frontend**: React (Vite), React Router
- **API**: RESTful JSON API

## Features

- ✅ Create and manage multiple construction projects
- ✅ Add punch items with location, description, priority, photos, and assignees
- ✅ Track item status through workflow: Open → In Progress → Complete
- ✅ Real-time dashboard with completion percentage and breakdowns
- ✅ Filter and organize items by location, priority, status, and assignee

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
| GET    | /api/projects                 | List all projects                |
| POST   | /api/projects                 | Create a project                 |
| GET    | /api/projects/:id             | Get project with items           |
| GET    | /api/projects/:id/dashboard   | Get completion stats             |
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
  "createdAt": "datetime"
}
```

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
  "photo": "string?",
  "createdAt": "datetime"
}
```

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

- Photo upload to cloud storage (S3, Cloudinary)
- User authentication and role-based access
- Email notifications for status changes
- PDF report generation
- Mobile-responsive design improvements
- Real-time updates with WebSockets
- Bulk operations (import/export CSV)
- Advanced filtering and search

## License

MIT
