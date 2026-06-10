import os
import yaml
import sys
from pydantic import ValidationError

try:
    from .models import Observation, Action, SectorObservation
    from .tasks import TASK_REGISTRY
except (ImportError, ValueError):
    from models import Observation, Action, SectorObservation
    from tasks import TASK_REGISTRY

def validate():
    print("📋 Starting AgroSmart-Env Precision Validator...")
    
    # 1. Check openenv.yaml
    if not os.path.exists("openenv.yaml"):
        print("❌ Error: openenv.yaml not found.")
        return False
    
    with open("openenv.yaml", "r") as f:
        config = yaml.safe_load(f)
    
    print(f"✅ openenv.yaml found. Environment Name: {config.get('name')}")
    
    # 2. Validate Models
    try:
        sample_sector = SectorObservation(
            crop_type="Wheat", growth_stage="Seedling", vitality=100.0,
            moisture=40.0, nitrogen=50.0, phosphorus=50.0, potassium=50.0, pest_population=0
        )
        sample_obs = Observation(
            sectors={"North": sample_sector},
            weather_forecast="sunny", global_temperature=22.0,
            budget=500.0, inventory={"water": 100.0, "pesticide": 10.0, "fertilizer": 10.0},
            step_count=0
        )
        print("✅ Observation complex models (Spatial Grid) validated.")
    except ValidationError as e:
        print(f"❌ Error: Observation model validation failed: {e}")
        return False

    # 3. Validate Tasks
    if not TASK_REGISTRY:
        print("❌ Error: TASK_REGISTRY is empty.")
        return False
    
    required_tasks = ["irrigation_fix", "pest_control", "yield_maximization"]
    for tid in required_tasks:
        if tid not in TASK_REGISTRY:
            print(f"❌ Error: Required task '{tid}' missing from registry.")
            return False
            
    print(f"✅ All {len(TASK_REGISTRY)} tasks found in registry.")
    
    # 4. Check Dockerfile
    if os.path.exists("Dockerfile"):
        print("✅ Dockerfile found.")
    else:
        print("⚠️ Warning: Dockerfile not found in environment directory.")
        
    print("\n🎉 Validation Passed! Precision Agriculture Engine is structurally perfect for submission.")
    return True

if __name__ == "__main__":
    if not validate():
        sys.exit(1)
