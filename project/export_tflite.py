import os
import tensorflow as tf

def convert_and_save(converter, save_path, desc):
    print(f"Converting model with {desc}...")
    try:
        tflite_model = converter.convert()
        with open(save_path, "wb") as f:
            f.write(tflite_model)
        size_mb = os.path.getsize(save_path) / (1024 * 1024)
        print(f"  Successfully exported to: {save_path} ({size_mb:.2f} MB)")
        
        # Simple loading check
        interpreter = tf.lite.Interpreter(model_path=save_path)
        interpreter.allocate_tensors()
        print("  Verified loader: TFLite Interpreter successfully loaded model tensors.")
        return True
    except Exception as e:
        print(f"  [ERROR] Failed to convert with {desc}: {e}")
        return False

def main():
    print("📱 --- Starting TensorFlow Lite Model Export & Quantization Pipeline --- 📱")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_dir, "models")
    final_model_path = os.path.join(models_dir, "plant_disease_model_final.keras")
    
    if not os.path.exists(final_model_path):
        print(f"[ERROR] Final Keras model not found at {final_model_path}. Run train.py first.")
        return
        
    print(f"Loading Keras model from {final_model_path}...")
    model = tf.keras.models.load_model(final_model_path)
    
    # 1. Base Converter
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    # Enable TF Select Ops in case of complex operations in text embedding/LSTM branches
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    
    # Export 1: Standard (Unquantized)
    std_tflite_path = os.path.join(models_dir, "plant_disease_model.tflite")
    convert_and_save(converter, std_tflite_path, "Standard (No Quantization)")
    
    # Export 2: Float16 Quantization (Safe, GPU-friendly)
    f16_converter = tf.lite.TFLiteConverter.from_keras_model(model)
    f16_converter.optimizations = [tf.lite.Optimize.DEFAULT]
    f16_converter.target_spec.supported_types = [tf.float16]
    f16_converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    
    f16_tflite_path = os.path.join(models_dir, "plant_disease_model_quant_f16.tflite")
    convert_and_save(f16_converter, f16_tflite_path, "Float16 Quantization")
    
    # Export 3: Dynamic Range Quantization (High compression, CPU optimized)
    dr_converter = tf.lite.TFLiteConverter.from_keras_model(model)
    dr_converter.optimizations = [tf.lite.Optimize.DEFAULT]
    dr_converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,
        tf.lite.OpsSet.SELECT_TF_OPS
    ]
    
    dr_tflite_path = os.path.join(models_dir, "plant_disease_model_quant_dynamic.tflite")
    convert_and_save(dr_converter, dr_tflite_path, "Dynamic Range Quantization")
    
    print("\n✅ All TFLite exports completed!")

if __name__ == "__main__":
    main()
