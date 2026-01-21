# Guide d'utilisation de l'API d'authentification Darwin

## Installation

```bash
# Activer l'environnement virtuel
source DarwinVENV/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

## Configuration

1. Générez une clé secrète sécurisée :
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

2. Modifiez le fichier `.env` et remplacez `JWT_SECRET_KEY` par votre clé générée

## Lancer l'application

```bash
python darwin.py
```

L'API sera accessible sur `http://localhost:5000`

## Endpoints disponibles

### 1. Inscription
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse (201):**
```json
{
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### 2. Connexion
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponse (200):**
```json
{
  "message": "Connexion réussie",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

### 3. Rafraîchir le token
```http
POST /api/refresh
Authorization: Bearer <refresh_token>
```

**Réponse (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 4. Déconnexion
```http
POST /api/logout
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "message": "Déconnexion réussie"
}
```

### 5. Route protégée (exemple)
```http
GET /api/protected
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "message": "Accès autorisé",
  "user_id": 1
}
```

### 6. Informations utilisateur
```http
GET /api/me
Authorization: Bearer <access_token>
```

**Réponse (200):**
```json
{
  "id": 1,
  "email": "user@example.com"
}
```

## Tests avec cURL

### Inscription
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Connexion
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Accéder à une route protégée
```bash
curl -X GET http://localhost:5000/api/protected \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Codes d'erreur

- **400** - Données manquantes ou invalides
- **401** - Identifiants invalides ou token expiré
- **404** - Ressource non trouvée
- **409** - Utilisateur déjà existant

## Notes importantes

⚠️ **Pour la production** :
- Remplacez la base de données simulée (`users_db`) par une vraie base de données (PostgreSQL, MongoDB, etc.)
- Utilisez une vraie base pour la blacklist des tokens (Redis recommandé)
- Activez HTTPS
- Ajoutez Flask-CORS si nécessaire
- Implémentez un rate limiting
- Validez les emails (format et vérification)
- Ajoutez des validations de complexité de mot de passe
