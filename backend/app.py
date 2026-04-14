from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from models import db

def create_app():
    # Load environment variables
    load_dotenv()
    
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///restorefast.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Enable CORS
    CORS(app)
    
    # Initialize database
    db.init_app(app)
    
    # Register blueprints
    from routes.projects import projects_bp
    from routes.items import items_bp
    
    app.register_blueprint(projects_bp, url_prefix='/api')
    app.register_blueprint(items_bp, url_prefix='/api')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
