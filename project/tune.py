import os
import json
import optuna
import pandas as pd
from tensorflow.keras.optimizers import Adam
from model import build_multimodal_model
from data_loader import fit_and_save_tokenizer, create_multimodal_dataset

# Disable verbose TF logging during tuning
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

def objective(trial):
    # Setup base directories
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    processed_dir = os.path.join(data_dir, "processed")
    tokenizer_path = os.path.join(base_dir, "outputs", "tokenizer.json")
    
    # 1. Hyperparameters to search
    lr = trial.suggest_float("learning_rate", 1e-4, 1e-3, log=True)
    dropout_rate = trial.suggest_float("dropout_rate", 0.2, 0.5)
    embedding_dim = trial.suggest_int("embedding_dim", 64, 256, step=64)
    lstm_units = trial.suggest_int("lstm_units", 32, 128, step=32)
    projection_dim = trial.suggest_int("projection_dim", 64, 256, step=64)
    fc_units = trial.suggest_int("fc_units", 128, 512, step=128)
    
    # 2. Load metadata
    train_csv = os.path.join(processed_dir, "train_metadata.csv")
    val_csv = os.path.join(processed_dir, "val_metadata.csv")
    
    train_df = pd.read_csv(train_csv)
    val_df = pd.read_csv(val_csv)
    
    # Take a small sample for rapid execution during hyperparameter search demonstration
    train_subset_path = os.path.join(processed_dir, "train_subset_tune.csv")
    val_subset_path = os.path.join(processed_dir, "val_subset_tune.csv")
    
    train_df.sample(frac=0.002, random_state=42).to_csv(train_subset_path, index=False)
    val_df.sample(frac=0.01, random_state=42).to_csv(val_subset_path, index=False)
    
    # Ensure tokenizer is fitted
    if not os.path.exists(tokenizer_path):
        fit_and_save_tokenizer(train_df, tokenizer_path)
    
    from data_loader import load_tokenizer
    tokenizer = load_tokenizer(tokenizer_path)
    
    # 3. Create datasets
    train_ds = create_multimodal_dataset(
        train_subset_path, data_dir, tokenizer, batch_size=16, is_training=True
    )
    val_ds = create_multimodal_dataset(
        val_subset_path, data_dir, tokenizer, batch_size=16, is_training=False
    )
    
    # 4. Build Model
    model = build_multimodal_model(
        num_classes=38,
        vocab_size=5000,
        max_seq_len=50,
        embedding_dim=embedding_dim,
        lstm_units=lstm_units,
        image_projection_dim=projection_dim,
        text_projection_dim=projection_dim,
        fc_units=fc_units,
        dropout_rate=dropout_rate,
        fine_tune_base=False  # Freeze EfficientNet during initial tuning
    )
    
    # Compile
    model.compile(
        optimizer=Adam(learning_rate=lr),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    
    # 5. Train
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=3,
        verbose=0
    )
    
    # Return validation accuracy of last epoch
    val_acc = history.history["val_accuracy"][-1]
    
    # Clean up subset files to keep repo tidy
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
    
    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=5)
    
    print("\n✅ Tuning complete!")
    print(f"Best trial value (val accuracy): {study.best_trial.value:.4f}")
    print("Best hyperparameters:")
    for key, value in study.best_trial.params.items():
        print(f"  {key}: {value}")
        
    # Save best parameters to JSON
    best_params_path = os.path.join(outputs_dir, "best_hyperparams.json")
    with open(best_params_path, "w", encoding="utf-8") as f:
        json.dump(study.best_trial.params, f, indent=4)
        
    print(f"Saved best parameters to {best_params_path}")

if __name__ == "__main__":
    main()
