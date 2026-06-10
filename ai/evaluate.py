import os
import json
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc, roc_auc_score
import tensorflow as tf

from utils.data_loader import load_tokenizer_pkl, create_multimodal_dataset
from utils.preprocess import CLASSES, CLASS_TO_IDX

# Disable GPU allocation logs
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

def evaluate_dataset(model, tokenizer, dataset_name, csv_path, data_dir, eval_outputs_dir, dry_run=False):
    """
    Evaluates the model on a specific test dataset and outputs metrics, confusion matrices, and ROC curves.
    """
    print(f"\n📊 Evaluating on {dataset_name} ({csv_path})...")
    
    if not os.path.exists(csv_path):
        print(f"[WARNING] CSV path {csv_path} not found. Skipping evaluation for {dataset_name}.")
        return None
        
    df = pd.read_csv(csv_path)
    if len(df) == 0:
        print(f"[WARNING] CSV {csv_path} is empty. Skipping.")
        return None
        
    if dry_run:
        sample_size = min(30, len(df))
        df = df.sample(n=sample_size, random_state=42)
        temp_csv_path = csv_path.replace(".csv", "_dry_run.csv")
        df.to_csv(temp_csv_path, index=False)
        csv_path = temp_csv_path
        
    # Create dataset loader
    ds = create_multimodal_dataset(
        csv_path,
        data_dir,
        tokenizer,
        max_seq_len=50,
        batch_size=32,
        is_training=False
    )
    
    # Predict and collect labels
    y_true_onehot_list = []
    y_pred_probs_list = []
    
    for inputs, labels in ds:
        preds = model.predict(inputs, verbose=0)
        y_true_onehot_list.append(labels.numpy())
        y_pred_probs_list.append(preds)
        
    y_true_onehot = np.concatenate(y_true_onehot_list, axis=0)  # Shape: (N, 38)
    y_pred_probs = np.concatenate(y_pred_probs_list, axis=0)    # Shape: (N, 38)
    
    y_true = np.argmax(y_true_onehot, axis=1)                   # Shape: (N,)
    y_pred = np.argmax(y_pred_probs, axis=1)                    # Shape: (N,)
    
    # Calculate Overall Accuracy
    overall_acc = np.mean(y_true == y_pred)
    
    # Calculate Top-3 Accuracy
    top_3_preds = np.argsort(y_pred_probs, axis=1)[:, -3:]      # Shape: (N, 3)
    top_3_acc = np.mean([t_lbl in t_pred for t_lbl, t_pred in zip(y_true, top_3_preds)])
    
    # Calculate Mean OVR Macro AUC
    # Handling classes that may have no samples in this specific split
    valid_classes = [c for c in range(38) if np.sum(y_true_onehot[:, c]) > 0]
    
    if len(valid_classes) > 1:
        # Calculate AUC for classes present in the labels
        ovr_auc = roc_auc_score(
            y_true_onehot[:, valid_classes], 
            y_pred_probs[:, valid_classes], 
            average="macro", 
            multi_class="ovr"
        )
    else:
        ovr_auc = 0.0
        
    print(f"  Overall Accuracy: {overall_acc:.4f}")
    print(f"  Top-3 Accuracy:   {top_3_acc:.4f}")
    print(f"  Macro AUC (OVR):  {ovr_auc:.4f}")
    
    # Per-class classification report
    report_dict = classification_report(
        y_true, 
        y_pred, 
        labels=range(38), 
        target_names=CLASSES, 
        output_dict=True, 
        zero_division=0
    )
    
    # Save text report
    report_text = classification_report(
        y_true, 
        y_pred, 
        labels=range(38), 
        target_names=CLASSES, 
        zero_division=0
    )
    
    report_txt_path = os.path.join(eval_outputs_dir, f"{dataset_name}_classification_report.txt")
    with open(report_txt_path, "w", encoding="utf-8") as f:
        f.write(f"=== {dataset_name} EVALUATION REPORT ===\n")
        f.write(f"Samples count: {len(y_true)}\n")
        f.write(f"Overall Accuracy: {overall_acc:.4f}\n")
        f.write(f"Top-3 Accuracy: {top_3_acc:.4f}\n")
        f.write(f"Macro AUC: {ovr_auc:.4f}\n\n")
        f.write(report_text)
    print(f"  Saved report text to {report_txt_path}")
    
    # 1. Confusion Matrix Heatmap
    cm = confusion_matrix(y_true, y_pred, labels=range(38))
    
    # Keep only active classes in the confusion matrix plot for cleaner visual presentation
    active_labels = sorted(list(set(y_true) | set(y_pred)))
    if len(active_labels) > 0:
        cm_filtered = cm[np.ix_(active_labels, active_labels)]
        active_class_names = [CLASSES[i].split("___")[-1] for i in active_labels]
        
        plt.figure(figsize=(14, 12))
        sns.heatmap(
            cm_filtered,
            annot=len(active_labels) <= 15,  # only annotate if labels list is small
            fmt="d",
            cmap="Greens",
            xticklabels=active_class_names,
            yticklabels=active_class_names
        )
        plt.title(f"Confusion Matrix Heatmap ({dataset_name})")
        plt.xlabel("Predicted Class")
        plt.ylabel("True Class")
        plt.xticks(rotation=90, fontsize=8)
        plt.yticks(rotation=0, fontsize=8)
        plt.tight_layout()
        cm_plot_path = os.path.join(eval_outputs_dir, f"{dataset_name}_confusion_matrix.png")
        plt.savefig(cm_plot_path, dpi=150)
        plt.close()
        print(f"  Saved Confusion Matrix to {cm_plot_path}")
        
    # 2. ROC Curves (One-vs-Rest)
    plt.figure(figsize=(12, 10))
    for c in valid_classes:
        fpr, tpr, _ = roc_curve(y_true_onehot[:, c], y_pred_probs[:, c])
        class_auc = auc(fpr, tpr)
        # Shorten label for the legend
        short_class_name = CLASSES[c].split("___")[-1].replace("_", " ")
        plt.plot(fpr, tpr, label=f"{short_class_name} (AUC = {class_auc:.2f})")
        
    plt.plot([0, 1], [0, 1], "k--", label="Random Guess")
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title(f"ROC Curves One-vs-Rest ({dataset_name})")
    # Place legend outside if too many classes
    if len(valid_classes) > 10:
        plt.legend(bbox_to_anchor=(1.04, 1), loc="upper left", fontsize=7)
    else:
        plt.legend(loc="lower right", fontsize=8)
    plt.grid(True)
    plt.tight_layout()
    roc_plot_path = os.path.join(eval_outputs_dir, f"{dataset_name}_roc_curves.png")
    plt.savefig(roc_plot_path, dpi=150, bbox_inches="tight" if len(valid_classes) > 10 else None)
    plt.close()
    print(f"  Saved ROC Curves to {roc_plot_path}")
    
    if dry_run:
        try:
            os.remove(temp_csv_path)
        except OSError:
            pass
            
    return {
        "accuracy": overall_acc,
        "top_3_accuracy": top_3_acc,
        "auc": ovr_auc,
        "precision_macro": report_dict["macro avg"]["precision"],
        "recall_macro": report_dict["macro avg"]["recall"],
        "f1_macro": report_dict["macro avg"]["f1-score"],
        "samples": len(y_true)
    }

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Run a quick verification pass with small subsets")
    args = parser.parse_args()
    
    print("📊 --- Starting Robust Multi-Split Evaluation Pipeline --- 📊")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, "data")
    processed_dir = os.path.join(data_dir, "processed")
    models_dir = os.path.join(base_dir, "models")
    eval_outputs_dir = os.path.join(base_dir, "outputs", "evaluation")
    
    os.makedirs(eval_outputs_dir, exist_ok=True)
    
    # Load model and tokenizer
    model_path = os.path.join(models_dir, "agro_disease_model.h5")
    tokenizer_path = os.path.join(base_dir, "data", "tokenizer.pkl")
    
    if not os.path.exists(model_path):
        print(f"[ERROR] Final model not found at {model_path}. Please run train.py first.")
        return
        
    print(f"Loading Keras model from {model_path}...")
    model = tf.keras.models.load_model(model_path)
    tokenizer = load_tokenizer_pkl(tokenizer_path)
    
    # Paths to the 3 test datasets
    datasets_info = [
        {
            "name": "PlantVillage_Test",
            "csv": os.path.join(processed_dir, "test_metadata.csv")
        },
        {
            "name": "PlantDoc_Test",
            "csv": os.path.join(processed_dir, "fine_tune", "test_metadata.csv")
        },
        {
            "name": "Merged_Dataset_StressTest",
            "csv": os.path.join(processed_dir, "stress_test_metadata.csv")
        }
    ]
    
    summary_results = {}
    
    for info in datasets_info:
        res = evaluate_dataset(
            model, 
            tokenizer, 
            info["name"], 
            info["csv"], 
            data_dir, 
            eval_outputs_dir,
            dry_run=args.dry_run
        )
        if res is not None:
            summary_results[info["name"]] = res
            
    # Print a markdown summary table comparing all 3 test sets
    if len(summary_results) > 0:
        print("\n📋 === SUMMARY METRICS COMPARISON TABLE ===")
        print("| Dataset Name | Samples | Accuracy | Top-3 Accuracy | Macro AUC | Macro F1-Score | Macro Precision | Macro Recall |")
        print("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |")
        for name, metrics in summary_results.items():
            print(f"| {name} | {metrics['samples']} | {metrics['accuracy']:.4f} | {metrics['top_3_accuracy']:.4f} | {metrics['auc']:.4f} | {metrics['f1_macro']:.4f} | {metrics['precision_macro']:.4f} | {metrics['recall_macro']:.4f} |")
            
        # Write table to summary_comparison.md in outputs
        comparison_md_path = os.path.join(eval_outputs_dir, "summary_comparison.md")
        with open(comparison_md_path, "w", encoding="utf-8") as f:
            f.write("# Summary Metrics Comparison across Test Sets\n\n")
            f.write("| Dataset Name | Samples | Accuracy | Top-3 Accuracy | Macro AUC | Macro F1-Score | Macro Precision | Macro Recall |\n")
            f.write("| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n")
            for name, metrics in summary_results.items():
                f.write(f"| {name} | {metrics['samples']} | {metrics['accuracy']:.4f} | {metrics['top_3_accuracy']:.4f} | {metrics['auc']:.4f} | {metrics['f1_macro']:.4f} | {metrics['precision_macro']:.4f} | {metrics['recall_macro']:.4f} |\n")
        print(f"\nSaved summary comparison table to {comparison_md_path}")
        
    print("\n✅ Multi-split evaluation completed successfully!")

if __name__ == "__main__":
    main()
