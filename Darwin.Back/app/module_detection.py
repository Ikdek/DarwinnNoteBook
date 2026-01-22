import nltk
from nltk.corpus import wordnet


try:
    nltk.data.find('corpora/wordnet.zip')
except LookupError:
    nltk.download('wordnet')
    nltk.download('omw-1.4')


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

def load_animal():
    """
    Dans l'idée, cette fonction servira à charger les animaux depuis une base de données et non depuis l'API de INaturalist.
    """
    pass

def save_animal():
    """
    Dans l'idée, cette fonction servira à sauvegarder les animaux dans une base de données pour s'en servir au prochain scan
    """
    pass