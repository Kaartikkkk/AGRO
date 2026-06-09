import os
import multiprocessing

# Gunicorn configuration
bind = "0.0.0.0:5001"
workers = 2  # Keep workers small to fit CPU memory sandbox
timeout = 120  # Set generous timeout for model load/inference
loglevel = "info"
accesslog = "-"
errorlog = "-"
capture_output = True
preload_app = True
