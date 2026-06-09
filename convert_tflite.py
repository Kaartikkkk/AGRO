import os
import sys
import time
import json
import numpy as np
import pandas as pd
import tensorflow as tf

def find_workspace_root():
    current = os.path.dirname(os.path.abspath(__file__))
    while current != os.path.dirname(current):
        if os.path.exists(os.path.join(current, "setup.sh")) or os.path.exists(os.path.join(current, "project")):
            return current
        current = os.path.dirname(current)
    return os.path.dirname(os.path.abspath(__file__))

# Setup robust paths
base_dir = find_workspace_root()
project_dir = os.path.join(base_dir, "project")
sys.path.insert(0, project_dir)

from data_loader import load_tokenizer_pkl, load_and_preprocess_image
from data_preprocessing import CLASSES

def main():
    print("📱 --- Starting TensorFlow Lite Model Export & Quantization Pipeline --- 📱")
    
    models_dir = os.path.join(project_dir, "models")
    outputs_dir = os.path.join(project_dir, "outputs")
    data_dir = os.path.join(project_dir, "data")
    
    final_model_path = os.path.join(models_dir, "agro_disease_model.h5")
    tokenizer_path = os.path.join(outputs_dir, "tokenizer.pkl")
    
    if not os.path.exists(final_model_path):
        print(f"[ERROR] Final model not found at {final_model_path}. Run train.py first.")
        sys.exit(1)
        
    print(f"Loading Keras model from {final_model_path}...")
    model = tf.keras.models.load_model(final_model_path)
    
    # 1. Base Converter (float32)
    print("Converting model to float32 TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    
    float32_tflite_path = os.path.join(models_dir, "agro_model_float32.tflite")
    tflite_model_f32 = converter.convert()
    with open(float32_tflite_path, "wb") as f:
        f.write(tflite_model_f32)
    size_f32 = os.path.getsize(float32_tflite_path) / (1024 * 1024)
    print(f"  Saved float32 TFLite model to {float32_tflite_path} ({size_f32:.2f} MB)")
    
    # 2. INT8 Quantization
    print("\nConverting model to INT8 TFLite...")
    
    # Prepare representative dataset
    train_csv = os.path.join(data_dir, "processed", "train_metadata.csv")
    if not os.path.exists(train_csv):
        print(f"[ERROR] Train metadata not found at {train_csv} to build representative dataset.")
        sys.exit(1)
        
    tokenizer = load_tokenizer_pkl(tokenizer_path)
    df_train = pd.read_csv(train_csv).head(100)
    
    # Load float32 model to get the exact input details order expected by TFLite
    print("Loading float32 model to inspect TFLite input details...")
    temp_interpreter = tf.lite.Interpreter(model_path=float32_tflite_path)
    temp_interpreter.allocate_tensors()
    input_details = temp_interpreter.get_input_details()
    tflite_input_names = [d['name'] for d in input_details]
    print("TFLite expected input ordering:", tflite_input_names)
    
    calibration_samples = []
    for _, row in df_train.iterrows():
        img_path = os.path.join(data_dir, row["image_path"])
        img_tensor = load_and_preprocess_image(img_path)
        img_numpy = np.expand_dims(img_tensor.numpy(), axis=0).astype(np.float32) # (1, 224, 224, 3)
        
        seq = tokenizer.texts_to_sequences([row["symptoms"]])
        padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=50, padding="post")[0]
        txt_numpy = np.expand_dims(padded_seq, axis=0).astype(np.int32) # (1, 50)
        
        # Build calibration sample matching TFLite inputs ordering
        sample = []
        for name in tflite_input_names:
            if "image_input" in name:
                sample.append(img_numpy)
            elif "text_input" in name:
                sample.append(txt_numpy)
        calibration_samples.append(sample)
        
    def representative_dataset_gen():
        for sample in calibration_samples:
            yield sample
            
    # Configure converter for INT8 Full Quantization
    quant_converter = tf.lite.TFLiteConverter.from_keras_model(model)
    quant_converter.optimizations = [tf.lite.Optimize.DEFAULT]
    quant_converter.representative_dataset = representative_dataset_gen
    
    # Ensure select TF ops are supported (required for LSTM / Embeddings)
    quant_converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUINS if hasattr(tf.lite.OpsSet, 'TFLITE_BUINS') else tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    
    int8_tflite_path = os.path.join(models_dir, "agro_model_int8.tflite")
    tflite_model_int8 = quant_converter.convert()
    with open(int8_tflite_path, "wb") as f:
        f.write(tflite_model_int8)
    size_int8 = os.path.getsize(int8_tflite_path) / (1024 * 1024)
    print(f"  Saved INT8 quantized TFLite model to {int8_tflite_path} ({size_int8:.2f} MB)")
    
    # =========================================================================
    # Test script: Run inference and compare outputs
    # =========================================================================
    print("\n🔬 --- Starting TFLite Inference Comparison Testing --- 🔬")
    
    test_csv = os.path.join(data_dir, "processed", "test_metadata.csv")
    if not os.path.exists(test_csv):
        print(f"[ERROR] Test metadata not found at {test_csv}.")
        sys.exit(1)
        
    df_test = pd.read_csv(test_csv).head(5)
    
    # Load models
    interpreter_f32 = tf.lite.Interpreter(model_path=float32_tflite_path)
    interpreter_f32.allocate_tensors()
    
    interpreter_int8 = tf.lite.Interpreter(model_path=int8_tflite_path)
    interpreter_int8.allocate_tensors()
    
    # Get input/output tensors details
    input_details_f32 = interpreter_f32.get_input_details()
    output_details_f32 = interpreter_f32.get_output_details()
    
    input_details_int8 = interpreter_int8.get_input_details()
    output_details_int8 = interpreter_int8.get_output_details()
    
    # Map input names to details
    f32_inputs_map = {details['name'].split(':')[0]: details for details in input_details_f32}
    int8_inputs_map = {details['name'].split(':')[0]: details for details in input_details_int8}
    
    # Latency timing helper
    def run_tflite_inference(interpreter, inputs_map, output_details, img, txt):
        start = time.perf_counter()
        
        for name, details in inputs_map.items():
            if "image_input" in name:
                interpreter.set_tensor(details['index'], img)
            elif "text_input" in name:
                interpreter.set_tensor(details['index'], txt)
                
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])
        latency = (time.perf_counter() - start) * 1000.0
        return output, latency

    # Evaluate comparison
    records = []
    for idx, row in df_test.iterrows():
        img_path = os.path.join(data_dir, row["image_path"])
        img_tensor = load_and_preprocess_image(img_path)
        img_numpy = np.expand_dims(img_tensor.numpy(), axis=0).astype(np.float32)
        
        seq = tokenizer.texts_to_sequences([row["symptoms"]])
        padded_seq = tf.keras.preprocessing.sequence.pad_sequences(seq, maxlen=50, padding="post")[0]
        txt_numpy = np.expand_dims(padded_seq, axis=0).astype(np.int32)
        
        # 1. Keras model inference
        t_keras_start = time.perf_counter()
        keras_preds = model.predict({"image_input": img_numpy, "text_input": txt_numpy}, verbose=0)
        keras_latency = (time.perf_counter() - t_keras_start) * 1000.0
        keras_class = np.argmax(keras_preds[0])
        keras_conf = keras_preds[0][keras_class]
        
        # 2. Float32 TFLite inference
        f32_preds, f32_latency = run_tflite_inference(interpreter_f32, f32_inputs_map, output_details_f32, img_numpy, txt_numpy)
        f32_class = np.argmax(f32_preds[0])
        f32_conf = f32_preds[0][f32_class]
        
        # 3. INT8 TFLite inference
        int8_preds, int8_latency = run_tflite_inference(interpreter_int8, int8_inputs_map, output_details_int8, img_numpy, txt_numpy)
        int8_class = np.argmax(int8_preds[0])
        int8_conf = int8_preds[0][int8_class]
        
        records.append({
            "image": os.path.basename(row["image_path"]),
            "keras_class": CLASSES[keras_class],
            "keras_conf": keras_conf,
            "keras_latency_ms": keras_latency,
            "f32_class": CLASSES[f32_class],
            "f32_conf": f32_conf,
            "f32_latency_ms": f32_latency,
            "int8_class": CLASSES[int8_class],
            "int8_conf": int8_conf,
            "int8_latency_ms": int8_latency,
        })
        
    print("\n📋 === LATENCY & PREDICTION COMPARISON === 📋")
    for rec in records:
        print(f"\nImage: {rec['image']}")
        print(f"  Original Keras : Class={rec['keras_class'][:25]:<25} Conf={rec['keras_conf']:.4f} Latency={rec['keras_latency_ms']:.2f}ms")
        print(f"  TFLite Float32 : Class={rec['f32_class'][:25]:<25} Conf={rec['f32_conf']:.4f} Latency={rec['f32_latency_ms']:.2f}ms")
        print(f"  TFLite INT8    : Class={rec['int8_class'][:25]:<25} Conf={rec['int8_conf']:.4f} Latency={rec['int8_latency_ms']:.2f}ms")
        
    print("\n📦 === MODEL SIZE DIFFERENCE REPORT === 📦")
    keras_size = os.path.getsize(final_model_path) / (1024 * 1024)
    print(f"  Original Keras Model   : {keras_size:.2f} MB")
    print(f"  TFLite Float32 Model   : {size_f32:.2f} MB (Compression: {((keras_size - size_f32) / keras_size * 100):.1f}%)")
    print(f"  TFLite INT8 Quantized  : {size_int8:.2f} MB (Compression: {((keras_size - size_int8) / keras_size * 100):.1f}%)")
    
    print("\n✅ TFLite conversion pipeline check completed successfully!")

if __name__ == "__main__":
    main()
