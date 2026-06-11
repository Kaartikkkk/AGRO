import os
import sys
import time
import json
import pickle
import numpy as np
from PIL import Image
import io
import cv2
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS

# Setup python path to include ai folder
API_DIR = os.path.dirname(os.path.abspath(__file__))
AI_DIR = os.path.dirname(API_DIR)
sys.path.insert(0, AI_DIR)

from api.config import (
    MODEL_DIR, DATA_DIR, PRIMARY_MODEL, FALLBACK_MODEL, 
    PORT, DEBUG, MAX_CONTENT_LENGTH, MAX_TEXT_LEN
)
from utils.gradcam import generate_gradcam

app = Flask(__name__)
CORS(app)
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Global resources loaded on startup
model = None
model_version = ""
class_names = []
class_display_names = {}
treatment_db = {}
tokenizer = None
start_time = time.time()

def init_resources():
    global model, model_version, class_names, class_display_names, treatment_db, tokenizer
    
    # 1. Determine best model via model_info.json
    model_info_path = os.path.join(MODEL_DIR, "model_info.json")
    primary_path = os.path.join(MODEL_DIR, PRIMARY_MODEL)
    fallback_path = os.path.join(MODEL_DIR, FALLBACK_MODEL)
    
    selected_model_path = primary_path
    
    if os.path.exists(model_info_path):
        try:
            with open(model_info_path, "r") as f:
                info = json.load(f)
            primary_acc = info.get(PRIMARY_MODEL, {}).get("validation_accuracy", 0.0)
            fallback_acc = info.get(FALLBACK_MODEL, {}).get("validation_accuracy", 0.0)
            
            if fallback_acc > primary_acc:
                selected_model_path = fallback_path
                print(f"[INFO] Fallback model has higher validation accuracy: {fallback_acc:.4f} vs {primary_acc:.4f}")
            else:
                selected_model_path = primary_path
                print(f"[INFO] Primary model selected with validation accuracy: {primary_acc:.4f}")
        except Exception as e:
            print(f"[WARNING] Could not parse model_info.json: {e}. Defaulting to primary model.")
            
    # Try loading selected model, fallback if it fails
    try:
        print(f"Loading Keras model from {selected_model_path}...")
        model = tf.keras.models.load_model(selected_model_path, compile=False)
        model_version = os.path.splitext(os.path.basename(selected_model_path))[0]
    except Exception as e:
        print(f"[ERROR] Failed to load model {selected_model_path}: {e}")
        alternative_path = fallback_path if selected_model_path == primary_path else primary_path
        print(f"Attempting to load alternative model from {alternative_path}...")
        try:
            model = tf.keras.models.load_model(alternative_path, compile=False)
            selected_model_path = alternative_path
            model_version = os.path.splitext(os.path.basename(selected_model_path))[0]
        except Exception as alt_e:
            print(f"[CRITICAL] Failed to load both models: {alt_e}")
            raise alt_e

    print(f"✓ Model loaded: {selected_model_path}")
    
    # 2. Load class names
    class_names_path = os.path.join(DATA_DIR, "class_names.json")
    if os.path.exists(class_names_path):
        with open(class_names_path, "r") as f:
            class_names = json.load(f)
        print(f"✓ Classes: {len(class_names)} diseases")
    else:
        raise FileNotFoundError(f"Required class_names.json not found at {class_names_path}")
        
    # 3. Load display names mapping
    display_names_path = os.path.join(DATA_DIR, "class_display_names.json")
    if os.path.exists(display_names_path):
        with open(display_names_path, "r") as f:
            class_display_names = json.load(f)
            
    # 4. Load treatment database
    treatment_db_path = os.path.join(DATA_DIR, "treatment_db.json")
    if os.path.exists(treatment_db_path):
        with open(treatment_db_path, "r") as f:
            treatment_db = json.load(f)
            
    # 5. Load tokenizer
    tokenizer_path = os.path.join(DATA_DIR, "tokenizer.pkl")
    if os.path.exists(tokenizer_path):
        with open(tokenizer_path, "rb") as f:
            tokenizer = pickle.load(f)
        print("✓ Tokenizer loaded successfully")
    else:
        print("[INFO] Tokenizer not found. Running in unimodal fallback.")

# Pre-load resources on startup
try:
    init_resources()
except Exception as init_err:
    print(f"[CRITICAL] Server failed to initialize resources: {init_err}")

def is_crop_match(raw_class_name, user_crop, class_display_names_map):
    if not user_crop:
        return True
    
    # Get standard crop name from class_display_names mapping if available
    disp_info = class_display_names_map.get(raw_class_name, {})
    class_crop = disp_info.get("crop", "").lower()
    
    # Fallback to parsing raw class name if not in display map
    if not class_crop:
        class_crop = raw_class_name.split("___")[0].replace("_", " ").lower()
        
    user_crop_lower = user_crop.lower()
    
    # Handle common synonyms/sub-string matches
    if user_crop_lower in class_crop or class_crop in user_crop_lower:
        return True
    if "maize" in user_crop_lower and "corn" in class_crop:
        return True
    if "corn" in user_crop_lower and "maize" in class_crop:
        return True
    if "pepper" in user_crop_lower and "pepper" in class_crop:
        return True
    return False

@app.route("/predict", methods=["POST"])
def predict():
    start_time_ms = time.time()
    
    if model is None:
        return jsonify({"error": "Model not available"}), 503
        
    # 1. File Validation
    if "image" not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No image provided"}), 400
        
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
        return jsonify({"error": "Invalid file type. Use JPG, PNG, or WEBP"}), 400
        
    try:
        # 2. Image Preprocessing
        img_bytes = file.read()
        pil_image = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        
        # Get target input size from model dynamically
        input_shape = model.inputs[0].shape
        target_size = (input_shape[1], input_shape[2]) if input_shape[1] is not None else (224, 224)
        
        resized_pil = pil_image.resize(target_size)
        img_array = np.array(resized_pil, dtype=np.float32)
        
        # Check if the model has a Rescaling layer internally
        has_rescaling = False
        for layer in model.layers:
            if "rescaling" in layer.name:
                has_rescaling = True
                break
                
        if not has_rescaling:
            img_array = img_array / 255.0
            
        img_array = np.expand_dims(img_array, axis=0) # shape (1, H, W, 3)
        
        # 3. Text Preprocessing (for multimodal models)
        is_multimodal = (len(model.inputs) > 1)
        text_array = None
        symptoms = request.form.get("symptoms", "").strip()
        crop_type = request.form.get("crop_type", "").strip()
        
        if is_multimodal:
            # Combine crop details and symptoms to guide multimodal text branch
            combined_text = symptoms
            if crop_type:
                combined_text = f"{crop_type} leaf. {symptoms}".strip() if symptoms else f"{crop_type} leaf"
                
            if combined_text.strip() and tokenizer is not None:
                seq = tokenizer.texts_to_sequences([combined_text])
                padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=MAX_TEXT_LEN, padding="post")
                text_array = padded_seq.astype(np.int32)
            else:
                text_array = np.zeros((1, MAX_TEXT_LEN), dtype=np.int32)
                
        # 4. Inference
        if is_multimodal:
            predictions = model.predict({"image_input": img_array, "text_input": text_array}, verbose=0)
        else:
            predictions = model.predict(img_array, verbose=0)
            
        # 5. Apply User Crop Prior Mask if crop_type is provided
        if crop_type:
            mask = np.array([is_crop_match(c, crop_type, class_display_names) for c in class_names], dtype=np.float32)
            if np.sum(mask) > 0:
                predictions = predictions * mask
                sum_preds = np.sum(predictions[0])
                if sum_preds > 0:
                    predictions = predictions / sum_preds
                    print(f"[INFO] Constrained prediction search space to crop '{crop_type}' ({int(np.sum(mask))} classes)")
            else:
                print(f"[WARNING] Crop filter '{crop_type}' requested, but zero matching classes found in display mapping.")

        # 6. Post-Processing predictions
        class_idx = int(np.argmax(predictions[0]))
        confidence = float(predictions[0][class_idx])
        raw_class_name = class_names[class_idx]
        
        # Get display names details
        disp_info = class_display_names.get(raw_class_name, {})
        disease_clean = disp_info.get("disease", raw_class_name.split("___")[-1].replace("_", " "))
        crop = disp_info.get("crop", raw_class_name.split("___")[0].replace("_", " "))
        is_healthy = disp_info.get("is_healthy", "healthy" in raw_class_name.lower())
        
        if is_healthy:
            disease_display = f"Healthy {crop}"
        else:
            disease_display = f"{crop} {disease_clean}"
            
        # Top 3 classes
        top_3_indices = np.argsort(predictions[0])[-3:][::-1]
        top_3 = []
        for i, idx in enumerate(top_3_indices):
            c_name = class_names[idx]
            c_conf = float(predictions[0][idx])
            c_info = class_display_names.get(c_name, {})
            c_disease = c_info.get("disease", c_name.split("___")[-1].replace("_", " "))
            c_crop = c_info.get("crop", c_name.split("___")[0].replace("_", " "))
            c_healthy = c_info.get("is_healthy", "healthy" in c_name.lower())
            
            c_display = f"Healthy {c_crop}" if c_healthy else f"{c_crop} {c_disease}"
            
            top_3.append({
                "rank": i + 1,
                "disease": c_display,
                "confidence": round(c_conf, 4),
                "confidence_percent": f"{int(c_conf * 100)}%"
            })
            
        # 6. Severity Mapping
        if is_healthy:
            severity = "Low"
        elif confidence > 0.85:
            severity = "High"
        elif confidence >= 0.60:
            severity = "Medium"
        else:
            severity = "Low — please retake photo"
            
        # 7. Treatment Database Lookup
        treat_info = treatment_db.get(raw_class_name, {})
        treatment_response = {
            "name": f"{disease_display} Treatment",
            "immediate_action": treat_info.get("immediate_action", "No immediate actions listed."),
            "fungicide": treat_info.get("fungicide", "N/A"),
            "dosage": treat_info.get("dosage", "N/A"),
            "frequency": treat_info.get("frequency", "N/A"),
            "prevention": ", ".join(treat_info.get("prevention", ["Monitor crops closely"])) if isinstance(treat_info.get("prevention"), list) else treat_info.get("prevention", "No prevention tips listed"),
            "fertilizer_advice": treat_info.get("fertilizer_advice", "No specific fertilizer advice.")
        }
        
        # 8. Grad-CAM generation
        img_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        grad_cam_base64 = generate_gradcam(
            model=model,
            img_array=img_array,
            class_idx=class_idx,
            text_array=text_array,
            original_img=img_cv
        )
        
        processing_time_ms = int((time.time() - start_time_ms) * 1000)
        
        return jsonify({
            "success": True,
            "prediction": {
                "disease": disease_display,
                "disease_clean": disease_clean,
                "crop": crop,
                "confidence": round(confidence, 4),
                "confidence_percent": f"{int(confidence * 100)}%",
                "severity": severity,
                "is_healthy": is_healthy
            },
            "top_3": top_3,
            "treatment": treatment_response,
            "grad_cam_image": grad_cam_base64,
            "processing_time_ms": processing_time_ms,
            "model_version": model_version
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500

@app.route("/health", methods=["GET"])
def health():
    # Detect hardware device
    device = "GPU" if len(tf.config.list_physical_devices('GPU')) > 0 else "CPU"
    uptime = int(time.time() - start_time)
    
    return jsonify({
        "status": "ok",
        "model_loaded": (model is not None),
        "model_name": PRIMARY_MODEL if model_version == os.path.splitext(PRIMARY_MODEL)[0] else FALLBACK_MODEL,
        "num_classes": len(class_names),
        "device": device,
        "uptime_seconds": uptime
    }), 200

@app.route("/classes", methods=["GET"])
def get_classes():
    # Extract unique crops from display names
    crops = sorted(list(set(info.get("crop", "Unknown") for info in class_display_names.values())))
    classes_display = [
        f"{info.get('crop')} {info.get('disease')}" if not info.get('is_healthy') else f"Healthy {info.get('crop')}"
        for info in class_display_names.values()
    ]
    
    return jsonify({
        "classes": classes_display if classes_display else class_names,
        "total": len(class_names),
        "crops_covered": crops
    }), 200

@app.route("/model-info", methods=["GET"])
def model_info():
    is_multimodal = (model is not None and len(model.inputs) > 1)
    input_shape = [int(x) if x is not None else -1 for x in model.inputs[0].shape] if model is not None else [224, 224, 3]
    
    available_files = []
    if os.path.exists(MODEL_DIR):
        available_files = [f for f in os.listdir(MODEL_DIR) if f.endswith(".keras") or f.endswith(".h5")]
        
    return jsonify({
        "primary_model": PRIMARY_MODEL,
        "available_models": available_files,
        "input_shape": input_shape[1:4] if len(input_shape) > 3 else [224, 224, 3],
        "is_multimodal": is_multimodal,
        "classes": len(class_names)
    }), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
