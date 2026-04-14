from flask import Blueprint, request, jsonify
from models import db, PunchItem, Project

items_bp = Blueprint('items', __name__)

@items_bp.route('/items', methods=['GET'])
def get_items():
    """List all punch items, optionally filtered by projectId"""
    project_id = request.args.get('projectId')
    
    if project_id:
        items = PunchItem.query.filter_by(project_id=project_id).all()
    else:
        items = PunchItem.query.all()
    
    return jsonify([item.to_dict() for item in items]), 200

@items_bp.route('/items', methods=['POST'])
def create_item():
    """Create a new punch item"""
    data = request.get_json()
    
    # Validation
    if not data:
        return jsonify({'error': 'Request body is required'}), 422
    
    required_fields = ['projectId', 'location', 'description']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 422
    
    # Verify project exists
    project = Project.query.get(data['projectId'])
    if not project:
        return jsonify({'error': 'Project not found'}), 404
    
    # Validate status if provided
    valid_statuses = ['open', 'in_progress', 'complete']
    status = data.get('status', 'open')
    if status not in valid_statuses:
        return jsonify({'error': f'Status must be one of: {", ".join(valid_statuses)}'}), 422
    
    # Validate priority if provided
    valid_priorities = ['low', 'normal', 'high']
    priority = data.get('priority', 'normal')
    if priority not in valid_priorities:
        return jsonify({'error': f'Priority must be one of: {", ".join(valid_priorities)}'}), 422
    
    item = PunchItem(
        project_id=data['projectId'],
        location=data['location'],
        description=data['description'],
        status=status,
        priority=priority,
        assigned_to=data.get('assignedTo'),
        photo=data.get('photo')
    )
    
    db.session.add(item)
    db.session.commit()
    
    return jsonify(item.to_dict()), 201

@items_bp.route('/items/<item_id>', methods=['PATCH'])
def update_item(item_id):
    """Update a punch item (status, assignedTo, etc.)"""
    item = PunchItem.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required'}), 422
    
    # Update allowed fields
    if 'status' in data:
        valid_statuses = ['open', 'in_progress', 'complete']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Status must be one of: {", ".join(valid_statuses)}'}), 422
        item.status = data['status']
    
    if 'priority' in data:
        valid_priorities = ['low', 'normal', 'high']
        if data['priority'] not in valid_priorities:
            return jsonify({'error': f'Priority must be one of: {", ".join(valid_priorities)}'}), 422
        item.priority = data['priority']
    
    if 'assignedTo' in data:
        item.assigned_to = data['assignedTo']
    
    if 'location' in data:
        item.location = data['location']
    
    if 'description' in data:
        item.description = data['description']
    
    if 'photo' in data:
        item.photo = data['photo']
    
    db.session.commit()
    
    return jsonify(item.to_dict()), 200

@items_bp.route('/items/<item_id>', methods=['DELETE'])
def delete_item(item_id):
    """Delete a punch item"""
    item = PunchItem.query.get(item_id)
    
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    
    db.session.delete(item)
    db.session.commit()
    
    return '', 204
