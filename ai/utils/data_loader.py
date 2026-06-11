import os
import pickle
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Disable GPU/MPS tracking for tf.data map functions to avoid thread warnings
os.environ["TF_GPU_ALLOCATOR"] = "cuda_malloc_async"

# Define Keras layers for image augmentations
AUGMENTATION_LAYERS = tf.keras.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(factor=20.0/360.0),
    layers.RandomZoom(height_factor=(-0.1, 0.1), width_factor=(-0.1, 0.1)),
    layers.RandomTranslation(height_factor=(-0.1, 0.1), width_factor=(-0.1, 0.1)),
    layers.RandomBrightness(factor=0.15),
    layers.RandomContrast(factor=0.15)
])

def random_erasing(image, probability=0.5, sl=0.02, sh=0.2, r1=0.3):
    """
    TensorFlow native Random Erasing (Cutout) implementation.
    """
    # Check if we should erase
    if tf.random.uniform([]) > probability:
        return image
        
    img_h, img_w, img_c = 224, 224, 3
    area = img_h * img_w
    
    # Erase area fraction
    target_area = tf.random.uniform([], sl, sh) * area
    aspect_ratio = tf.random.uniform([], r1, 1.0/r1)
    
    h = tf.cast(tf.math.round(tf.math.sqrt(target_area * aspect_ratio)), tf.int32)
    w = tf.cast(tf.math.round(tf.math.sqrt(target_area / aspect_ratio)), tf.int32)
    
    h = tf.minimum(h, img_h)
    w = tf.minimum(w, img_w)
    
    # Random position bounds
    h_bound = tf.maximum(1, img_h - h)
    w_bound = tf.maximum(1, img_w - w)
    
    x1 = tf.random.uniform([], 0, h_bound, dtype=tf.int32)
    y1 = tf.random.uniform([], 0, w_bound, dtype=tf.int32)
    
    # Erase region with random noise
    noise = tf.random.uniform((h, w, img_c), 0.0, 1.0)
    
    # Reconstruct the image with the noise region
    padding_top = x1
    padding_bottom = img_h - x1 - h
    padding_left = y1
    padding_right = img_w - y1 - w
    
    noise_padded = tf.pad(noise, [[padding_top, padding_bottom], [padding_left, padding_right], [0, 0]])
    mask_region = tf.pad(tf.zeros((h, w, img_c)), [[padding_top, padding_bottom], [padding_left, padding_right], [0, 0]], constant_values=1.0)
    
    return image * mask_region + noise_padded * (1.0 - mask_region)

def load_tokenizer_pkl(save_path):
    """
    Loads a fitted tokenizer from a pickle file.
    """
    with open(save_path, "rb") as f:
        tokenizer = pickle.load(f)
    return tokenizer

def load_and_preprocess_image(path, size=(224, 224)):
    """
    Decodes leaf images, resizes to 224x224, and keeps pixel values in [0, 255] range as float32.
    EfficientNet application has built-in rescaling layers.
    """
    img = tf.io.read_file(path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, size)
    img = tf.cast(img, tf.float32)  # Keep range [0, 255]
    return img

def create_multimodal_dataset(
    metadata_csv_path,
    data_dir,
    tokenizer,
    max_seq_len=50,
    batch_size=32,
    is_training=True
):
    """
    Creates an optimized tf.data.Dataset representing (image, text) -> one_hot_label.
    """
    if not os.path.exists(metadata_csv_path):
        raise FileNotFoundError(f"Metadata file not found: {metadata_csv_path}")
        
    df = pd.read_csv(metadata_csv_path)
    
    # Resolve absolute image paths
    image_paths = [os.path.join(data_dir, path) for path in df["image_path"].values]
    
    # Tokenize and pad text symptoms
    symptom_texts = df["symptoms"].astype(str).values
    sequences = tokenizer.texts_to_sequences(symptom_texts)
    padded_sequences = pad_sequences(sequences, maxlen=max_seq_len, padding="post")
    
    # One-hot encode labels (shape: [N, 38])
    labels = df["label"].values
    one_hot_labels = tf.one_hot(labels, depth=38)
    
    path_dataset = tf.data.Dataset.from_tensor_slices(image_paths)
    text_dataset = tf.data.Dataset.from_tensor_slices(padded_sequences)
    label_dataset = tf.data.Dataset.from_tensor_slices(one_hot_labels)
    
    # Load/preprocess images
    image_dataset = path_dataset.map(load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    # Apply augmentations on training set ONLY
    if is_training:
        # Map Keras augmentation and custom random erasing
        image_dataset = image_dataset.map(
            lambda img: random_erasing(AUGMENTATION_LAYERS(img, training=True)),
            num_parallel_calls=tf.data.AUTOTUNE
        )
        
    # Combine inputs: (Image, Text) -> One-Hot Label
    input_dataset = tf.data.Dataset.zip((image_dataset, text_dataset))
    dataset = tf.data.Dataset.zip((input_dataset, label_dataset))
    
    dataset = dataset.map(
        lambda inputs, label: (
            {"image_input": inputs[0], "text_input": inputs[1]},
            label
        ),
        num_parallel_calls=tf.data.AUTOTUNE
    )
    
    if is_training:
        dataset = dataset.shuffle(buffer_size=1000)
        
    dataset = dataset.batch(batch_size).prefetch(buffer_size=tf.data.AUTOTUNE)
    return dataset

def create_unimodal_dataset(
    metadata_csv_path,
    data_dir,
    batch_size=32,
    is_training=True,
    subset_fraction=None
):
    """
    Creates an optimized tf.data.Dataset representing image -> one_hot_label.
    """
    if not os.path.exists(metadata_csv_path):
        raise FileNotFoundError(f"Metadata file not found: {metadata_csv_path}")
        
    df = pd.read_csv(metadata_csv_path)
    
    # Stratified subsetting if requested
    if subset_fraction is not None and 0 < subset_fraction < 1.0:
        df = df.groupby("label").sample(frac=subset_fraction, random_state=42)
    
    # Resolve absolute image paths
    image_paths = [os.path.join(data_dir, path) for path in df["image_path"].values]
    
    # One-hot encode labels (shape: [N, 38])
    labels = df["label"].values
    one_hot_labels = tf.one_hot(labels, depth=38)
    
    path_dataset = tf.data.Dataset.from_tensor_slices(image_paths)
    label_dataset = tf.data.Dataset.from_tensor_slices(one_hot_labels)
    
    # Load/preprocess images
    image_dataset = path_dataset.map(load_and_preprocess_image, num_parallel_calls=tf.data.AUTOTUNE)
    
    # Apply augmentations on training set ONLY
    if is_training:
        image_dataset = image_dataset.map(
            lambda img: random_erasing(AUGMENTATION_LAYERS(img, training=True)),
            num_parallel_calls=tf.data.AUTOTUNE
        )
        
    # Combine inputs: image_input -> One-Hot Label
    dataset = tf.data.Dataset.zip((image_dataset, label_dataset))
    
    if is_training:
        dataset = dataset.shuffle(buffer_size=1000)
        
    dataset = dataset.batch(batch_size).prefetch(buffer_size=tf.data.AUTOTUNE)
    return dataset
