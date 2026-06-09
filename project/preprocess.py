import os
import cv2
import random
import pandas as pd
import numpy as np
from tqdm import tqdm
import shutil

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

# --- Base Symptoms Mapping for the Text Branch ---
BASE_SYMPTOMS = {
    "Apple___Apple_scab": "Olive-green to brown velvety spots on the leaves. Leaves are curling and dropping prematurely.",
    "Apple___Black_rot": "Circular purple spots on leaves expanding into frog-eye spots with dark margins and light centers.",
    "Apple___Cedar_apple_rust": "Bright orange-yellow spots on the upper leaf surface, with tiny tubular cups on the underside.",
    "Apple___healthy": "Healthy green apple foliage with uniform texture, no spots, lesions, rust, or discoloration.",
    "Blueberry___healthy": "Healthy green blueberry leaves showing clear veins, normal green color, and no spots or mold.",
    "Cherry_(including_sour)___Powdery_mildew": "White powdery patch of fungal growth on leaves. Leaves are distorted, buckled, or curling upward.",
    "Cherry_(including_sour)___healthy": "Smooth, vibrant green cherry leaves with no visible lesions, mold, or powdery growth.",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": "Small, narrow, rectangular gray-to-tan spots running parallel to leaf veins. Leaves yellow and die.",
    "Corn_(maize)___Common_rust_": "Small, round to elongate golden-brown to red-brown pustules on both upper and lower leaf surfaces.",
    "Corn_(maize)___Northern_Leaf_Blight": "Long, elliptical, grayish-green or tan lesions on leaves, resembling cigar-like shapes.",
    "Corn_(maize)___healthy": "Lush, deep green corn leaves with straight margins, prominent veins, and no spots or lesions.",
    "Grape___Black_rot": "Small round reddish-brown spots on leaves. Leaf margins may show black pycnidia dotting the lesions.",
    "Grape___Esca_(Black_Measles)": "Tiger-stripe chlorosis on leaves with yellowing margins. Dry leaves and dark spots on berries.",
    "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": "Asymmetrical dull brown spots on leaves, starting from margins and spreading across the leaf surface.",
    "Grape___healthy": "Vibrant green grape leaves with characteristic lobes, clean surfaces, and no signs of spots or wilting.",
    "Orange___Haunglongbing_(Citrus_greening)": "Asymmetrical yellow mottling on leaves, green veins, and small, upright, chlorotic leaves.",
    "Peach___Bacterial_spot": "Small, water-soaked, reddish-brown spots on leaves, which may drop out leaving a shot-hole appearance.",
    "Peach___healthy": "Vibrant green peach leaves with smooth margins and no holes, spots, or bacterial exudate.",
    "Pepper,_bell___Bacterial_spot": "Small, circular, water-soaked spots on leaves. Lesions darken, become scab-like, and cause yellowing.",
    "Pepper,_bell___healthy": "Glossy, deep green bell pepper leaves showing healthy cell structure, no spots, and no curling.",
    "Potato___Early_blight": "Dark, circular spots with concentric rings or a target-board pattern on older lower leaves.",
    "Potato___Late_blight": "Large, irregular, water-soaked dark green-to-black lesions on leaves. White fuzzy mold on undersides.",
    "Potato___healthy": "Healthy compound potato leaves, smooth, uniform dark green, with no targets or moldy lesions.",
    "Raspberry___healthy": "Healthy green raspberry leaves with characteristic serrated margins, clean leaf veins, and no mold.",
    "Soybean___healthy": "Vibrant green trifoliate soybean leaves with no yellowing, spots, insect damage, or wilting.",
    "Squash___Powdery_mildew": "White to gray talcum-like powdery patches on the upper surface of squash leaves and stems.",
    "Strawberry___Leaf_scorch": "Purple-to-brown spots on leaves that expand and coalesce, causing the leaf to dry out and curl.",
    "Strawberry___healthy": "Healthy trifoliate strawberry leaves, bright green, showing no purple scorch marks or dry margins.",
    "Tomato___Bacterial_spot": "Small, dark, greasy-looking spots on leaves, surrounded by yellow halos. Leaves may drop off.",
    "Tomato___Early_blight": "Dark spots with concentric target-like rings on older leaves. Surrounding area turns yellow.",
    "Tomato___Late_blight": "Large, dark brown-to-black oily lesions on leaves. Fuzzy white fungal growth on undersides in humid air.",
    "Tomato___Leaf_Mold": "Pale green or yellow spots on the upper leaf surface, with olive-green velvety mold on the underside.",
    "Tomato___Septoria_leaf_spot": "Numerous small, circular spots with dark borders and gray-to-white centers containing tiny black dots.",
    "Tomato___Spider_mites Two-spotted_spider_mite": "Fine yellow stippling or dotting on leaves. Webbing is visible on the undersides. Leaves turn bronze.",
    "Tomato___Target_Spot": "Small, pinprick-sized lesions on leaves, expanding to larger circular spots with light brown centers.",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus": "Severe leaf curling, cupping upward, reduction in leaf size, and yellowing of leaf margins.",
    "Tomato___Tomato_mosaic_virus": "Mottled light and dark green patterns on leaves. Leaves may be puckered, stringy, or fern-like.",
    "Tomato___healthy": "Robust, deep green tomato leaves with normal lobes, strong stems, and no spots or moldy growth."
}

# --- Text Augmentation Function ---
def generate_symptom_text(class_name):
    base_text = BASE_SYMPTOMS[class_name]
    templates = [
        "The plant exhibits: {}",
        "Leaves show symptoms of: {}",
        "Observation on foliage: {}",
        "I can notice: {}",
        "{}",
        "The leaf displays {}",
    ]
    template = random.choice(templates)
    text = template.format(base_text)
    
    # Introduce small perturbations (simulating typo noise)
    words = text.split()
    if len(words) > 5 and random.random() < 0.15:
        # Swap two adjacent words
        idx = random.randint(0, len(words) - 2)
        words[idx], words[idx+1] = words[idx+1], words[idx]
        text = " ".join(words)
        
    return text

def process_and_resize_image(src_path, dst_path, size=(300, 300)):
    try:
        img = cv2.imread(src_path)
        if img is None:
            return False
        resized = cv2.resize(img, size)
        cv2.imwrite(dst_path, resized)
        return True
    except Exception:
        return False

def preprocess_datasets(base_dir):
    data_dir = os.path.join(base_dir, "data")
    pv_raw = os.path.join(data_dir, "plantvillage")
    pd_raw = os.path.join(data_dir, "plantdoc")
    processed_dir = os.path.join(data_dir, "processed")
    
    # Check raw data existence
    if not os.path.exists(pv_raw):
        print(f"[ERROR] PlantVillage raw directory does not exist at {pv_raw}")
        return
        
    print("🧹 Preprocessing Dataset 1: PlantVillage...")
    pv_samples = []
    
    # Scan raw PlantVillage dirs
    # Supports train/val subdirs or a direct list of directories
    subdirs = ["train", "val"]
    for subdir in subdirs:
        subdir_path = os.path.join(pv_raw, subdir)
        if not os.path.exists(subdir_path):
            # Fallback to direct raw folder scanning if structure differs
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
    
    print(f"Found {len(pv_samples)} valid images in PlantVillage raw.")
    
    # Shuffle and split (80/10/10)
    random.seed(42)
    random.shuffle(pv_samples)
    
    n_samples = len(pv_samples)
    train_idx = int(0.8 * n_samples)
    val_idx = int(0.9 * n_samples)
    
    splits = {
        "train": pv_samples[:train_idx],
        "val": pv_samples[train_idx:val_idx],
        "test": pv_samples[val_idx:]
    }
    
    for split_name, samples in splits.items():
        print(f"Processing split '{split_name}' ({len(samples)} samples)...")
        metadata = []
        
        for sample in tqdm(samples):
            cls = sample["class"]
            label = sample["label"]
            src_path = sample["src_path"]
            
            # Create destination folder
            cls_dst_dir = os.path.join(processed_dir, split_name, cls)
            os.makedirs(cls_dst_dir, exist_ok=True)
            
            fname = os.path.basename(src_path)
            dst_path = os.path.join(cls_dst_dir, fname)
            
            # Copy & Resize
            success = process_and_resize_image(src_path, dst_path)
            if success:
                # Generate symptom text
                symptom_text = generate_symptom_text(cls)
                # Save relative path for portability
                rel_dst_path = os.path.relpath(dst_path, data_dir)
                
                metadata.append({
                    "image_path": rel_dst_path,
                    "class_name": cls,
                    "label": label,
                    "symptoms": symptom_text
                })
                
        # Write CSV index
        df = pd.DataFrame(metadata)
        df.to_csv(os.path.join(processed_dir, f"{split_name}_metadata.csv"), index=False)
        print(f"Saved {split_name}_metadata.csv containing {len(df)} records.")

    print("\n🧹 Preprocessing Dataset 2: PlantDoc (Fine-tuning)...")
    if not os.path.exists(pd_raw):
        print(f"[ERROR] PlantDoc raw directory does not exist at {pd_raw}")
        return
        
    pd_processed_dir = os.path.join(processed_dir, "fine_tune")
    os.makedirs(pd_processed_dir, exist_ok=True)
    
    pd_splits = ["train", "test"]
    for split in pd_splits:
        split_path = os.path.join(pd_raw, split)
        if not os.path.exists(split_path):
            continue
            
        print(f"Processing PlantDoc '{split}' split...")
        pd_samples = []
        
        for folder_name in os.listdir(split_path):
            if folder_name in PLANTDOC_MAPPING:
                cls_mapped = PLANTDOC_MAPPING[folder_name]
                cls_path = os.path.join(split_path, folder_name)
                
                for fname in os.listdir(cls_path):
                    if fname.lower().endswith(('.png', '.jpg', '.jpeg')):
                        pd_samples.append({
                            "src_path": os.path.join(cls_path, fname),
                            "class": cls_mapped,
                            "label": CLASS_TO_IDX[cls_mapped]
                        })
                        
        print(f"  Found {len(pd_samples)} mappable images for PlantDoc '{split}'.")
        metadata = []
        
        for sample in tqdm(pd_samples):
            cls = sample["class"]
            label = sample["label"]
            src_path = sample["src_path"]
            
            # Destination path
            cls_dst_dir = os.path.join(pd_processed_dir, split, cls)
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
                
        # Write CSV index
        df = pd.DataFrame(metadata)
        df.to_csv(os.path.join(pd_processed_dir, f"{split}_metadata.csv"), index=False)
        print(f"  Saved fine_tune/{split}_metadata.csv containing {len(df)} records.")
        
    print("\n✅ Preprocessing complete! All image splits are resized and paired with textual symptoms.")

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    preprocess_datasets(base_dir)
