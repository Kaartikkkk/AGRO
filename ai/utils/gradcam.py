import os
import cv2
import numpy as np
import tensorflow as tf
import base64

def get_last_conv_layer_name(model):
    """
    Dynamically finds the name of the last Conv2D layer in the image branch
    (EfficientNetB3) by walking backward through the model layers.
    """
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D) or ("conv" in layer.name and "project" not in layer.name and "fusion" not in layer.name):
            return layer.name
    return "top_activation"

def generate_gradcam(model, img_array, class_idx, last_conv_layer_name=None, text_array=None, original_img=None, alpha=0.4):
    """
    Computes Grad-CAM heatmap for a given class and returns a colormap-overlayed base64 JPEG string.
    """
    if last_conv_layer_name is None:
        last_conv_layer_name = get_last_conv_layer_name(model)
        
    conv_layer = model.get_layer(last_conv_layer_name)
    
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[conv_layer.output, model.output]
    )
    
    # 3. Compute the gradients of the top predicted class for our input image
    with tf.GradientTape() as tape:
        if len(model.inputs) > 1:
            inputs = {"image_input": img_array}
            if text_array is not None:
                inputs["text_input"] = text_array
            else:
                inputs["text_input"] = np.zeros((1, 50), dtype=np.int32)
            conv_outputs, predictions = grad_model(inputs)
        else:
            conv_outputs, predictions = grad_model(img_array)
            
        loss = predictions[0, class_idx]
        
    # Gradients of loss w.r.t. the last conv layer output feature map
    grads = tape.gradient(loss, conv_outputs)
    
    # Vector of mean gradients per channel (feature map importance)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
    
    # Weight the channel feature map by channel importance
    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)
    
    # ReLU to keep only positive contributions, and normalize
    heatmap = tf.maximum(heatmap, 0.0) / (tf.reduce_max(heatmap) + 1e-10)
    heatmap_numpy = heatmap.numpy()
    
    # Overlay heatmap and convert to base64
    return overlay_heatmap(heatmap_numpy, original_img, alpha)

def overlay_heatmap(heatmap, original_img, alpha=0.4, colormap=cv2.COLORMAP_JET):
    """
    Blends heatmap with original image (can be path string or numpy array)
    and returns base64 encoded result.
    """
    if isinstance(original_img, str):
        img = cv2.imread(original_img)
        if img is None:
            raise FileNotFoundError(f"Image not found: {original_img}")
    elif isinstance(original_img, np.ndarray):
        img = original_img.copy()
    else:
        # Default fallback: create standard black image
        img = np.zeros((224, 224, 3), dtype=np.uint8)
        
    img = cv2.resize(img, (224, 224))
    
    # Resize heatmap to match image size
    heatmap_resized = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    
    # Convert heatmap to 0-255 range and apply colormap
    heatmap_color = np.uint8(255 * heatmap_resized)
    heatmap_color = cv2.applyColorMap(heatmap_color, colormap)
    
    # Superimpose heatmap onto original image
    superimposed_img = cv2.addWeighted(img, 1 - alpha, heatmap_color, alpha, 0)
    
    # Convert to base64
    _, buffer = cv2.imencode('.jpg', superimposed_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"
