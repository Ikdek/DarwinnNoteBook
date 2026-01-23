import nltk
from nltk.corpus import wordnet


try:
    nltk.data.find('corpora/wordnet.zip')
except LookupError:
    nltk.download('wordnet')
    nltk.download('omw-1.4')


from app import db
from app.models import Species

def is_this_an_organism(predicted_label):
    """
    :param predicted_label: str
    :return: bool
    Détermine si le label prédit correspond à un organisme vivant en utilisant WordNet.
    """
    formatted_label = predicted_label.split(',')[0].replace(' ', '_').lower()
    synsets = wordnet.synsets(formatted_label)
    
    if not synsets:
        return False
    
    for synset in synsets:
        for path in synset.hypernym_paths():
            for ancestor in path:
                if ancestor.name() == 'organism.n.01':
                    return True
    return False

def load_animal(name):
    """
    Charge les informations d'un animal depuis la base de données.
    :param name: str (nom scientifique ou commun)
    :return: dict or None
    """
    # Recherche par nom scientifique ou nom commun
    species = Species.query.filter(
        (Species.scientific_name == name) | 
        (Species.common_name == name)
    ).first()
    
    if species:
        return {
            'success': True,
            'animal_id': species.inaturalist_id,
            'common_name': species.common_name,
            'scientific_name': species.scientific_name,
            'observation_count': species.observation_count,
            'image_url': species.image_url,
            'source': 'local_db'
        }
    return None

def save_animal(data):
    """
    Sauvegarde les informations d'un animal dans la base de données.
    :param data: dict (données renvoyées par iNaturalist)
    """
    try:
        # Vérifier si l'animal existe déjà
        scientific_name = data.get('scientific_name')
        if not scientific_name:
            return

        existing_species = Species.query.filter_by(scientific_name=scientific_name).first()
        if existing_species:
            return

        new_species = Species(
            scientific_name=scientific_name,
            common_name=data.get('common_name'),
            image_url=data.get('image_url'),
            inaturalist_id=data.get('animal_id'),
            observation_count=data.get('observation_count')
        )
        db.session.add(new_species)
        db.session.commit()
    except Exception as e:
        print(f"Erreur lors de la sauvegarde de l'espèce: {e}")
        db.session.rollback()
