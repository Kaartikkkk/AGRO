import os

# Base paths relative to the api directory
API_DIR = os.path.dirname(os.path.abspath(__file__))
AI_DIR = os.path.dirname(API_DIR)

MODEL_DIR = os.path.join(AI_DIR, 'models')
DATA_DIR = os.path.join(AI_DIR, 'data')

PRIMARY_MODEL = 'plant_disease_model_final.keras'
FALLBACK_MODEL = 'agro_disease_model.h5'
IMG_SIZE = (224, 224)
MAX_TEXT_LEN = 50
VOCAB_SIZE = 5000
PORT = 5001
DEBUG = False
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10MB
