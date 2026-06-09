#!/bin/bash
set -e

echo "🌾 --- AgroSmart ML Pipeline Setup --- 🌾"

# Define base directory
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$BASE_DIR"

# 1. Create directory structure
echo "Creating directory structure..."
mkdir -p project/models
mkdir -p project/outputs
mkdir -p project/data/processed
mkdir -p api

# 2. Setup virtual environment
echo "Setting up virtual environment in project/venv..."
if [ ! -d "project/venv" ]; then
    python3 -m venv project/venv
    echo "Virtual environment created."
else
    echo "Virtual environment already exists."
fi

# Activate virtual environment
source project/venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install requirements
if [ -f "requirements.txt" ]; then
    echo "Installing python packages from requirements.txt..."
    pip install -r requirements.txt
else
    echo "[WARNING] requirements.txt not found!"
fi

echo "✅ AgroSmart setup completed successfully!"
echo "To activate the environment, run: source project/venv/bin/activate"
