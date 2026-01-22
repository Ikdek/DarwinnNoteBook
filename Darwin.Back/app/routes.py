from app import app, bcrypt, module_detection, db
from app.models import User
from flask import jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
import requests
from PIL import Image
import base64
import io


model_detection = app.config['MODEL_DETECTION']

@app.route('/')
@app.route('/index')
def index():
    return requestInaturalist("cheetah")

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
        'id': user['id'],
        'email': user['email']
    }), 200


#========= ROUTES DE RECHERCHES INATURALIST ===========

def requestInaturalist(animal):

    """
    :param animal: str (doit venir de notre modèle d'IA)
    :return: json avec les informations de l'animal en question
    """

    url = "https://api.inaturalist.org/v1/taxa/autocomplete"
    params = {
        "q":animal,
        "per_page":1,
        "locale":"fr"
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()

        if data['results']:
            animals = data['results'][0]
            return jsonify({
                'success': True,
                'animal_id': animals.get('id'),
                'common_name': animals.get("preferred_common_name"),
                'scientific_name': animals.get("name"),
                'observation_count': animals.get("observations_count"),
                "image_url": animals['default_photo']["medium_url"],
            })
        else:
            return jsonify({'success': False, 'message': 'Aucun résultat trouvé'}), 404

    else:
        return jsonify({'success': False, 'message': f'Erreur API: {response.status_code}'}), response.status_code

@app.route('/api/classification', methods=['POST'])
def classification():
    """
    Reçoit l'image du front-end et l'analyse dans le back-end
    :return: les informations de INaturalist si organisme ou alors une erreur si ce n'est pas un organisme
    """

    try:
        if 'image' in request.files:
            image_file = request.files['image']
            image = Image.open(image_file)
        elif 'imageData' in request.json:
            image_data = request.json['imageData'].split(',')[1]
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
        else:
            return jsonify({'error' : 'Aucune image fournie'}), 400

        predictions = model_detection(image)
        top_prediction = predictions[0]
        predicted_label = top_prediction['label'].split(', ')[0]
        score = top_prediction['score']

        if module_detection.is_this_an_organism(predicted_label):
            inaturalist_response = requestInaturalist(predicted_label)
            return inaturalist_response
        else:
            return jsonify({'error': 'L\'image ne correspond pas à un organisme vivant'}), 400

    except IOError:
        pass

