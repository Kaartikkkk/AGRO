import os
import copy
from fastapi import FastAPI, HTTPException
from typing import Dict, Any, List

try:
    from .models import Observation, Action, Reward
    from .tasks import TASK_REGISTRY
except (ImportError, ValueError):
    from models import Observation, Action, Reward
    from tasks import TASK_REGISTRY

app = FastAPI(title="AgroSmart OpenEnv - Precision Agriculture Edition")

# State Storage
session_state = {
    "task_id": None,
    "state": None,
    "step_count": 0,
    "trajectory": [],
    "done": False
}

@app.get("/")
def home():
    return {"status": "online", "env": "AgroSmart-Env", "specification": "OpenEnv v1.0", "engine": "Spatial MDP"}

@app.post("/reset", response_model=Observation)
def reset(task_id: str = "irrigation_fix"):
    if task_id not in TASK_REGISTRY:
        raise HTTPException(status_code=400, detail=f"Task {task_id} not found in registry.")
    
    task = TASK_REGISTRY[task_id]
    initial_state = task.get_initial_state()
    
    session_state["task_id"] = task_id
    session_state["state"] = copy.deepcopy(initial_state)
    session_state["step_count"] = 0
    session_state["trajectory"] = []
    session_state["done"] = False
    
    # Generate observation from state
    obs_data = {k: v for k, v in session_state["state"].items() if k in Observation.model_fields}
    obs = Observation(**obs_data)
    
    # Store initial observation in trajectory
    session_state["trajectory"].append({"observation": obs.model_dump(), "action": None, "reward": 0.0})
    
    return obs

@app.post("/step")
def step(action: Action):
    if session_state["state"] is None:
        raise HTTPException(status_code=400, detail="Environment not reset. Call /reset first.")
    
    if session_state["done"]:
        raise HTTPException(status_code=400, detail="Episode finished. Call /reset to start over.")

    task = TASK_REGISTRY[session_state["task_id"]]
    
    # Increment step count
    session_state["step_count"] += 1
    session_state["state"]["step_count"] = session_state["step_count"]
    
    # Calculate impact and reward
    reward_val, is_done, feedback = task.calculate_reward(session_state["state"], action, session_state["step_count"])
    session_state["done"] = is_done
    
    # Generate next observation
    obs_data = {k: v for k, v in session_state["state"].items() if k in Observation.model_fields}
    next_obs = Observation(**obs_data)
    
    # Record in trajectory
    session_state["trajectory"].append({
        "observation": next_obs.model_dump(),
        "action": action.model_dump(),
        "reward": reward_val
    })
    
    return {
        "observation": next_obs.model_dump(),
        "reward": reward_val,
        "done": is_done,
        "info": feedback
    }

@app.get("/state")
def state():
    return session_state["state"]

@app.post("/grade")
def grade():
    if session_state["task_id"] is None:
        raise HTTPException(status_code=400, detail="No active task to grade.")
    
    task = TASK_REGISTRY[session_state["task_id"]]
    score = task.grade(session_state["trajectory"])
    
    return {"task_id": session_state["task_id"], "score": score}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
