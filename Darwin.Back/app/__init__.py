from flask import Flask
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from datetime import timedelta
from dotenv import load_dotenv
import os
from transformers import pipeline


# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

model_detection = pipeline("image-classification", model="google/vit-base-patch16-224")
app.config['MODEL_DETECTION'] = model_detection

from app import routes