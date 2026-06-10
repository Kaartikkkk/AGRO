import os
import cv2
import random
import pickle
import numpy as np
import pandas as pd
from tqdm import tqdm
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

# --- 38 Primary Classes ---
CLASSES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy",
    "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
    "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)",
    "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
    "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
    "Raspberry___healthy",
    "Soybean___healthy",
    "Squash___Powdery_mildew",
    "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

CLASS_TO_IDX = {cls: idx for idx, cls in enumerate(CLASSES)}

# --- PlantDoc Class Mapping ---
PLANTDOC_MAPPING = {
    "Apple Scab Leaf": "Apple___Apple_scab",
    "Apple leaf": "Apple___healthy",
    "Apple rust leaf": "Apple___Cedar_apple_rust",
    "Bell_pepper leaf": "Pepper,_bell___healthy",
    "Bell_pepper leaf spot": "Pepper,_bell___Bacterial_spot",
    "Blueberry leaf": "Blueberry___healthy",
    "Cherry leaf": "Cherry_(including_sour)___healthy",
    "Corn Gray leaf spot": "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "Corn leaf blight": "Corn_(maize)___Northern_Leaf_Blight",
    "Corn rust leaf": "Corn_(maize)___Common_rust_",
    "Peach leaf": "Peach___healthy",
    "Potato leaf early blight": "Potato___Early_blight",
    "Potato leaf late blight": "Potato___Late_blight",
    "Raspberry leaf": "Raspberry___healthy",
    "Soyabean leaf": "Soybean___healthy",
    "Squash Powdery mildew leaf": "Squash___Powdery_mildew",
    "Strawberry leaf": "Strawberry___healthy",
    "Tomato Early blight leaf": "Tomato___Early_blight",
    "Tomato Septoria leaf spot": "Tomato___Septoria_leaf_spot",
    "Tomato leaf": "Tomato___healthy",
    "Tomato leaf bacterial spot": "Tomato___Bacterial_spot",
    "Tomato leaf late blight": "Tomato___Late_blight",
    "Tomato leaf mosaic virus": "Tomato___Tomato_mosaic_virus",
    "Tomato leaf yellow virus": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato mold leaf": "Tomato___Leaf_Mold",
    "Tomato two spotted spider mites leaf": "Tomato___Spider_mites Two-spotted_spider_mite",
    "grape leaf": "Grape___healthy",
    "grape leaf black rot": "Grape___Black_rot"
}

# --- Base Keywords per Disease for 500 Sentences Generation ---
BASE_KEYWORDS = {
    "Apple___Apple_scab": ["olive-green velvety spots", "curling leaves dropping early", "brown lesions on foliage"],
    "Apple___Black_rot": ["circular purple spots", "frog-eye spots with dark margins", "black pycnidia on dead tissue"],
    "Apple___Cedar_apple_rust": ["bright orange-yellow spots on top of leaf", "orange gelatinous cups on leaf bottom", "rust-colored spots on upper leaf surface"],
    "Apple___healthy": ["healthy green apple leaves", "clean apple foliage", "vibrant green apple leaves with no spots"],
    "Blueberry___healthy": ["healthy green blueberry leaves", "clean foliage with no spots", "vibrant blueberry leaf surface"],
    "Cherry_(including_sour)___Powdery_mildew": ["white powdery patch of fungal growth", "leaves distorted and curling upward", "powdery coating on cherry foliage"],
    "Cherry_(including_sour)___healthy": ["clean cherry leaves", "healthy smooth cherry foliage", "vibrant cherry foliage with no spots"],
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": ["gray-to-tan rectangular spots parallel to veins", "narrow lesions on corn leaves", "gray leaf spot parallel to leaf veins"],
    "Corn_(maize)___Common_rust_": ["golden-brown to red-brown pustules on both leaf surfaces", "red-brown common rust pustules", "round rust-colored blisters on foliage"],
    "Corn_(maize)___Northern_Leaf_Blight": ["long elliptical grayish-green lesions", "cigar-shaped lesions on corn foliage", "gray-green northern leaf blight spots"],
    "Corn_(maize)___healthy": ["clean corn foliage", "healthy green corn leaves", "vibrant corn leaves with straight margins"],
    "Grape___Black_rot": ["small round reddish-brown spots", "black pycnidia dotting the grape lesions", "reddish-brown spots on grape foliage"],
    "Grape___Esca_(Black_Measles)": ["tiger-stripe chlorosis on grape leaves", "yellowing grape leaf margins", "tiger-stripe pattern with dry edges"],
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": ["asymmetrical dull brown spots starting from margins", "asymmetrical leaf blight patches", "dull brown spots spreading across the grape leaf"],
    "Grape___healthy": ["healthy grape leaves with lobed structure", "clean grape foliage", "vibrant green grape leaves"],
    "Orange___Haunglongbing_(Citrus_greening)": ["asymmetrical yellow mottling on orange leaves", "upright chlorotic leaves with green veins", "citrus greening yellow mottling"],
    "Peach___Bacterial_spot": ["small water-soaked reddish-brown spots", "shot-hole appearance on peach leaves", "water-soaked bacterial lesions"],
    "Peach___healthy": ["clean peach leaves", "healthy smooth peach foliage", "vibrant peach foliage with no spots"],
    "Pepper,_bell___Bacterial_spot": ["small circular water-soaked spots on pepper leaves", "scab-like dark lesions causing yellowing", "bell pepper leaf spots with yellow halo"],
    "Pepper,_bell___healthy": ["glossy deep green pepper leaves", "healthy pepper foliage with no spots", "clean bell pepper leaf surface"],
    "Potato___Early_blight": ["dark spots with concentric rings on older leaves", "target-board pattern early blight spots", "circular spots with concentric target rings"],
    "Potato___Late_blight": ["large irregular water-soaked dark lesions", "white fuzzy mold on potato leaf underside", "oily dark green to black potato lesions"],
    "Potato___healthy": ["clean potato foliage", "healthy compound potato leaves", "vibrant green potato leaves"],
    "Raspberry___healthy": ["healthy green raspberry leaves", "clean raspberry foliage with serrated margins", "vibrant raspberry foliage"],
    "Soybean___healthy": ["healthy green trifoliate soybean leaves", "clean soybean foliage", "vibrant green soybean leaves with no yellowing"],
    "Squash___Powdery_mildew": ["white to gray talcum-like powdery patches", "powdery coating on squash leaves and stems", "talcum-like white mold on squash foliage"],
    "Strawberry___Leaf_scorch": ["purple-to-brown spots on strawberry leaves", "scorch marks causing leaves to dry and curl", "strawberry leaf scorch spots"],
    "Strawberry___healthy": ["healthy green strawberry leaves", "clean strawberry foliage", "vibrant strawberry leaves with no spots"],
    "Tomato___Bacterial_spot": ["small dark greasy-looking spots with yellow halos", "bacterial spots causing tomato leaf drop", "greasy tomato leaf lesions"],
    "Tomato___Early_blight": ["dark target-like spots with concentric rings", "tomato early blight spots on older leaves", "concentric target-board spots on tomato foliage"],
    "Tomato___Late_blight": ["large dark brown oily tomato lesions", "fuzzy white mold on tomato leaf underside", "late blight oily lesions on tomato foliage"],
    "Tomato___Leaf_Mold": ["pale green or yellow spots on upper tomato leaf", "olive-green velvety mold on tomato leaf underside", "tomato leaf mold velvety spots"],
    "Tomato___Septoria_leaf_spot": ["numerous small circular spots with dark borders", "septoria spots with gray-to-white centers", "circular septoria lesions with tiny black dots"],
    "Tomato___Spider_mites Two-spotted_spider_mite": ["fine yellow stippling or dotting on tomato leaves", "spider webbing on tomato leaf underside", "bronze leaves from spider mite damage"],
    "Tomato___Target_Spot": ["small pinprick-sized tomato lesions", "circular spots with light brown centers", "tomato target spot lesions"],
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": ["severe tomato leaf curling and cupping upward", "yellowing of tomato leaf margins", "yellow leaf curl cupped foliage"],
    "Tomato___Tomato_mosaic_virus": ["mottled light and dark green patterns on tomato leaves", "stringy fern-like mosaic foliage", "puckered tomato leaves with mosaic pattern"],
    "Tomato___healthy": ["clean tomato leaves", "healthy robust tomato foliage", "vibrant green tomato leaves with no spots"]
}

TEMPLATE_SENTENCES = [
    "The plant exhibits {}.",
    "Leaves show symptoms of {}.",
    "Observation on foliage: {}.",
    "I can notice {}.",
    "The leaf displays {}.",
    "Symptom check: {}."
]

def generate_symptom_text(cls):
    """
    Generates a random symptom description sentence for a given class.
    """
    keywords_list = BASE_KEYWORDS[cls]
    kw = random.choice(keywords_list)
    tmpl = random.choice(TEMPLATE_SENTENCES)
    return tmpl.format(kw)

def generate_symptom_corpus(output_path, count=500):
    """
    Generates a corpus of exactly `count` symptom sentences covering all 38 classes,
    saves it, fits a Keras Tokenizer, and returns it.
    """
    print(f"Generating synthetic symptom dataset of {count} sentences...")
    corpus = []
    
    # Ensure at least 10 sentences per class initially to guarantee uniform coverage
    classes_multiplier = (count // len(CLASSES)) + 1
    
    for cls in CLASSES:
        keywords_list = BASE_KEYWORDS[cls]
        for _ in range(classes_multiplier):
            kw = random.choice(keywords_list)
            tmpl = random.choice(TEMPLATE_SENTENCES)
            sentence = tmpl.format(kw)
            corpus.append({"class_name": cls, "symptoms": sentence})
            
    # Shuffle and trim to exactly `count`
    random.seed(42)
    random.shuffle(corpus)
    corpus = corpus[:count]
    
    df = pd.DataFrame(corpus)
    df.to_csv(output_path, index=False)
    print(f"Saved synthetic symptom corpus to {output_path}")
    return df

def fit_and_save_tokenizer_pkl(texts, save_path, vocab_size=5000):
    """
    Fits Keras Tokenizer and serializes it to tokenizer.pkl using pickle.
    """
    print(f"Fitting Tokenizer with vocab_size={vocab_size} on synthetic symptoms...")
    tokenizer = Tokenizer(num_words=vocab_size, oov_token="<OOV>")
    tokenizer.fit_on_texts(texts)
    
    # Save using pickle
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    with open(save_path, "wb") as f:
        pickle.dump(tokenizer, f)
    print(f"Saved tokenizer to {save_path} using pickle.")
    return tokenizer

def process_and_resize_image(src_path, dst_path, size=(224, 224)):
    """
    Resizes image to 224x224. Pixel values are kept at [0, 255] on disk
    to save space, and divided by 255.0 on-the-fly in tf.data pipeline.
    """
    try:
        img = cv2.imread(src_path)
        if img is None:
            return False
        resized = cv2.resize(img, size)
        cv2.imwrite(dst_path, resized)
        return True
    except Exception:
        return False

def preprocess_and_split(base_dir):
    data_dir = os.path.join(base_dir, "data")
    pv_raw = os.path.join(data_dir, "plantvillage")
    pd_raw = os.path.join(data_dir, "plantdoc")
    merged_raw = os.path.join(data_dir, "merged")
    processed_dir = os.path.join(data_dir, "processed")
    outputs_dir = os.path.join(base_dir, "outputs")
    
    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(outputs_dir, exist_ok=True)
    
    # 1. Generate text corpus and fit/save tokenizer
    corpus_csv = os.path.join(processed_dir, "synthetic_symptoms.csv")
    corpus_df = generate_symptom_corpus(corpus_csv, count=500)
    tokenizer_path = os.path.join(outputs_dir, "tokenizer.pkl")
    tokenizer = fit_and_save_tokenizer_pkl(corpus_df["symptoms"].values, tokenizer_path)
    
    # Using global generate_symptom_text

    # 2. Process Dataset 1: PlantVillage (80/10/10 split stratified by class)
    print("\n🧹 Preprocessing Dataset 1: PlantVillage...")
    pv_samples = []
    subdirs = ["train", "val"]
    for subdir in subdirs:
        subdir_path = os.path.join(pv_raw, subdir)
        if not os.path.exists(subdir_path):
            subdir_path = pv_raw
            
        for cls in CLASSES:
            cls_path = os.path.join(subdir_path, cls)
            if os.path.exists(cls_path):
                for fname in os.listdir(cls_path):
                    if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                        pv_samples.append({
                            "src_path": os.path.join(cls_path, fname),
                            "class": cls,
                            "label": CLASS_TO_IDX[cls]
                        })
                        
    print(f"Found {len(pv_samples)} PlantVillage raw images.")
    
    # Stratified split using sklearn
    pv_df = pd.DataFrame(pv_samples)
    train_df, temp_df = train_test_split(
        pv_df, test_size=0.20, stratify=pv_df["label"], random_state=42
    )
    val_df, test_df = train_test_split(
        temp_df, test_size=0.50, stratify=temp_df["label"], random_state=42
    )
    
    splits = {
        "train": train_df,
        "val": val_df,
        "test": test_df
    }
    
    for split_name, df_split in splits.items():
        print(f"Processing split '{split_name}' ({len(df_split)} samples)...")
        metadata = []
        
        for _, row in tqdm(df_split.iterrows(), total=len(df_split)):
            cls = row["class"]
            label = row["label"]
            src_path = row["src_path"]
            
            # Destination path
            cls_dst_dir = os.path.join(processed_dir, split_name, cls)
            os.makedirs(cls_dst_dir, exist_ok=True)
            
            fname = os.path.basename(src_path)
            dst_path = os.path.join(cls_dst_dir, fname)
            
            success = process_and_resize_image(src_path, dst_path)
            if success:
                symptom_text = generate_symptom_text(cls)
                rel_dst_path = os.path.relpath(dst_path, data_dir)
                metadata.append({
                    "image_path": rel_dst_path,
                    "class_name": cls,
                    "label": label,
                    "symptoms": symptom_text
                })
                
        df_meta = pd.DataFrame(metadata)
        df_meta.to_csv(os.path.join(processed_dir, f"{split_name}_metadata.csv"), index=False)
        print(f"Saved {split_name}_metadata.csv ({len(df_meta)} records).")
        
        # Calculate class weights on the training set to resolve imbalance
        if split_name == "train":
            y_train = df_meta["label"].values
            class_weights = compute_class_weight(
                class_weight='balanced',
                classes=np.unique(y_train),
                y=y_train
            )
            class_weights_dict = {int(cls): float(w) for cls, w in zip(np.unique(y_train), class_weights)}
            
            # Fill missing classes if any with weight 1.0
            for i in range(len(CLASSES)):
                if i not in class_weights_dict:
                    class_weights_dict[i] = 1.0
                    
            weights_path = os.path.join(outputs_dir, "class_weights.json")
            with open(weights_path, "w") as f:
                json_weights = {str(k): v for k, v in class_weights_dict.items()}
                import json
                f.write(json.dumps(json_weights, indent=4))
            print(f"Calculated and saved class weights to {weights_path}")

    # 3. Process Dataset 2: PlantDoc (70% fine-tune train, 30% fine-tune test stratified)
    print("\n🧹 Preprocessing Dataset 2: PlantDoc...")
    pd_samples = []
    pd_subdirs = ["train", "test"]
    for subdir in pd_subdirs:
        subdir_path = os.path.join(pd_raw, subdir)
        if not os.path.exists(subdir_path):
            continue
        for folder_name in os.listdir(subdir_path):
            if folder_name in PLANTDOC_MAPPING:
                cls_mapped = PLANTDOC_MAPPING[folder_name]
                cls_path = os.path.join(subdir_path, folder_name)
                for fname in os.listdir(cls_path):
                    if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                        pd_samples.append({
                            "src_path": os.path.join(cls_path, fname),
                            "class": cls_mapped,
                            "label": CLASS_TO_IDX[cls_mapped]
                        })
                        
    print(f"Found {len(pd_samples)} mappable images for PlantDoc.")
    pd_df = pd.DataFrame(pd_samples)
    
    # Stratified split
    pd_train_df, pd_test_df = train_test_split(
        pd_df, test_size=0.30, stratify=pd_df["label"], random_state=42
    )
    
    pd_splits = {
        "train": pd_train_df,
        "test": pd_test_df
    }
    
    pd_processed_dir = os.path.join(processed_dir, "fine_tune")
    os.makedirs(pd_processed_dir, exist_ok=True)
    
    for split_name, df_split in pd_splits.items():
        print(f"Processing PlantDoc split '{split_name}' ({len(df_split)} samples)...")
        metadata = []
        for _, row in tqdm(df_split.iterrows(), total=len(df_split)):
            cls = row["class"]
            label = row["label"]
            src_path = row["src_path"]
            
            cls_dst_dir = os.path.join(pd_processed_dir, split_name, cls)
            os.makedirs(cls_dst_dir, exist_ok=True)
            
            fname = os.path.basename(src_path)
            dst_path = os.path.join(cls_dst_dir, fname)
            
            success = process_and_resize_image(src_path, dst_path)
            if success:
                symptom_text = generate_symptom_text(cls)
                rel_dst_path = os.path.relpath(dst_path, data_dir)
                metadata.append({
                    "image_path": rel_dst_path,
                    "class_name": cls,
                    "label": label,
                    "symptoms": symptom_text
                })
                
        df_meta = pd.DataFrame(metadata)
        df_meta.to_csv(os.path.join(pd_processed_dir, f"{split_name}_metadata.csv"), index=False)
        print(f"Saved fine_tune/{split_name}_metadata.csv ({len(df_meta)} records).")

    # 4. Process Dataset 3: Merged (100% test only)
    print("\n🧹 Preprocessing Dataset 3: Merged Dataset...")
    if not os.path.exists(merged_raw):
        print(f"[WARNING] Merged Dataset raw not found at {merged_raw}. Skipping evaluation split preprocessing.")
        return
        
    merged_samples = []
    # Helper to map merged dir name
    def map_merged_dir_to_class(dir_name):
        normalized = dir_name.replace("_", " ")
        if normalized in PLANTDOC_MAPPING:
            return PLANTDOC_MAPPING[normalized]
        if normalized == "Tomato two spotted spider mites leaf":
            return "Tomato___Spider_mites Two-spotted_spider_mite"
        return None

    # Scan test subfolder in Merged raw
    merged_test_dir = os.path.join(merged_raw, "test")
    if os.path.exists(merged_test_dir):
        for folder in os.listdir(merged_test_dir):
            cls_mapped = map_merged_dir_to_class(folder)
            if cls_mapped is not None:
                cls_path = os.path.join(merged_test_dir, folder)
                for fname in os.listdir(cls_path):
                    if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                        merged_samples.append({
                            "src_path": os.path.join(cls_path, fname),
                            "class": cls_mapped,
                            "label": CLASS_TO_IDX[cls_mapped]
                        })
                        
    print(f"Found {len(merged_samples)} mappable images for Merged Dataset test.")
    
    stress_test_dir = os.path.join(processed_dir, "stress_test")
    os.makedirs(stress_test_dir, exist_ok=True)
    
    metadata = []
    for sample in tqdm(merged_samples):
        cls = sample["class"]
        label = sample["label"]
        src_path = sample["src_path"]
        
        cls_dst_dir = os.path.join(stress_test_dir, cls)
        os.makedirs(cls_dst_dir, exist_ok=True)
        
        fname = os.path.basename(src_path)
        dst_path = os.path.join(cls_dst_dir, fname)
        
        success = process_and_resize_image(src_path, dst_path)
        if success:
            symptom_text = generate_symptom_text(cls)
            rel_dst_path = os.path.relpath(dst_path, data_dir)
            metadata.append({
                "image_path": rel_dst_path,
                "class_name": cls,
                "label": label,
                "symptoms": symptom_text
            })
            
    df_meta = pd.DataFrame(metadata)
    df_meta.to_csv(os.path.join(processed_dir, "stress_test_metadata.csv"), index=False)
    print(f"Saved stress_test_metadata.csv ({len(df_meta)} records).")
    print("\n✅ Data preprocessing completed successfully!")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    preprocess_and_split(base_dir)
