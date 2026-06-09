import os
import sys
import subprocess
import shutil

def main():
    print("🌾 --- AgroSmart ML Environment Setup --- 🌾")
    
    # Define absolute paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = base_dir
    data_dir = os.path.join(project_dir, "data")
    plantvillage_target = os.path.join(data_dir, "plantvillage")
    plantdoc_target = os.path.join(data_dir, "plantdoc")
    merged_target = os.path.join(data_dir, "merged")
    
    # 1. Create directory structure
    dirs_to_create = [
        os.path.join(data_dir, "plantvillage"),
        os.path.join(data_dir, "plantdoc"),
        os.path.join(data_dir, "merged"),
        os.path.join(data_dir, "processed", "train"),
        os.path.join(data_dir, "processed", "val"),
        os.path.join(data_dir, "processed", "test"),
        os.path.join(project_dir, "models"),
        os.path.join(project_dir, "api"),
        os.path.join(project_dir, "notebooks"),
        os.path.join(project_dir, "outputs"),
    ]
    
    print("Creating folder structure...")
    for d in dirs_to_create:
        os.makedirs(d, exist_ok=True)
        print(f"  Created or verified: {d}")

    # 2. Link/Copy existing datasets from the workspace to save download time
    workspace_root = os.path.dirname(project_dir)
    source_dataset_dir = os.path.join(workspace_root, "ML_Models", "Disease_detection", "Dataset")
    
    pv_source = os.path.join(source_dataset_dir, "PlantVillage")
    pd_source = os.path.join(source_dataset_dir, "PlantDoc-Dataset-master")
    merged_source = os.path.join(source_dataset_dir, "archive (1)")
    
    # Function to establish dataset connection (via symlinks or copying if symlinks fail)
    def link_dataset(source_path, target_path, dataset_name, kaggle_ref):
        if os.path.exists(source_path) and any(os.scandir(source_path)):
            print(f"Found existing raw {dataset_name} locally at: {source_path}")
            # Clear target first if it is empty/exists
            if os.path.exists(target_path):
                if os.path.islink(target_path) or os.path.isfile(target_path):
                    os.unlink(target_path)
                else:
                    shutil.rmtree(target_path)
            
            try:
                os.symlink(source_path, target_path, target_is_directory=True)
                print(f"  Successfully symlinked {dataset_name} to {target_path}")
            except Exception as e:
                print(f"  Symlink failed ({e}). Copying files instead (this may take a minute)...")
                shutil.copytree(source_path, target_path, dirs_exist_ok=True)
                print(f"  Successfully copied {dataset_name} to {target_path}")
        else:
            print(f"Local {dataset_name} not found. Attempting to download from Kaggle using command-line: {kaggle_ref}")
            # Ensure kaggle package is available to run command line
            try:
                subprocess.run(f"kaggle datasets download -d {kaggle_ref} -p {target_path} --unzip", shell=True, check=True)
                print(f"  Successfully downloaded and extracted {dataset_name} to {target_path}")
            except Exception as e:
                print(f"  [ERROR] Failed to download {dataset_name} via Kaggle API: {e}")
                print("  Please ensure Kaggle API token (~/.kaggle/kaggle.json) is configured if you need to download.")

    # Process each dataset
    link_dataset(pv_source, plantvillage_target, "PlantVillage", "mohitsingh1804/plantvillage")
    link_dataset(pd_source, plantdoc_target, "PlantDoc", "nirmalsankalana/plantdoc-dataset")
    link_dataset(merged_source, merged_target, "Plant Disease Classification Merged", "alinedobrovsky/plant-disease-classification-merged")

    # 3. Create virtual environment
    venv_dir = os.path.join(project_dir, "venv")
    if not os.path.exists(venv_dir):
        print(f"Creating virtual environment in: {venv_dir}...")
        try:
            subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
            print("  Virtual environment created successfully.")
        except Exception as e:
            print(f"  [ERROR] Failed to create virtual environment: {e}")
            sys.exit(1)
    else:
        print("Virtual environment already exists.")

    # 4. Install dependencies in virtual environment
    pip_path = os.path.join(venv_dir, "bin", "pip")
    requirements_file = os.path.join(project_dir, "requirements.txt")
    print(f"Installing dependencies from {requirements_file}...")
    try:
        subprocess.run([pip_path, "install", "--upgrade", "pip"], check=True)
        subprocess.run([pip_path, "install", "-r", requirements_file], check=True)
        print("  All packages installed successfully.")
    except Exception as e:
        print(f"  [ERROR] Failed to install requirements: {e}")
        sys.exit(1)

    print("\n✅ Setup complete! Environment and datasets are fully prepared.")
    print(f"To activate the virtual environment, run:\n  source {venv_dir}/bin/activate")

if __name__ == "__main__":
    main()
