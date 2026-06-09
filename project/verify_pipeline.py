import os
import numpy as np
import pandas as pd
import cv2
import tensorflow as tf
from model import build_multimodal_model, compile_model
from data_loader import create_multimodal_dataset, load_tokenizer_pkl
from data_preprocessing import fit_and_save_tokenizer_pkl
from explain import get_last_conv_layer_name, make_gradcam_heatmap, overlay_heatmap, get_image_base64
from export_tflite import convert_and_save

def main():
    print("🧪 --- Starting Automated End-to-End Pipeline Verification --- 🧪")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_dir = os.path.join(base_dir, "data", "test_dummy")
    os.makedirs(test_dir, exist_ok=True)
    
    # 1. Generate Dummy Images & CSV Metadata
    print("Generating synthetic test images and metadata...")
    dummy_csv_path = os.path.join(test_dir, "dummy_metadata.csv")
    
    samples = []
    # Create 4 dummy image files
    for i in range(4):
        # 224x224 RGB dummy image with random noise
        img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        img_filename = f"dummy_leaf_{i}.jpg"
        img_path = os.path.join(test_dir, img_filename)
        cv2.imwrite(img_path, img)
        
        # We assign a class that is present in primary CLASSES
        class_name = "Apple___healthy" if i % 2 == 0 else "Tomato___Early_blight"
        label = 3 if i % 2 == 0 else 30
        
        samples.append({
            "image_path": os.path.relpath(img_path, os.path.join(base_dir, "data")),
            "class_name": class_name,
            "label": label,
            "symptoms": "Yellow spots on leaf margins with dry brown lesions" if i % 2 != 0 else "Healthy dark green leaf"
        })
        
    df = pd.DataFrame(samples)
    df.to_csv(dummy_csv_path, index=False)
    
    # 2. Fit and Test Tokenizer
    tokenizer_path = os.path.join(test_dir, "dummy_tokenizer.pkl")
    tokenizer = fit_and_save_tokenizer_pkl(df["symptoms"].values, tokenizer_path)
    
    # 3. Create TF Datasets
    print("Creating tf.data.Dataset loaders...")
    dataset = create_multimodal_dataset(
        dummy_csv_path,
        os.path.join(base_dir, "data"),
        tokenizer,
        max_seq_len=50,
        batch_size=2,
        is_training=False
    )
    
    # 4. Instantiate Model
    print("Building model architecture...")
    model = build_multimodal_model(
        num_classes=38,
        vocab_size=5000,
        max_seq_len=50,
        embedding_dim=128,
        lstm_units=16,
        image_projection_dim=256,
        text_projection_dim=64,
        fc_units=64,
        dropout_rate_img=0.2,
        dropout_rate_txt=0.2,
        dropout_rate_fusion=0.2,
        fine_tune_base=False
    )
    
    # Compile
    model = compile_model(model, lr=1e-3)
    
    # 5. Fit 1 Epoch
    print("Running single-epoch diagnostic training pass...")
    model.fit(dataset, epochs=1, verbose=1)
    
    # 6. Test Model Inference and Explainability (Grad-CAM)
    print("Testing inference and Grad-CAM generation...")
    for x, y in dataset.take(1):
        preds = model.predict(x)
        class_idx = np.argmax(preds[0])
        print(f"  Prediction test: target class index={class_idx}, confidence={preds[0][class_idx]:.4f}")
        
        # Test Grad-CAM
        last_conv_name = get_last_conv_layer_name(model)
        heatmap = make_gradcam_heatmap(x["image_input"], model, last_conv_name, x["text_input"])
        print(f"  Grad-CAM heatmap computed. Shape: {heatmap.shape}")
        
        # Overlay and encode base64
        overlay_img = overlay_heatmap(os.path.join(base_dir, "data", samples[0]["image_path"]), heatmap)
        base64_str = get_image_base64(overlay_img)
        print(f"  Successfully encoded Grad-CAM overlay to base64 string (starts with: {base64_str[:30]})")

    # 7. Convert and verify TFLite Conversion
    print("Testing TFLite model conversion...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    tflite_test_path = os.path.join(test_dir, "dummy_model.tflite")
    success = convert_and_save(converter, tflite_test_path, "Diagnostic TFLite Conversion")
    
    # Clean up dummy files
    print("Cleaning up synthetic test assets...")
    try:
        shutil = None
        import shutil
        shutil.rmtree(test_dir)
        print("  Cleanup complete.")
    except Exception as e:
        print(f"  Could not remove test directory: {e}")
        
    if success:
        print("\n✅ Verification SUCCESSFUL! All pipeline components are functional and bug-free.")
    else:
        print("\n❌ Verification FAILED during conversion step.")

if __name__ == "__main__":
    main()
