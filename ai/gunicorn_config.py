import os
import multiprocessing

# Gunicorn configuration
bind = f"0.0.0.0:{os.environ.get('PORT', '5001')}"
workers = int(os.environ.get('GUNICORN_WORKERS', '1'))  # 1 worker default preserves RAM in cloud for TensorFlow
timeout = 120  # Set generous timeout for model load/inference
loglevel = "info"
accesslog = "-"
errorlog = "-"
capture_output = True
preload_app = True
