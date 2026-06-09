import os
import cv2
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import base64
from io import BytesIO

def get_last_conv_layer_name(model):
    """
    Dynamically finds the name of the last Conv2D layer in the image branch
    (EfficientNetB3) by walking backward through the model layers.
    """
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D) or ("conv" in layer.name and "project" not in layer.name and "fusion" not in layer.name):
            return layer.name
    return "top_activation"

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, text_array=None):
    """
    Computes Grad-CAM heatmap for a given image and text input.
    """
    conv_layer = model.get_layer(last_conv_layer_name)
    
    grad_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[conv_layer.output, model.output]
    )
    
    # 3. Compute the gradients of the top predicted class for our input image
    with tf.GradientTape() as tape:
        # Cast inputs
        inputs = {"image_input": img_array}
        if text_array is not None:
            inputs["text_input"] = text_array
            
        conv_outputs, predictions = grad_model(inputs)
        loss = tf.reduce_max(predictions, axis=-1)
        
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
    return heatmap.numpy()

def overlay_heatmap(img_path, heatmap, alpha=0.4, colormap=cv2.COLORMAP_JET):
    """
    Overlays the Grad-CAM heatmap onto the original image.
    """
    # Load original image
    img = cv2.imread(img_path)
    if img is None:
        raise FileNotFoundError(f"Image not found: {img_path}")
        
    img = cv2.resize(img, (224, 224))
    
    # Resize heatmap to match original image size
    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    
    # Convert heatmap to 0-255 range and apply colormap
    heatmap = np.uint8(255 * heatmap)
    heatmap_color = cv2.applyColorMap(heatmap, colormap)
    
    # Superimpose heatmap onto original image
    superimposed_img = cv2.addWeighted(img, 1 - alpha, heatmap_color, alpha, 0)
    return superimposed_img

def get_image_base64(img_bgr):
    """
    Converts a BGR OpenCV image into a base64 encoded JPEG string.
    """
    _, buffer = cv2.imencode('.jpg', img_bgr)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"

def compute_text_saliency(model, tokenizer, text_sequence, class_idx):
    """
    Computes gradient-based word saliency (attribution) for the text input tokens.
    """
    # Retrieve the embedding layer
    embedding_layer = model.get_layer("text_embedding")
    
    # We create a sub-model from the text input to the embedding output
    text_input = model.get_layer("text_input").input
    
    # In Keras, we can compute gradients of the class prediction w.r.t the Embedding layer output
    # Build a submodel that outputs embedding and the final prediction
    embed_model = tf.keras.models.Model(
        inputs=model.inputs,
        outputs=[embedding_layer.output, model.output]
    )
    
    # Format sequence as batch of 1
    seq_batch = np.array([text_sequence])
    dummy_img = np.zeros((1, 224, 224, 3), dtype=np.float32)
    
    with tf.GradientTape() as tape:
        inputs = {"image_input": dummy_img, "text_input": seq_batch}
        embeddings, predictions = embed_model(inputs)
        class_score = predictions[0, class_idx]
        
    # Gradient of the class score w.r.t the embedding vectors
    grads = tape.gradient(class_score, embeddings)[0] # Shape: (max_seq_len, embedding_dim)
    
    # Saliency is the L2 norm of gradients across embedding dimensions for each token
    saliency = tf.norm(grads, axis=-1).numpy()
    
    # Map back to words
    reverse_word_index = {v: k for k, v in tokenizer.word_index.items()}
    words = []
    attributions = []
    
    for idx, token_id in enumerate(text_sequence):
        if token_id == 0:
            break # Padding reached
        word = reverse_word_index.get(token_id, "<UNK>")
        words.append(word)
        attributions.append(float(saliency[idx]))
        
    # Normalize attributions to sum to 1.0 (relative percentage)
    total = sum(attributions)
    if total > 0:
        attributions = [attr / total for attr in attributions]
        
    return list(zip(words, attributions))
