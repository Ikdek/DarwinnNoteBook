from datetime import datetime

from app import db


from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class Scan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    inaturalist_response = db.Column(db.Text, nullable=True)

class Species(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    scientific_name = db.Column(db.String(255), unique=True, nullable=False)
    common_name = db.Column(db.String(255))
    image_url = db.Column(db.String(255))
    inaturalist_id = db.Column(db.Integer)
    observation_count = db.Column(db.Integer)

class Collection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    idUser = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    animal_id = db.Column(db.Integer(5), nullable=False)
    animal_common_name = db.Column(db.String(120), nullable=False)
    animal_scientific_name = db.Column(db.String(120), nullable=False)
    rarity = db.Column(db.String(120), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
