from app import app, bcrypt
from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
import requests


users_db = {}
token_blocklist = set()

@app.route('/')
@app.route('/index')
def index():
    return requestInaturalist("cheetah")

@app.route('/aurevoir')
def aurevoir():
    return "Bye"


# ==================== ROUTES D'AUTHENTIFICATION ====================

@app.route('/api/register', methods=['POST'])
def register():
    """
    Inscription d'un nouvel utilisateur
    Body: {"email": "user@example.com", "password": "motdepasse"}
    """
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email et mot de passe requis'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if email in users_db:
        return jsonify({'message': 'Utilisateur déjà existant'}), 409
    
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    user_id = len(users_db) + 1
    users_db[email] = {
        'id': user_id,
        'email': email,
        'password': hashed_password
    }
    
    return jsonify({
        'message': 'Utilisateur créé avec succès',
        'user': {'id': user_id, 'email': email}
    }), 201


@app.route('/api/login', methods=['POST'])
def login():
    """
    Connexion d'un utilisateur
    Body: {"email": "user@example.com", "password": "motdepasse"}
    """
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email et mot de passe requis'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    user = users_db.get(email)
    
    if not user:
        return jsonify({'message': 'Identifiants invalides'}), 401
    
    if not bcrypt.check_password_hash(user['password'], password):
        return jsonify({'message': 'Identifiants invalides'}), 401
    
    access_token = create_access_token(identity=user['id'])
    refresh_token = create_refresh_token(identity=user['id'])
    
    return jsonify({
        'message': 'Connexion réussie',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {'id': user['id'], 'email': user['email']}
    }), 200


@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Rafraîchir le token d'accès
    Header: Authorization: Bearer <refresh_token>
    """
    current_user_id = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user_id)
    
    return jsonify({
        'access_token': new_access_token
    }), 200


@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Déconnexion d'un utilisateur (révoque le token)
    Header: Authorization: Bearer <access_token>
    """
    jti = get_jwt()['jti']
    token_blocklist.add(jti)
    
    return jsonify({'message': 'Déconnexion réussie'}), 200


@app.route('/api/protected', methods=['GET'])
@jwt_required()
def protected():
    """
    Exemple de route protégée nécessitant un token valide
    Header: Authorization: Bearer <access_token>
    """
    current_user_id = get_jwt_identity()
    
    return jsonify({
        'message': 'Accès autorisé',
        'user_id': current_user_id
    }), 200


@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Récupérer les informations de l'utilisateur connecté
    Header: Authorization: Bearer <access_token>
    """
    current_user_id = get_jwt_identity()
    
    user = None
    for email, user_data in users_db.items():
        if user_data['id'] == current_user_id:
            user = user_data
            break
    
    if not user:
        return jsonify({'message': 'Utilisateur non trouvé'}), 404
    
    return jsonify({
        'id': user['id'],
        'email': user['email']
    }), 200


#========= ROUTES DE RECHERCHES INATURALIST ===========

def requestInaturalist(animal):
    url = "https://api.inaturalist.org/v1/taxa/autocomplete"
    params = {
        "q":animal,
        "per_page":1
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()

        if data['results']:
            animals = data['results'][0]
            return jsonify({
                'success': True,
                'common_name': animals.get("preferred_common_name"),
                'scientific_name': animals.get("name"),
                'data': animals
            })
        else:
            return jsonify({'success': False, 'message': 'Aucun résultat trouvé'}), 404

    else:
        return jsonify({'success': False, 'message': f'Erreur API: {response.status_code}'}), response.status_code

