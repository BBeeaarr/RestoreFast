from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

def generate_uuid():
    return str(uuid.uuid4())

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='active')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationship
    items = db.relationship('PunchItem', back_populates='project', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'status': self.status,
            'createdAt': self.created_at.isoformat()
        }

class PunchItem(db.Model):
    __tablename__ = 'punch_items'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='open')
    priority = db.Column(db.String(50), nullable=False, default='normal')
    assigned_to = db.Column(db.String(255), nullable=True)
    photo = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationship
    project = db.relationship('Project', back_populates='items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'projectId': self.project_id,
            'location': self.location,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'assignedTo': self.assigned_to,
            'photo': self.photo,
            'createdAt': self.created_at.isoformat()
        }
