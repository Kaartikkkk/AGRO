import os
import argparse
import json
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint, ReduceLROnPlateau, TensorBoard, CSVLogger

from model import build_multimodal_model, compile_model
from data_loader import create_multimodal_dataset, load_tokenizer_pkl
from data_preprocessing import CLASSES

# Enable memory growth to prevent allocation issues on GPUs
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except RuntimeError as e:
        print(e)

# Disable GPU/MPS tracking for tf.data map functions to avoid thread warnings
os.environ["TF_GPU_ALLOCATOR"] = "cuda_malloc_async"

def plot_history(log_csv_path, save_path):
    """
    Plots training history from the CSVLogger log file.
    """
    try:
        df = pd.read_csv(log_csv_path)
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 5))
        
        # Loss plot
        if "loss" in df.columns:
            ax1.plot(df["loss"], label="Train Loss")
        if "val_loss" in df.columns:
            ax1.plot(df["val_loss"], label="Val Loss")
        ax1.set_title("Model Loss")
        ax1.set_xlabel("Epochs")
        ax1.set_ylabel("Loss")
        ax1.legend()
        ax1.grid(True)
        
        # Accuracy plot
        if "accuracy" in df.columns:
            ax2.plot(df["accuracy"], label="Train Acc")
        if "val_accuracy" in df.columns:
            ax2.plot(df["val_accuracy"], label="Val Acc")
        ax2.set_title("Model Accuracy")
        ax2.set_xlabel("Epochs")
        ax2.set_ylabel("Accuracy")
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        plt.savefig(save_path)
        plt.close()
        print(f"Saved training history curves to {save_path}")
    except Exception as e:
        print(f"[WARNING] Failed to plot training history: {e}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Run a quick verification pass with minimal epochs and data")
    args = parser.parse_args()
    
    if args.dry_run:
        print("⚡ Dry-run mode enabled. Running fast verification pass.")
        
    print("🌾 --- Starting Multimodal Plant Disease 3-Phase Training Pipeline --- 🌾")
    
    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    processed_dir = os.path.join(data_dir, "processed")
    models_dir = os.path.join(base_dir, "models")
    outputs_dir = os.path.join(base_dir, "outputs")
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(outputs_dir, exist_ok=True)
    
    tokenizer_path = os.path.join(outputs_dir, "tokenizer.pkl")
    best_params_path = os.path.join(outputs_dir, "best_params.json")
    
    # 1. Load Hyperparameters (use optimized or default ones)
    hyperparams = {
        "learning_rate": 1e-3,
        "dropout_rate": 0.3,
        "dense_units": 256,
        "batch_size": 32,
        "lstm_units": 128
    }
    
    if os.path.exists(best_params_path):
        print(f"Loading optimized hyperparameters from {best_params_path}...")
        with open(best_params_path, "r", encoding="utf-8") as f:
            optimized_params = json.load(f)
            hyperparams.update(optimized_params)
    else:
        print("Using default model architecture parameters.")
        
    print("Hyperparameters:")
    for k, v in hyperparams.items():
        print(f"  {k}: {v}")

    # Load Tokenizer
    if not os.path.exists(tokenizer_path):
        raise FileNotFoundError(f"Tokenizer not found at {tokenizer_path}. Run preprocessing first.")
    tokenizer = load_tokenizer_pkl(tokenizer_path)

    # Base names of custom/text layers to avoid freezing them in Phase 1 and 2
    non_base_names = [
        "text_input", "text_embedding", "text_spatial_dropout", "text_bilstm", "text_gmp", 
        "text_dense_128", "text_dropout_128", "text_projection",
        "image_gap", "image_dense_512", "image_bn_512", "image_dropout_512", "image_projection",
        "multimodal_fusion", "fusion_dense_256", "fusion_bn_256", "fusion_dropout_256", 
        "fusion_dense_128", "fusion_dropout_128", "disease_output"
    ]

    # Model save checkpoints
    phase1_ckpt = os.path.join(models_dir, "best_model_phase1.keras")
    phase2_ckpt = os.path.join(models_dir, "best_model_phase2.keras")
    phase3_ckpt = os.path.join(models_dir, "best_model_phase3.keras")
    
    training_log_path = os.path.join(outputs_dir, "training_log.csv")

    # =========================================================================
    # PHASE 1: Frozen Base (PlantVillage)
    # =========================================================================
    print("\n🚀 --- PHASE 1: Frozen Base (PlantVillage) ---")
    
    train_metadata_path = os.path.join(processed_dir, "train_metadata.csv")
    val_metadata_path = os.path.join(processed_dir, "val_metadata.csv")
    
    train_subset_path = train_metadata_path
    val_subset_path = val_metadata_path
    
    if args.dry_run:
        train_subset_path = os.path.join(processed_dir, "train_subset_verify1.csv")
        val_subset_path = os.path.join(processed_dir, "val_subset_verify1.csv")
        pd.read_csv(train_metadata_path).sample(frac=0.002, random_state=42).to_csv(train_subset_path, index=False)
        pd.read_csv(val_metadata_path).sample(frac=0.01, random_state=42).to_csv(val_subset_path, index=False)
        
    p1_batch_size = int(hyperparams["batch_size"]) if not args.dry_run else 8
    p1_epochs = 20 if not args.dry_run else 1
    
    train_ds = create_multimodal_dataset(
        train_subset_path, data_dir, tokenizer, batch_size=p1_batch_size, is_training=True
    )
    val_ds = create_multimodal_dataset(
        val_subset_path, data_dir, tokenizer, batch_size=p1_batch_size, is_training=False
    )
    
    # Build initial model
    model = build_multimodal_model(
        num_classes=38,
        vocab_size=5000,
        max_seq_len=50,
        embedding_dim=128,
        lstm_units=int(hyperparams["lstm_units"]),
        image_projection_dim=256,
        text_projection_dim=64,
        fc_units=int(hyperparams["dense_units"]),
        dropout_rate_img=float(hyperparams["dropout_rate"]),
        dropout_rate_txt=float(hyperparams["dropout_rate"]),
        dropout_rate_fusion=float(hyperparams["dropout_rate"]),
        fine_tune_base=False  # Base EfficientNet model frozen
    )
    
    # Compile
    model = compile_model(model, lr=float(hyperparams["learning_rate"]))
    
    # Callbacks
    callbacks_ph1 = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        ModelCheckpoint(filepath=phase1_ckpt, monitor="val_loss", save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=3, min_lr=1e-6, verbose=1),
        TensorBoard(log_dir=os.path.join(outputs_dir, "logs/phase1")),
        CSVLogger(filename=training_log_path, append=False)
    ]
    
    print("Training only top layers...")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=p1_epochs,
        callbacks=callbacks_ph1
    )

    # Cleanup dry-run files
    if args.dry_run:
        try:
            os.remove(train_subset_path)
            os.remove(val_subset_path)
        except OSError:
            pass

    # =========================================================================
    # PHASE 2: Fine-tune EfficientNetB3 (PlantVillage)
    # =========================================================================
    print("\n🚀 --- PHASE 2: Fine-tune EfficientNetB3 (PlantVillage) ---")
    
    # Load best weights from Phase 1
    if os.path.exists(phase1_ckpt):
        print(f"Restoring best weights from Phase 1: {phase1_ckpt}")
        model.load_weights(phase1_ckpt)
        
    # Unfreeze top 30 layers of EfficientNet
    base_layers = [l for l in model.layers if l.name not in non_base_names]
    print(f"Total backbone layers: {len(base_layers)}. Freezing all except the top 30 layers.")
    for layer in base_layers[:-30]:
        layer.trainable = False
    for layer in base_layers[-30:]:
        layer.trainable = True
        
    # Compile with low learning rate
    model = compile_model(model, lr=1e-5)
    
    if args.dry_run:
        train_subset_path = os.path.join(processed_dir, "train_subset_verify2.csv")
        val_subset_path = os.path.join(processed_dir, "val_subset_verify2.csv")
        pd.read_csv(train_metadata_path).sample(frac=0.002, random_state=42).to_csv(train_subset_path, index=False)
        pd.read_csv(val_metadata_path).sample(frac=0.01, random_state=42).to_csv(val_subset_path, index=False)
        
    p2_batch_size = int(hyperparams["batch_size"]) if not args.dry_run else 8
    p2_epochs = 15 if not args.dry_run else 1
    
    train_ds = create_multimodal_dataset(
        train_subset_path, data_dir, tokenizer, batch_size=p2_batch_size, is_training=True
    )
    val_ds = create_multimodal_dataset(
        val_subset_path, data_dir, tokenizer, batch_size=p2_batch_size, is_training=False
    )
    
    callbacks_ph2 = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        ModelCheckpoint(filepath=phase2_ckpt, monitor="val_loss", save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=3, min_lr=1e-6, verbose=1),
        TensorBoard(log_dir=os.path.join(outputs_dir, "logs/phase2")),
        CSVLogger(filename=training_log_path, append=True)
    ]
    
    print("Fine-tuning top 30 layers...")
    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=p2_epochs,
        callbacks=callbacks_ph2
    )

    if args.dry_run:
        try:
            os.remove(train_subset_path)
            os.remove(val_subset_path)
        except OSError:
            pass

    # =========================================================================
    # PHASE 3: Domain Adaptation (PlantDoc)
    # =========================================================================
    print("\n🚀 --- PHASE 3: Domain Adaptation (PlantDoc) ---")
    
    # Load best weights from Phase 2
    if os.path.exists(phase2_ckpt):
        print(f"Restoring best weights from Phase 2: {phase2_ckpt}")
        model.load_weights(phase2_ckpt)
        
    # Unfreeze entire model
    for layer in model.layers:
        layer.trainable = True
        
    # Compile with very low learning rate
    model = compile_model(model, lr=5e-6)
    
    pd_train_csv = os.path.join(processed_dir, "fine_tune", "train_metadata.csv")
    pd_test_csv = os.path.join(processed_dir, "fine_tune", "test_metadata.csv")
    
    pd_train_subset = pd_train_csv
    pd_test_subset = pd_test_csv
    
    if args.dry_run:
        pd_train_subset = os.path.join(processed_dir, "fine_tune", "train_subset_verify3.csv")
        pd_test_subset = os.path.join(processed_dir, "fine_tune", "val_subset_verify3.csv")
        pd.read_csv(pd_train_csv).sample(frac=0.01, random_state=42).to_csv(pd_train_subset, index=False)
        pd.read_csv(pd_test_csv).sample(frac=0.02, random_state=42).to_csv(pd_test_subset, index=False)
        
    p3_batch_size = 16 if not args.dry_run else 8
    p3_epochs = 10 if not args.dry_run else 1
    
    pd_train_ds = create_multimodal_dataset(
        pd_train_subset, data_dir, tokenizer, batch_size=p3_batch_size, is_training=True
    )
    pd_val_ds = create_multimodal_dataset(
        pd_test_subset, data_dir, tokenizer, batch_size=p3_batch_size, is_training=False
    )
    
    callbacks_ph3 = [
        EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True, verbose=1),
        ModelCheckpoint(filepath=phase3_ckpt, monitor="val_loss", save_best_only=True, verbose=1),
        ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=3, min_lr=1e-7, verbose=1),
        TensorBoard(log_dir=os.path.join(outputs_dir, "logs/phase3")),
        CSVLogger(filename=training_log_path, append=True)
    ]
    
    print("Adapting model to PlantDoc domain...")
    model.fit(
        pd_train_ds,
        validation_data=pd_val_ds,
        epochs=p3_epochs,
        callbacks=callbacks_ph3
    )
    
    # Evaluate on PlantDoc test split
    print("\n📊 Evaluating on PlantDoc Test Split...")
    eval_results = model.evaluate(pd_val_ds, verbose=1)
    metrics_names = model.metrics_names
    for name, val in zip(metrics_names, eval_results):
        print(f"  PlantDoc Test {name}: {val:.4f}")

    if args.dry_run:
        try:
            os.remove(pd_train_subset)
            os.remove(pd_test_subset)
        except OSError:
            pass

    # Save final model and class list
    final_h5_path = os.path.join(models_dir, "agro_disease_model.h5")
    final_keras_path = os.path.join(models_dir, "agro_disease_model.keras")
    
    print(f"\n💾 Saving final model as H5 to {final_h5_path}...")
    model.save(final_h5_path)
    model.save(final_keras_path)
    
    class_names_path = os.path.join(outputs_dir, "class_names.json")
    print(f"💾 Saving class names list to {class_names_path}...")
    with open(class_names_path, "w", encoding="utf-8") as f:
        json.dump(CLASSES, f, indent=4)
        
    # Plot final combined log curves
    plot_curves_path = os.path.join(outputs_dir, "combined_training_curves.png")
    plot_history(training_log_path, plot_curves_path)
    
    print("\n✅ 3-Phase Training Pipeline completed successfully!")

if __name__ == "__main__":
    main()
