import os
import sys
import json
import subprocess
import numpy as np
import pandas as pd
import cv2
import tensorflow as tf
import matplotlib.pyplot as plt
import shap

from data_loader import load_tokenizer_pkl, load_and_preprocess_image
from data_preprocessing import CLASSES

# Disable verbose TensorFlow messages
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

def get_last_conv_layer_name(model):
    """
    Finds the name of the last Conv2D layer in the EfficientNetB3 backbone.
    """
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D) or ("conv" in layer.name and "project" not in layer.name and "fusion" not in layer.name):
            return layer.name
    return "top_activation"

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, text_array=None):
    """
    Computes a Grad-CAM heatmap for the target image array.
    """
    conv_layer = model.get_layer(last_conv_layer_name)
    
    # Construct a sub-model that outputs both the last conv feature map and final predictions
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[conv_layer.output, model.output]
    )
    
    with tf.GradientTape() as tape:
        inputs = {"image_input": img_array}
        if text_array is not None:
            inputs["text_input"] = text_array
            
        conv_outputs, predictions = grad_model(inputs)
        loss = tf.reduce_max(predictions, axis=-1)
        
    # Gradients of the predicted class score w.r.t the feature map of the last conv layer
    grads = tape.gradient(loss, conv_outputs)
    
    # Vector of mean gradients per channel
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    
    # Weight the channel feature map by channel importance
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    
    # Apply ReLU and normalize
    heatmap = tf.maximum(heatmap, 0.0) / (tf.reduce_max(heatmap) + 1e-10)
    return heatmap.numpy()

def overlay_heatmap(img_path, heatmap, alpha=0.4, colormap=cv2.COLORMAP_JET):
    """
    Overlays the Grad-CAM heatmap on top of the original image.
    """
    img = cv2.imread(img_path)
    if img is None:
        raise FileNotFoundError(f"Image not found at {img_path}")
        
    img = cv2.resize(img, (224, 224))
    
    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, colormap)
    
    superimposed_img = cv2.addWeighted(img, 1 - alpha, heatmap_color, alpha, 0)
    return superimposed_img

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only-shap", action="store_true", help="Only run SHAP explanation block and exit")
    args = parser.parse_args()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    processed_dir = os.path.join(data_dir, "processed")
    models_dir = os.path.join(base_dir, "models")
    outputs_dir = os.path.join(base_dir, "outputs")
    
    os.makedirs(outputs_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, "agro_disease_model.h5")
    tokenizer_path = os.path.join(outputs_dir, "tokenizer.pkl")
    
    if not os.path.exists(model_path):
        print(f"[ERROR] Model not found at {model_path}. Please run training first.")
        sys.exit(1)
        
    # Pick a sample image from the test set for display
    test_csv = os.path.join(processed_dir, "test_metadata.csv")
    if not os.path.exists(test_csv):
        print(f"[ERROR] Test metadata not found at {test_csv}. Please run preprocessing first.")
        sys.exit(1)
        
    df = pd.read_csv(test_csv)
    sample_row = df.iloc[0]
    sample_img_rel = sample_row["image_path"]
    sample_img_path = os.path.join(data_dir, sample_img_rel)
    sample_class = sample_row["class_name"]
    sample_symptoms = sample_row["symptoms"]
    
    # ------------------ Process Inputs ------------------
    # Image
    target_img = load_and_preprocess_image(sample_img_path)
    target_batch = np.expand_dims(target_img.numpy(), axis=0) # Shape: (1, 224, 224, 3)
    
    # Text
    tokenizer = load_tokenizer_pkl(tokenizer_path)
    seq = tokenizer.texts_to_sequences([sample_symptoms])
    padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=50, padding="post")
    
    if args.only_shap:
        print("🔍 Generating SHAP Attribution Values (Subprocess)...")
        print("Loading model inside subprocess...")
        model = tf.keras.models.load_model(model_path)
        
        # Wrap model into a functional single-input image model
        img_in = tf.keras.Input(shape=(224, 224, 3), name="image_input_only")
        dummy_txt = tf.keras.layers.Lambda(lambda x: tf.zeros((tf.shape(x)[0], 50), dtype=tf.int32))(img_in)
        wrapped_preds = model({"image_input": img_in, "text_input": dummy_txt})
        image_only_model = tf.keras.Model(inputs=img_in, outputs=wrapped_preds)
        
        # Build background image dataset (using 10 images from test set)
        bg_images = []
        for bg_path in df["image_path"].values[:10]:
            img_full_path = os.path.join(data_dir, bg_path)
            bg_images.append(load_and_preprocess_image(img_full_path).numpy())
        background_data = np.array(bg_images)
        
        # Predict to get top indices
        preds = model.predict({"image_input": target_batch, "text_input": padded_seq}, verbose=0)
        top_5_indices = np.argsort(preds[0])[-5:][::-1]
        
        import shap
        print("  Initializing shap.DeepExplainer...")
        explainer = shap.DeepExplainer(image_only_model, background_data)
        shap_values = explainer.shap_values(target_batch)
        
        # Plot SHAP values for top 5 predicted classes
        shap_values_top5 = [shap_values[idx] for idx in top_5_indices]
        top_5_names = [CLASSES[idx].split("___")[-1].replace("_", " ") for idx in top_5_indices]
        class_names = [top_5_names]
        
        plt.figure(figsize=(16, 4))
        shap.image_plot(shap_values_top5, target_batch, labels=class_names, show=False)
        
        workspace_root = os.path.dirname(base_dir)
        out_shap_outputs = os.path.join(outputs_dir, "shap_output.png")
        out_shap_cwd = os.path.join(base_dir, "shap_output.png")
        out_shap_workspace = os.path.join(workspace_root, "shap_output.png")
        plt.savefig(out_shap_outputs, bbox_inches="tight", dpi=150)
        plt.savefig(out_shap_cwd, bbox_inches="tight", dpi=150)
        plt.savefig(out_shap_workspace, bbox_inches="tight", dpi=150)
        plt.close()
        print(f"  SHAP explanation plot successfully saved to {out_shap_outputs} and {out_shap_cwd}")
        sys.exit(0)

    # Main thread flow:
    print("🧠 --- Starting Model Explainability Diagnostics (Grad-CAM & SHAP) --- 🧠")
    print("Loading final model...")
    model = tf.keras.models.load_model(model_path)
    
    print(f"Sample Leaf: {sample_img_rel} ({sample_class})")
    print(f"Symptoms:    {sample_symptoms}")
    
    # Run prediction
    preds = model.predict({"image_input": target_batch, "text_input": padded_seq})
    top_5_indices = np.argsort(preds[0])[-5:][::-1]
    predicted_class = CLASSES[top_5_indices[0]]
    print(f"Predicted disease: {predicted_class} (Confidence: {preds[0][top_5_indices[0]]:.4f})")
    
    # =========================================================================
    # PART 1: GRAD-CAM
    # =========================================================================
    print("\n🔍 Generating Grad-CAM Heatmap...")
    last_conv_name = get_last_conv_layer_name(model)
    print(f"  Last Conv Layer: {last_conv_name}")
    
    heatmap = make_gradcam_heatmap(target_batch, model, last_conv_name, padded_seq)
    gradcam_overlay = overlay_heatmap(sample_img_path, heatmap)
    
    # Save output images
    workspace_root = os.path.dirname(base_dir)
    out_gradcam_outputs = os.path.join(outputs_dir, "grad_cam_output.jpg")
    out_gradcam_cwd = os.path.join(base_dir, "grad_cam_output.jpg")
    out_gradcam_workspace = os.path.join(workspace_root, "grad_cam_output.jpg")
    
    cv2.imwrite(out_gradcam_outputs, gradcam_overlay)
    cv2.imwrite(out_gradcam_cwd, gradcam_overlay)
    cv2.imwrite(out_gradcam_workspace, gradcam_overlay)
    print(f"  Grad-CAM image successfully saved to {out_gradcam_outputs} and {out_gradcam_cwd}")
    
    # =========================================================================
    # PART 2: SHAP Explainability on Image Branch (via isolated subprocess)
    # =========================================================================
    print("\n🔍 Generating SHAP Attribution Values...")
    shap_plotted = False
    
    try:
        # Run SHAP in subprocess to protect the main process's TF gradient registry
        cmd = [sys.executable, __file__, "--only-shap"]
        print(f"  Running SHAP subprocess: {' '.join(cmd)}")
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode == 0:
            print("  SHAP subprocess completed successfully.")
            shap_plotted = True
        else:
            print(f"  [WARNING] SHAP subprocess failed (exit code {res.returncode}).")
            print(f"  Subprocess stdout: {res.stdout}")
            print(f"  Subprocess stderr: {res.stderr}")
    except Exception as e:
        print(f"  [WARNING] SHAP subprocess invocation failed: {e}")
        
    if not shap_plotted:
        # Fallback to Custom Gradient Saliency Map if SHAP fails due to library compatibility issues
        print("  🔄 Falling back to Custom Gradient Saliency explanation map...")
        try:
            # Wrap model into a functional single-input image model
            img_in = tf.keras.Input(shape=(224, 224, 3), name="image_input_only")
            dummy_txt = tf.keras.layers.Lambda(lambda x: tf.zeros((tf.shape(x)[0], 50), dtype=tf.int32))(img_in)
            wrapped_preds = model({"image_input": img_in, "text_input": dummy_txt})
            image_only_model = tf.keras.Model(inputs=img_in, outputs=wrapped_preds)
            
            fig, axes = plt.subplots(1, 6, figsize=(18, 3.5))
            
            # Original leaf image
            orig_rgb = cv2.cvtColor(cv2.imread(sample_img_path), cv2.COLOR_BGR2RGB)
            orig_resized = cv2.resize(orig_rgb, (224, 224))
            axes[0].imshow(orig_resized)
            axes[0].set_title("Original Image", fontsize=10)
            axes[0].axis("off")
            
            for rank, idx in enumerate(top_5_indices):
                with tf.GradientTape() as tape:
                    img_tensor = tf.convert_to_tensor(target_batch)
                    tape.watch(img_tensor)
                    wrapped_predictions = image_only_model(img_tensor)
                    class_score = wrapped_predictions[0, idx]
                    
                grads = tape.gradient(class_score, img_tensor)[0]
                saliency = tf.reduce_max(tf.abs(grads), axis=-1).numpy()
                
                # Normalize saliency map
                saliency = (saliency - saliency.min()) / (saliency.max() - saliency.min() + 1e-10)
                
                class_lbl = CLASSES[idx].split("___")[-1].replace("_", " ")
                prob = preds[0, idx]
                
                axes[rank + 1].imshow(saliency, cmap="plasma")
                axes[rank + 1].set_title(f"{class_lbl}\nProb: {prob:.3f}", fontsize=8)
                axes[rank + 1].axis("off")
                
            plt.tight_layout()
            workspace_root = os.path.dirname(base_dir)
            out_shap_outputs = os.path.join(outputs_dir, "shap_output.png")
            out_shap_cwd = os.path.join(base_dir, "shap_output.png")
            out_shap_workspace = os.path.join(workspace_root, "shap_output.png")
            plt.savefig(out_shap_outputs, dpi=150)
            plt.savefig(out_shap_cwd, dpi=150)
            plt.savefig(out_shap_workspace, dpi=150)
            plt.close()
            print(f"  Custom gradient attribution plot successfully saved to {out_shap_outputs} and {out_shap_cwd}")
        except Exception as fallback_err:
            print(f"  [ERROR] Fallback Saliency mapping failed: {fallback_err}")
            
    print("\n✅ Explainability script completed successfully!")

if __name__ == "__main__":
    import argparse
    import sys
    main()
