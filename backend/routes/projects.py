from flask import Blueprint, request, jsonify
from models import db, Project, PunchItem
from sqlalchemy import func

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/projects', methods=['GET'])
def get_projects():
    """List all projects with completion stats"""
    projects = Project.query.all()
    result = []
    
    for project in projects:
        project_data = project.to_dict()
        
        # Calculate completion stats
        total_items = len(project.items)
        completed_items = sum(1 for item in project.items if item.status == 'complete')
        completion_percentage = round((completed_items / total_items * 100)) if total_items > 0 else 0
        
        project_data['totalItems'] = total_items
        project_data['completedItems'] = completed_items
        project_data['completionPercentage'] = completion_percentage
        
        result.append(project_data)
    
    return jsonify(result), 200

@projects_bp.route('/projects', methods=['POST'])
def create_project():
    """Create a new project"""
    data = request.get_json()
    
    # Validation
    if not data or not data.get('name') or not data.get('address'):
        return jsonify({'error': 'Name and address are required'}), 422
    
    project = Project(
        name=data['name'],
        address=data['address'],
        status=data.get('status', 'active')
    )
    
    db.session.add(project)
    db.session.commit()
    
    return jsonify(project.to_dict()), 201

@projects_bp.route('/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """Get a single project with all its punch items"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    project_data = project.to_dict()
    project_data['items'] = [item.to_dict() for item in project.items]
    
    return jsonify(project_data), 200

@projects_bp.route('/projects/<project_id>', methods=['PATCH'])
def update_project(project_id):
    """Update a project (name, address, status)"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 422
    
    # Update allowed fields
    if 'name' in data and data['name']:
        project.name = data['name']
    
    if 'address' in data and data['address']:
        project.address = data['address']
    
    if 'status' in data:
        valid_statuses = ['active', 'completed', 'archived']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Status must be one of: {", ".join(valid_statuses)}'}), 422
        project.status = data['status']
    
    db.session.commit()
    
    return jsonify(project.to_dict()), 200

@projects_bp.route('/projects/<project_id>/dashboard', methods=['GET'])
def get_project_dashboard(project_id):
    """Get dashboard stats for a project"""
    project = Project.query.get(project_id)
    
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Total counts
    total_items = len(project.items)
    
    if total_items == 0:
        return jsonify({
            'projectId': project_id,
            'totalItems': 0,
            'completionPercentage': 0,
            'byStatus': {},
            'byLocation': {},
            'byPriority': {},
            'byAssignee': {}
        }), 200
    
    # Count by status
    status_counts = db.session.query(
        PunchItem.status, func.count(PunchItem.id)
    ).filter(PunchItem.project_id == project_id).group_by(PunchItem.status).all()
    
    by_status = {status: count for status, count in status_counts}
    completed_count = by_status.get('complete', 0)
    completion_percentage = round((completed_count / total_items) * 100, 2)
    
    # Count by location
    location_counts = db.session.query(
        PunchItem.location, func.count(PunchItem.id)
    ).filter(PunchItem.project_id == project_id).group_by(PunchItem.location).all()
    by_location = {location: count for location, count in location_counts}
    
    # Count by priority
    priority_counts = db.session.query(
        PunchItem.priority, func.count(PunchItem.id)
    ).filter(PunchItem.project_id == project_id).group_by(PunchItem.priority).all()
    by_priority = {priority: count for priority, count in priority_counts}
    
    # Count by assignee
    assignee_counts = db.session.query(
        PunchItem.assigned_to, func.count(PunchItem.id)
    ).filter(PunchItem.project_id == project_id).group_by(PunchItem.assigned_to).all()
    by_assignee = {assignee if assignee else 'Unassigned': count for assignee, count in assignee_counts}
    
    return jsonify({
        'projectId': project_id,
        'totalItems': total_items,
        'completionPercentage': completion_percentage,
        'byStatus': by_status,
        'byLocation': by_location,
        'byPriority': by_priority,
        'byAssignee': by_assignee
    }), 200
