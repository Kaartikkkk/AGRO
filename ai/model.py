import os
import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB3
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.metrics import AUC, Precision, Recall, TopKCategoricalAccuracy, F1Score
from tensorflow.keras.utils import plot_model

def build_multimodal_model(
    num_classes=38,
    image_shape=(224, 224, 3),
    vocab_size=5000,
    max_seq_len=50,
    embedding_dim=128,
    lstm_units=128,
    image_projection_dim=256,
    text_projection_dim=64,
    fc_units=256,
    dropout_rate_img=0.4,
    dropout_rate_txt=0.3,
    dropout_rate_fusion=0.3,
    fine_tune_base=False
):
    """
    Builds the updated Multimodal Plant Disease Detection model:
    - Image Branch: EfficientNetB3 (initially frozen) + Dense projection layers.
    - Text Branch: Embedding + SpatialDropout1D + Bidirectional LSTM + GlobalMaxPooling1D.
    - Fusion: Concatenation -> Dense layers -> Softmax output.
    """
    
    # ------------------ Image Branch ------------------
    image_input = layers.Input(shape=image_shape, dtype='float32', name='image_input')
    
    # Load EfficientNetB3 base model
    base_model = EfficientNetB3(
        include_top=False,
        weights='imagenet',
        input_tensor=image_input
    )
    base_model.trainable = fine_tune_base
    
    # Image projection branch
    x_img = layers.GlobalAveragePooling2D(name='image_gap')(base_model.output)
    x_img = layers.Dense(512, activation='relu', name='image_dense_512')(x_img)
    x_img = layers.BatchNormalization(name='image_bn_512')(x_img)
    x_img = layers.Dropout(dropout_rate_img, name='image_dropout_512')(x_img)
    x_img = layers.Dense(image_projection_dim, activation='relu', name='image_projection')(x_img)
    
    # ------------------ Text Branch ------------------
    text_input = layers.Input(shape=(max_seq_len,), dtype='int32', name='text_input')
    
    x_txt = layers.Embedding(
        input_dim=vocab_size,
        output_dim=embedding_dim,
        input_length=max_seq_len,
        mask_zero=False,  # Set to False to maintain clean TFLite compilation
        name='text_embedding'
    )(text_input)
    
    x_txt = layers.SpatialDropout1D(0.2, name='text_spatial_dropout')(x_txt)
    
    # Unroll is set to True to prevent dynamic control flow / Flex ops in TFLite conversion
    x_txt = layers.Bidirectional(
        layers.LSTM(lstm_units, return_sequences=True, unroll=True),
        name='text_bilstm'
    )(x_txt)
    
    # GlobalMaxPooling1D acts as sequence attention pooling
    x_txt = layers.GlobalMaxPooling1D(name='text_gmp')(x_txt)
    
    x_txt = layers.Dense(128, activation='relu', name='text_dense_128')(x_txt)
    x_txt = layers.Dropout(dropout_rate_txt, name='text_dropout_128')(x_txt)
    x_txt = layers.Dense(text_projection_dim, activation='relu', name='text_projection')(x_txt)
    
    # ------------------ Fusion Branch ------------------
    fused = layers.concatenate([x_img, x_txt], name='multimodal_fusion') # 256 + 64 = 320-dim vector
    
    x_fused = layers.Dense(fc_units, activation='relu', name='fusion_dense_256')(fused)
    x_fused = layers.BatchNormalization(name='fusion_bn_256')(x_fused)
    x_fused = layers.Dropout(dropout_rate_fusion, name='fusion_dropout_256')(x_fused)
    
    x_fused = layers.Dense(128, activation='relu', name='fusion_dense_128')(x_fused)
    x_fused = layers.Dropout(0.2, name='fusion_dropout_128')(x_fused)
    
    # Softmax output
    output = layers.Dense(num_classes, activation='softmax', name='disease_output')(x_fused)
    
    return model

def build_unimodal_model(
    num_classes=38,
    image_shape=(224, 224, 3),
    image_projection_dim=256,
    fc_units=256,
    dropout_rate_img=0.4,
    dropout_rate_fusion=0.3,
    fine_tune_base=False
):
    """
    Builds the Unimodal Plant Disease Detection model (Image-only branch).
    - Image Branch: EfficientNetB3 + GlobalAveragePooling2D + Dense layers.
    - Output: Softmax disease_output.
    """
    image_input = layers.Input(shape=image_shape, dtype='float32', name='image_input')
    
    # Load EfficientNetB3 base model
    base_model = EfficientNetB3(
        include_top=False,
        weights='imagenet',
        input_tensor=image_input
    )
    base_model.trainable = fine_tune_base
    
    # Image projection branch
    x_img = layers.GlobalAveragePooling2D(name='image_gap')(base_model.output)
    x_img = layers.Dense(512, activation='relu', name='image_dense_512')(x_img)
    x_img = layers.BatchNormalization(name='image_bn_512')(x_img)
    x_img = layers.Dropout(dropout_rate_img, name='image_dropout_512')(x_img)
    x_img = layers.Dense(image_projection_dim, activation='relu', name='image_projection')(x_img)
    
    # Classification head
    x = layers.Dense(fc_units, activation='relu', name='fusion_dense_256')(x_img)
    x = layers.BatchNormalization(name='fusion_bn_256')(x)
    x = layers.Dropout(dropout_rate_fusion, name='fusion_dropout_256')(x)
    
    x = layers.Dense(128, activation='relu', name='fusion_dense_128')(x)
    x = layers.Dropout(0.2, name='fusion_dropout_128')(x)
    
    # Softmax output
    output = layers.Dense(num_classes, activation='softmax', name='disease_output')(x)
    
    # Assemble model
    model = Model(inputs=image_input, outputs=output, name='plant_disease_unimodal')
    
    return model

def compile_model(model, lr=1e-3):
    """
    Compiles the model using categorical crossentropy and specified evaluation metrics.
    """
    model.compile(
        optimizer=Adam(learning_rate=lr),
        loss="categorical_crossentropy",
        metrics=[
            "accuracy",
            TopKCategoricalAccuracy(k=3, name="top_3_accuracy"),
            AUC(name="auc"),
            Precision(name="precision"),
            Recall(name="recall"),
            F1Score(average="macro", name="f1_score")
        ]
    )
    return model

if __name__ == "__main__":
    # Test model shape compilation
    model = build_multimodal_model()
    model = compile_model(model)
    model.summary()
    
    # Save model architecture plot
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_img_path = os.path.join(base_dir, "outputs", "model_architecture.png")
    os.makedirs(os.path.dirname(output_img_path), exist_ok=True)
    
    try:
        plot_model(
            model,
            to_file=output_img_path,
            show_shapes=True,
            show_layer_names=True
        )
        print(f"Model architecture diagram successfully plotted to {output_img_path}")
    except Exception as e:
        print(f"[WARNING] plot_model failed ({e}). This is expected if pydot or graphviz is not installed on the system.")
