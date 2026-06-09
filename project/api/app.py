import os
import sys
import numpy as np
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Add parent directory to path so we can import our modules
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)

from data_loader import load_tokenizer_pkl
from data_preprocessing import CLASSES
from explain import get_last_conv_layer_name, make_gradcam_heatmap, overlay_heatmap, get_image_base64

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# Configuration
UPLOAD_FOLDER = os.path.join(base_dir, "outputs")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Master Treatment Dictionary (no placeholders, all 38 classes defined)
TREATMENTS = {
    "Apple___Apple_scab": "Remove fallen leaves in autumn to reduce spores. Apply copper-based fungicides or sulfur sprays in early spring.",
    "Apple___Black_rot": "Prune out dead wood, cankers, and mummified fruit during dormancy. Spray with labeled fungicides from green tip stage through harvest.",
    "Apple___Cedar_apple_rust": "Remove nearby juniper/red cedar trees if possible. Apply protective fungicides like myclobutanil at blossom time.",
    "Apple___healthy": "Maintain standard orchard sanitation, annual pruning, and routine scouting. No chemical treatments needed.",
    "Blueberry___healthy": "Continue soil testing for acidity (pH 4.5-5.2), keep soil well-mulched and watered. No disease detected.",
    "Cherry_(including_sour)___Powdery_mildew": "Prune trees to improve air circulation. Apply sulfur or potassium bicarbonate fungicides at the first sign of mildew.",
    "Cherry_(including_sour)___healthy": "Continue monitoring, prune to maintain open canopy for sunlight and air flow. No disease detected.",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Plant resistant hybrids. Practice crop rotation and bury crop residue by tillage. Apply triazole fungicides if severe.",
    "Corn_(maize)___Common_rust_": "Usually doesn't require treatment. In severe cases or seed production fields, apply strobilurin or triazole fungicides.",
    "Corn_(maize)___Northern_Leaf_Blight": "Use resistant hybrids. Rotate crops and plow under infected residue. Spray fungicides if lesions appear before silking.",
    "Corn_(maize)___healthy": "Ensure adequate nitrogen and irrigation. Keep field clean of weeds. No disease detected.",
    "Grape___Black_rot": "Remove mummified berries and infected canes. Apply fungicides like mancozeb or myclobutanil starting at bud break.",
    "Grape___Esca_(Black_Measles)": "Protect pruning wounds with sealing paste. Remove and burn dead wood. In young vines, optimize soil drainage.",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Rake and burn fallen leaves. Maintain open canopy. Apply copper fungicides if infection spreads during wet weather.",
    "Grape___healthy": "Maintain trellis training, prune annually, and ensure proper spacing. No disease detected.",
    "Orange___Haunglongbing_(Citrus_greening)": "Citrus greening is incurable. Control the Asian citrus psyllid vector using systemic insecticides. Remove infected trees immediately.",
    "Peach___Bacterial_spot": "Apply copper sprays during dormancy and early spring. Avoid excessive nitrogen fertilizer. Plant resistant varieties.",
    "Peach___healthy": "Prune annually to open up center of tree for sunlight. Thin fruit early. No disease detected.",
    "Pepper,_bell___Bacterial_spot": "Use certified disease-free seeds. Avoid overhead watering. Apply copper-based sprays early in the season when conditions are wet.",
    "Pepper,_bell___healthy": "Maintain consistent watering, mulch soil, and monitor for pests like aphids. No disease detected.",
    "Potato___Early_blight": "Apply chlorothalonil or mancozeb fungicides. Rotate crops with non-solanaceous plants. Ensure balanced nitrogen nutrition.",
    "Potato___Late_blight": "Apply protective copper fungicides. Destroy volunteer potatoes and cull piles. Harvest only when vines are completely dead.",
    "Potato___healthy": "Keep soil hilled around potatoes, ensure good drainage, and monitor for beetles. No disease detected.",
    "Raspberry___healthy": "Prune old canes after harvest, thin canes to improve air circulation, and mulch. No disease detected.",
    "Soybean___healthy": "Monitor for soybean aphids and rust. Maintain crop rotation. No disease detected.",
    "Squash___Powdery_mildew": "Apply horticultural oils, neem oil, or sulfur fungicides. Plant squash in full sun and space plants to ensure air circulation.",
    "Strawberry___Leaf_scorch": "Plant resistant cultivars. Remove infected leaves. Avoid overhead watering and renovate beds immediately after harvest.",
    "Strawberry___healthy": "Mulch with clean straw, keep berries off soil, and prune runners. No disease detected.",
    "Tomato___Bacterial_spot": "Rotate crops, avoid overhead irrigation, and apply copper-mancozeb sprays. Remove severely infected plants immediately.",
    "Tomato___Early_blight": "Prune lower leaves. Apply preventative copper fungicides. Mulch base of plant to stop soil splash. Space plants.",
    "Tomato___Late_blight": "Apply copper-based fungicides immediately. Destroy all infected plants to prevent airborne spread. Plant resistant varieties.",
    "Tomato___Leaf_Mold": "Ensure good air flow in greenhouse. Maintain relative humidity below 85%. Apply preventative fungicides like chlorothalonil.",
    "Tomato___Septoria_leaf_spot": "Avoid overhead watering. Clean up stakes and cages at end of season. Apply copper fungicides or chlorothalonil.",
    "Tomato___Spider_mites Two-spotted_spider_mite": "Spray leaves with insecticidal soap, neem oil, or miticides. Keep plants watered as dry conditions favor spider mites.",
    "Tomato___Target_Spot": "Improve air circulation. Apply fungicides like chlorothalonil or azoxystrobin. Clean up crop debris post-harvest.",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Control whitefly vectors using systemic insecticides or insecticidal soaps. Use silver reflective mulches and remove infected plants.",
    "Tomato___Tomato_mosaic_virus": "Mosaic virus has no cure. Remove and burn infected plants. Wash hands and tools with soap after handling plants. Use resistant seeds.",
    "Tomato___healthy": "Prune suckers, tie to stakes, water at base of plant, and feed with calcium-rich fertilizer. No disease detected."
}

# Lazy loading of model and tokenizer
model = None
tokenizer = None
last_conv_layer_name = None

def init_resources():
    global model, tokenizer, last_conv_layer_name
    if model is None:
        model_path = os.path.join(base_dir, "models", "plant_disease_model_final.keras")
        print(f"Loading Keras model from {model_path}...")
        model = tf.keras.models.load_model(model_path)
        last_conv_layer_name = get_last_conv_layer_name(model)
        print(f"Model loaded. Final convolutional layer: {last_conv_layer_name}")
        
    if tokenizer is None:
        tokenizer_path = os.path.join(base_dir, "outputs", "tokenizer.pkl")
        print(f"Loading tokenizer from {tokenizer_path}...")
        tokenizer = load_tokenizer_pkl(tokenizer_path)

def estimate_severity(disease_name, confidence, text_symptoms):
    """
    Heuristic to estimate severity based on model confidence and text symptoms.
    """
    if "healthy" in disease_name.lower():
        return "Healthy"
        
    text_lower = text_symptoms.lower()
    severe_keywords = ["severe", "widespread", "dying", "rotting", "collapsed", "black", "dead"]
    
    # Check text for critical keywords and high confidence
    is_severe_text = any(kw in text_lower for kw in severe_keywords)
    
    if confidence > 0.85 and is_severe_text:
        return "Severe"
    elif confidence > 0.70 or is_severe_text:
        return "Moderate"
    else:
        return "Mild"

@app.route("/predict", methods=["POST"])
def predict():
    try:
        init_resources()
        
        # 1. Validate Image Input
        if "image" not in request.files:
            return jsonify({"error": "No image file provided in multipart request."}), 400
            
        file = request.files["image"]
        if file.filename == "":
            return jsonify({"error": "Selected image file is empty."}), 400
            
        # Save uploaded image temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(temp_path)
        
        # 2. Process image for model
        # Read and decode image using OpenCV to ensure exact shape matching
        img = cv2 = None
        import cv2
        img = cv2.imread(temp_path)
        if img is None:
            return jsonify({"error": "Invalid image file format."}), 400
            
        resized_img = cv2.resize(img, (224, 224))
        img_array = np.expand_dims(resized_img.astype(np.float32) / 255.0, axis=0)
        
        # 3. Process Text Symptoms Input
        text_symptoms = request.form.get("text_symptoms", "")
        if text_symptoms.strip() == "":
            # Pass blank sequence representing no textual symptoms
            sequences = [[]]
        else:
            sequences = tokenizer.texts_to_sequences([text_symptoms])
            
        padded_text = pad_sequences(sequences, maxlen=50, padding="post")
        
        # 4. Perform Inference
        predictions = model.predict({"image_input": img_array, "text_input": padded_text})
        class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][class_idx])
        disease_name = CLASSES[class_idx]
        
        # 5. Severity and Treatment Lookup
        severity = estimate_severity(disease_name, confidence, text_symptoms)
        treatment = TREATMENTS.get(disease_name, "Ensure crop monitoring. No standard treatment found.")
        
        # 6. Generate Explainability Overlay (Grad-CAM)
        heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name, padded_text)
        overlay_img = overlay_heatmap(temp_path, heatmap)
        base64_heatmap = get_image_base64(overlay_img)
        
        # Cleanup temporary uploaded file
        try:
            os.remove(temp_path)
        except OSError:
            pass
            
        # 7. Assemble Response
        response = {
            "disease": disease_name.replace("___", " ").replace("_", " "),
            "confidence": round(confidence, 4),
            "severity": severity,
            "treatment": treatment,
            "heatmap_url": base64_heatmap
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Inference execution failed: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
