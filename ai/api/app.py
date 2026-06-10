import os
import sys
import json
import base64
import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing.sequence import pad_sequences

def find_workspace_root():
    current = os.path.dirname(os.path.abspath(__file__))
    while current != os.path.dirname(current):
        if os.path.exists(os.path.join(current, "setup.sh")) or os.path.exists(os.path.join(current, "ai")):
            return current
        current = os.path.dirname(current)
    # Fallback to parent directory of containing folder
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Determine absolute workspace root
base_dir = find_workspace_root()
ai_dir = os.path.join(base_dir, "ai")
api_dir = os.path.join(ai_dir, "api")

# Add paths to sys.path
sys.path.insert(0, ai_dir)
sys.path.insert(0, api_dir)

from utils.data_loader import load_tokenizer_pkl
from utils.gradcam import get_last_conv_layer_name, make_gradcam_heatmap, overlay_heatmap, get_image_base64
from utils.severity_rules import get_severity

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configure upload folder and limit file size to 5MB
UPLOAD_FOLDER = os.path.join(ai_dir, "outputs")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB Max size limit

# Paths
model_path = os.path.join(ai_dir, "models", "agro_disease_model.h5")
tokenizer_path = os.path.join(ai_dir, "data", "tokenizer.pkl")
class_names_path = os.path.join(ai_dir, "data", "class_names.json")
class_info_path = os.path.join(ai_dir, "data", "class_info.json")
treatment_db_path = os.path.join(ai_dir, "data", "treatment_db.json")

# Global resources
model = None
tokenizer = None
CLASSES = []
CLASS_INFO = {}
TREATMENTS = {}
last_conv_layer_name = None

def init_resources():
    global model, tokenizer, CLASSES, CLASS_INFO, TREATMENTS, last_conv_layer_name
    
    if model is None:
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Keras model not found at {model_path}")
        print(f"Loading Keras model from {model_path}...")
        model = tf.keras.models.load_model(model_path)
        last_conv_layer_name = get_last_conv_layer_name(model)
        print(f"Model loaded successfully. Last conv layer: {last_conv_layer_name}")
        
    if tokenizer is None:
        if not os.path.exists(tokenizer_path):
            raise FileNotFoundError(f"Tokenizer not found at {tokenizer_path}")
        print(f"Loading tokenizer from {tokenizer_path}...")
        tokenizer = load_tokenizer_pkl(tokenizer_path)
        
    if not CLASSES:
        if not os.path.exists(class_names_path):
            raise FileNotFoundError(f"Class names list not found at {class_names_path}")
        with open(class_names_path, "r") as f:
            CLASSES = json.load(f)
            
    if not CLASS_INFO:
        if not os.path.exists(class_info_path):
            raise FileNotFoundError(f"Class info map not found at {class_info_path}")
        with open(class_info_path, "r") as f:
            CLASS_INFO = json.load(f)
            
    if not TREATMENTS:
        if not os.path.exists(treatment_db_path):
            raise FileNotFoundError(f"Treatment DB not found at {treatment_db_path}")
        with open(treatment_db_path, "r") as f:
            TREATMENTS = json.load(f)

# Error handler for file size exceeding 5MB
@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"error": "File exceeds the maximum limit of 5MB."}), 400

@app.route("/predict", methods=["POST"])
def predict():
    temp_path = None
    try:
        init_resources()
        
        # 1. Input Validation: Check if 'image' is in request files
        if "image" not in request.files:
            return jsonify({"error": "No image file provided in multipart request."}), 400
            
        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Selected image file is empty."}), 400
            
        # Validate file type (jpg, png only)
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".jpg", ".jpeg", ".png"]:
            return jsonify({"error": "Invalid file type. Only JPG, JPEG, and PNG are allowed."}), 400
            
        # Save image temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        # 2. Preprocessing Image
        img = cv2.imread(temp_path)
        if img is None:
            return jsonify({"error": "Failed to decode the uploaded image file."}), 400
            
        resized_img = cv2.resize(img, (224, 224))
        img_array = np.expand_dims(resized_img.astype(np.float32) / 255.0, axis=0)
        
        # 3. Preprocessing Text Symptoms
        # Accept 'symptoms' key from request form (optional)
        symptoms_text = request.form.get("symptoms", "")
        if symptoms_text.strip() == "":
            sequences = [[]]
        else:
            sequences = tokenizer.texts_to_sequences([symptoms_text])
            
        padded_text = pad_sequences(sequences, maxlen=50, padding="post")
        
        # 4. Keras Model Inference
        predictions = model.predict({"image_input": img_array, "text_input": padded_text}, verbose=0)
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        raw_class_name = CLASSES[class_idx]
        
        # Determine Display Name
        info = CLASS_INFO.get(raw_class_name, {})
        crop = info.get("crop", "")
        disease = info.get("disease_name", "")
        if disease.lower() == "healthy":
            display_name = f"Healthy {crop}"
        elif crop.lower() in disease.lower():
            display_name = disease
        else:
            display_name = f"{crop} {disease}"
            
        # 5. Severity lookup
        severity = get_severity(confidence)
        
        # 6. Treatment lookup
        treatment = TREATMENTS.get(raw_class_name, "No specific treatment found. Keep monitoring the crop.")
        
        # 7. Top 3 predictions listing
        top_indices = np.argsort(predictions[0])[::-1][:3]
        top_3_predictions = []
        for idx in top_indices:
            c_raw = CLASSES[idx]
            c_conf = float(predictions[0][idx])
            c_info = CLASS_INFO.get(c_raw, {})
            c_crop = c_info.get("crop", "")
            c_dis = c_info.get("disease_name", "")
            
            if c_dis.lower() == "healthy":
                c_display = f"Healthy {c_crop}"
            elif c_crop.lower() in c_dis.lower():
                c_display = c_dis
            else:
                c_display = f"{c_crop} {c_dis}"
                
            top_3_predictions.append({
                "class": c_raw,
                "disease": c_display,
                "confidence": round(c_conf, 4)
            })
            
        # 8. Grad-CAM base64 generation
        heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name, padded_text)
        overlay_img = overlay_heatmap(temp_path, heatmap)
        base64_heatmap = get_image_base64(overlay_img)
        
        # Clean up temporary file
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
                
        # 9. Return JSON Response matching specifications exactly
        return jsonify({
            "disease": display_name,
            "confidence": round(confidence, 4),
            "severity": severity,
            "top_3_predictions": top_3_predictions,
            "treatment": treatment,
            "grad_cam_image": base64_heatmap
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Clean up temp file in case of crash
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
        return jsonify({"error": f"Model inference error: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health():
    try:
        init_resources()
        model_loaded = (model is not None)
    except Exception:
        model_loaded = False
        
    return jsonify({
        "status": "ok",
        "model_loaded": model_loaded
    }), 200

@app.route("/classes", methods=["GET"])
def get_classes():
    try:
        init_resources()
        return jsonify(CLASSES), 200
    except Exception as e:
        return jsonify({"error": f"Failed to retrieve classes: {str(e)}"}), 500

if __name__ == "__main__":
    # Pre-load resources before running development server
    try:
        init_resources()
    except Exception as e:
        print(f"[WARNING] Could not pre-load model/tokenizer: {e}")
    app.run(host="0.0.0.0", port=5001, debug=False)
