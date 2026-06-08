import os
import json
import time
import requests
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Mandatory Environment Variables (from requirements)
API_BASE_URL = os.getenv("API_BASE_URL", "https://api.openai.com/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "gpt-4-turbo-preview")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HF_TOKEN = os.getenv("HF_TOKEN")
ENV_URL = os.getenv("ENV_URL", "http://localhost:8000")

if not OPENAI_API_KEY:
    print("❌ Error: OPENAI_API_KEY not found in environment variables.")
    exit(1)

client = OpenAI(api_key=OPENAI_API_KEY, base_url=API_BASE_URL)

def run_task(task_id: str):
    # Mandatory Logging Format: [START]
    print(f"\n[START] Task: {task_id}")
    
    try:
        response = requests.post(f"{ENV_URL}/reset?task_id={task_id}")
        response.raise_for_status()
        observation = response.json()
    except Exception as e:
        print(f"❌ Error resetting environment: {e}")
        return 0.0
    
    done = False
    step = 0
    total_reward = 0.0
    
    while not done and step < 15:
        step += 1
        
        system_prompt = (
            "You are an elite Precision Agriculture AI Manager. Analyze the spatial sector grid data carefully. "
            "Take into account impending weather (heatwaves dry soil quickly, rain adds water), pest contagion spreading between adjacent sectors, and nutrient depletion. "
            "Budget is strictly limited. "
            "Output MUST be a valid JSON object with the exact key 'action'. The 'action' key must contain your payload matching this schema:\n"
            "{\"commands\": [{\"cmd\": \"irrigate|spray_pesticide|apply_fertilizer|wait\", \"target_sector\": \"North|South\", \"amount\": float}]} \n"
            "Example:\n"
            "{\"action\": {\"commands\": [{\"cmd\": \"irrigate\", \"target_sector\": \"North\", \"amount\": 25.0}]}}"
        )
        
        user_prompt = f"Step {step} | Spatial Engine State: {json.dumps(observation, indent=2)}. What is your optimal precision strategy?"
        
        try:
            completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"}
            )
            
            response_json = json.loads(completion.choices[0].message.content)
            action_data = response_json.get("action", response_json) # Fallback if agent forgets 'action' wrapping
            
            if "commands" not in action_data:
                action_data = {"commands": [{"cmd": "wait", "target_sector": "global", "amount": 0}]}
            
            # Execute step
            response = requests.post(f"{ENV_URL}/step", json=action_data)
            response.raise_for_status()
            step_result = response.json()
            
            # FastApi unwraps it if we requested full object but let's just parse
            observation = step_result["observation"]
            reward = step_result["reward"]
            done = step_result["done"]
            info = step_result["info"]
            
            total_reward += reward
            
            cmd_summary = ", ".join([f"{c['cmd']}->{c['target_sector']}" for c in action_data["commands"]])
            # Mandatory Logging Format: [STEP]
            print(f"[STEP] {step} | Actions: [{cmd_summary}] | Reward: {reward:.2f} | Physics Engine Info: {info}")
            
        except Exception as e:
            print(f"❌ Error during step execution: {e}")
            break
            
    try:
        grade_response = requests.post(f"{ENV_URL}/grade")
        grade_response.raise_for_status()
        final_score = grade_response.json()["score"]
    except Exception as e:
        print(f"❌ Error getting final grade: {e}")
        final_score = 0.0
    
    # Mandatory Logging Format: [END]
    print(f"[END] Task {task_id} Completed. Final Score: {final_score}")
    return final_score

if __name__ == "__main__":
    print("🌾 AgroSmart Precision Agriculture Engine - Baseline 🌾")
    print(f"📍 Model: {MODEL_NAME}")
    
    tasks = ["irrigation_fix", "pest_control", "yield_maximization"]
    scores = {}
    
    for tid in tasks:
        scores[tid] = run_task(tid)
        time.sleep(1)
            
    print("\n" + "="*35)
    print("📊 AGROSMART PRO SUMMARY REPORT 📊")
    print("="*35)
    for tid, score in scores.items():
        print(f"{tid:20} | Score: {score:.2f}")
    print("="*35)
