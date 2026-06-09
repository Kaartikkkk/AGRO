import os
import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import optuna
from optuna.visualization.matplotlib import plot_optimization_history, plot_param_importances
import pandas as pd
import tensorflow as tf

from model import build_multimodal_model, compile_model
from data_loader import load_tokenizer_pkl, create_multimodal_dataset

# Disable verbose TF logging
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
# Disable GPU/MPS tracking for tf.data map functions to avoid thread warnings
os.environ["TF_GPU_ALLOCATOR"] = "cuda_malloc_async"

# Enable memory growth for GPU if available
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
    except Exception as e:
        print(f"Error configuring GPU: {e}")

def objective(trial):
    # Setup base directories
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    processed_dir = os.path.join(data_dir, "processed")
    tokenizer_path = os.path.join(base_dir, "outputs", "tokenizer.pkl")
    
    # 1. Hyperparameters to search
    learning_rate = trial.suggest_float("learning_rate", 1e-5, 1e-2, log=True)
    dropout_rate = trial.suggest_float("dropout_rate", 0.2, 0.5)
    dense_units = trial.suggest_categorical("dense_units", [128, 256, 512])
    batch_size = trial.suggest_categorical("batch_size", [16, 32, 64])
    lstm_units = trial.suggest_categorical("lstm_units", [64, 128, 256])
    
    # 2. Load metadata and prepare temporary subsets for rapid trials
    train_csv = os.path.join(processed_dir, "train_metadata.csv")
    val_csv = os.path.join(processed_dir, "val_metadata.csv")
    
    train_df = pd.read_csv(train_csv)
    val_df = pd.read_csv(val_csv)
    
    # Use a tiny subset for tuning speed (otherwise 30 trials takes hours)
    train_subset_path = os.path.join(processed_dir, f"train_subset_tune_{trial.number}.csv")
    val_subset_path = os.path.join(processed_dir, f"val_subset_tune_{trial.number}.csv")
    
    # Sample 0.2% of train and 1% of val
    train_df.sample(frac=0.002, random_state=42).to_csv(train_subset_path, index=False)
    val_df.sample(frac=0.01, random_state=42).to_csv(val_subset_path, index=False)
    
    # Load the tokenizer
    tokenizer = load_tokenizer_pkl(tokenizer_path)
    
    # 3. Create datasets
    train_ds = create_multimodal_dataset(
        train_subset_path, data_dir, tokenizer, batch_size=int(batch_size), is_training=True
    )
    val_ds = create_multimodal_dataset(
        val_subset_path, data_dir, tokenizer, batch_size=int(batch_size), is_training=False
    )
    
    # 4. Build and Compile Model
    model = build_multimodal_model(
        num_classes=38,
        vocab_size=5000,
        max_seq_len=50,
        embedding_dim=128,
        lstm_units=int(lstm_units),
        image_projection_dim=256,
        text_projection_dim=64,
        fc_units=int(dense_units),
        dropout_rate_img=float(dropout_rate),
        dropout_rate_txt=float(dropout_rate),
        dropout_rate_fusion=float(dropout_rate),
        fine_tune_base=False  # Keep base frozen during tuning
    )
    
    model = compile_model(model, lr=learning_rate)
    
    # 5. Fit the model for 1 epoch for tuning validation
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=1,
        verbose=0
    )
    
    # Get the validation accuracy of the last epoch
    val_acc = history.history["val_accuracy"][-1]
    
    # Clean up trial subset files
    try:
        os.remove(train_subset_path)
        os.remove(val_subset_path)
    except OSError:
        pass
        
    return val_acc

def main():
    print("🧪 --- Starting Hyperparameter Tuning with Optuna --- 🧪")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    outputs_dir = os.path.join(base_dir, "outputs")
    os.makedirs(outputs_dir, exist_ok=True)
    
    # Run 30 trials as requested
    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=30)
    
    print("\n✅ Tuning complete!")
    print(f"Best trial value (val accuracy): {study.best_trial.value:.4f}")
    print("Best hyperparameters:")
    for key, value in study.best_trial.params.items():
        print(f"  {key}: {value}")
        
    # Save best parameters to best_params.json and best_hyperparams.json
    best_params_path = os.path.join(outputs_dir, "best_params.json")
    best_hyperparams_path = os.path.join(outputs_dir, "best_hyperparams.json")
    
    with open(best_params_path, "w", encoding="utf-8") as f:
        json.dump(study.best_trial.params, f, indent=4)
    with open(best_hyperparams_path, "w", encoding="utf-8") as f:
        json.dump(study.best_trial.params, f, indent=4)
        
    print(f"Saved best parameters to {best_params_path} and {best_hyperparams_path}")
    
    # Plot optimization history
    try:
        plot_optimization_history(study)
        plt.tight_layout()
        history_plot_path = os.path.join(outputs_dir, "optuna_history.png")
        plt.savefig(history_plot_path)
        plt.close()
        print(f"Saved optimization history plot to {history_plot_path}")
    except Exception as e:
        print(f"[WARNING] Failed to plot optimization history: {e}")
        
    # Plot parameter importances
    try:
        plot_param_importances(study)
        plt.tight_layout()
        importance_plot_path = os.path.join(outputs_dir, "optuna_importance.png")
        plt.savefig(importance_plot_path)
        plt.close()
        print(f"Saved parameter importances plot to {importance_plot_path}")
    except Exception as e:
        print(f"[WARNING] Failed to plot parameter importances: {e}")

if __name__ == "__main__":
    main()
