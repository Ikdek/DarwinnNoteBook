from app import app, bcrypt, db
from app.models import User
from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)

token_blocklist = set()

@app.route('/')
@app.route('/index')
def index():
    return "Hello World"

@app.route('/aurevoir')
def aurevoir():
    return "Bye"

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email et mot de passe requis'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Utilisateur déjà existant'}), 409
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'Utilisateur créé avec succès',
        'user': {'id': new_user.id, 'email': new_user.email}
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email et mot de passe requis'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        return jsonify({'message': 'Identifiants invalides'}), 401
    
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({'message': 'Identifiants invalides'}), 401
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Connexion réussie',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {'id': user.id, 'email': user.email}
    }), 200

@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'access_token': new_access_token
    }), 200

@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    jti = get_jwt()['jti']
    token_blocklist.add(jti)
    
    return jsonify({'message': 'Déconnexion réussie'}), 200

@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    
    return jsonify({
        'message': 'Accès autorisé',
        'user_id': current_user_id
    }), 200

@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': 'Utilisateur non trouvé'}), 404
    
    return jsonify({
        'id': user.id,
        'email': user.email
    }), 200