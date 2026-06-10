from typing import Dict, Any, Tuple

try:
    from .models import Observation, Action
except (ImportError, ValueError):
    from models import Observation, Action

# --- SIMULATION ENGINE ---
def process_engine(state: Dict[str, Any], action: Action, costs: Dict[str, float]) -> Tuple[Dict[str, Any], str]:
    """Core physics and simulation engine for the spatial map."""
    info_logs = []
    total_cost = 0.0
    
    # 1. Process Multi-Action Commands
    for cmd in action.commands:
        sector_id = cmd.target_sector
        if cmd.cmd == "wait":
            continue
            
        if sector_id not in state["sectors"] and sector_id != "global":
            info_logs.append(f"Err: Unknown sector '{sector_id}'")
            continue
            
        targets = [sector_id] if sector_id != "global" else list(state["sectors"].keys())
        
        for t_id in targets:
            sector = state["sectors"][t_id]
            if cmd.cmd == "irrigate":
                if state["inventory"]["water"] >= cmd.amount:
                    sector["moisture"] += cmd.amount * 0.5
                    state["inventory"]["water"] -= cmd.amount
                    cost = cmd.amount * costs.get("water", 0.5)
                    total_cost += cost
                    info_logs.append(f"Irrigated {t_id}")
                else:
                    info_logs.append(f"Err: Low water for {t_id}")
            
            elif cmd.cmd == "spray_pesticide":
                if state["inventory"]["pesticide"] >= cmd.amount:
                    sector["pest_population"] = max(0, sector["pest_population"] - int(cmd.amount * 5))
                    state["inventory"]["pesticide"] -= cmd.amount
                    cost = cmd.amount * costs.get("pesticide", 5.0)
                    total_cost += cost
                    info_logs.append(f"Sprayed {t_id}")
                else:
                    info_logs.append(f"Err: Low pesticide for {t_id}")
                    
            elif cmd.cmd == "apply_fertilizer":
                 if state["inventory"]["fertilizer"] >= cmd.amount:
                    sector["nitrogen"] += cmd.amount * 2.0
                    state["inventory"]["fertilizer"] -= cmd.amount
                    cost = cmd.amount * costs.get("fertilizer", 4.0)
                    total_cost += cost
                    info_logs.append(f"Fertilized {t_id}")

    state["budget"] -= total_cost
    
    # 2. Physics & Dynamics
    weather = state["weather_forecast"]
    total_pests = 0
    
    for s_id, sector in state["sectors"].items():
        # Weather impacts
        if weather == "heatwave":
            sector["moisture"] -= 25.0
            sector["vitality"] -= 2.0
        elif weather == "rain":
            sector["moisture"] += 30.0
        elif weather == "locust_swarm":
            sector["pest_population"] += 80
        else: # sunny
            sector["moisture"] -= 8.0
            
        # Biological Dynamics
        if sector["pest_population"] > 10:
            sector["pest_population"] += int(sector["pest_population"] * 0.3) # Exponential growth
            sector["vitality"] -= (sector["pest_population"] / 20.0) # Drain health
            
        if sector["moisture"] < 20.0 or sector["moisture"] > 90.0:
            sector["vitality"] -= 5.0 # Extremes damage crop
            
        # Bounds constraints
        sector["moisture"] = max(0.0, min(100.0, sector["moisture"]))
        sector["vitality"] = max(0.0, min(100.0, sector["vitality"]))
        total_pests += sector["pest_population"]
        
    # Spatial Contagion (Pests spread across the grid)
    if "North" in state["sectors"] and "South" in state["sectors"]:
        if state["sectors"]["North"]["pest_population"] > 50:
            state["sectors"]["South"]["pest_population"] += 15
            info_logs.append("🔥 Pests spreading North -> South")
            
    if not info_logs:
        info_logs.append("No actions taken.")
        
    return state, " | ".join(info_logs)

class AgroTask:
    def __init__(self, task_id: str, max_steps: int):
        self.task_id = task_id
        self.max_steps = max_steps

    def get_initial_state(self) -> Dict[str, Any]:
         raise NotImplementedError

    def calculate_reward(self, state: Dict[str, Any], action: Action, step: int) -> Tuple[float, bool, str]:
         raise NotImplementedError

    def grade(self, trajectory: list) -> float:
         raise NotImplementedError

# --- TASK 1: Precision Drought Management ---
class DroughtTask(AgroTask):
    def __init__(self):
        super().__init__("irrigation_fix", 3)

    def get_initial_state(self) -> Dict[str, Any]:
        return {
            "sectors": {
                "North": {"crop_type": "Wheat", "growth_stage": "Seedling", "vitality": 80.0, "moisture": 10.0, "nitrogen": 50.0, "phosphorus": 40.0, "potassium": 30.0, "pest_population": 0},
                "South": {"crop_type": "Wheat", "growth_stage": "Seedling", "vitality": 80.0, "moisture": 85.0, "nitrogen": 50.0, "phosphorus": 40.0, "potassium": 30.0, "pest_population": 0}
            },
            "weather_forecast": "heatwave",
            "global_temperature": 38.5,
            "budget": 200.0,
            "inventory": {"water": 50.0, "pesticide": 0.0, "fertilizer": 0.0},
            "step_count": 0
        }

    def calculate_reward(self, state: Dict[str, Any], action: Action, step: int) -> Tuple[float, bool, str]:
        state, info = process_engine(state, action, {"water": 1.0})
        
        n_moisture = state["sectors"]["North"]["moisture"]
        s_moisture = state["sectors"]["South"]["moisture"]
        
        # Agent must water North, but NOT South (which is already wet). 
        # Heatwave will dry both.
        success = n_moisture >= 30.0 and s_moisture <= 90.0
        done = step >= self.max_steps or success
        
        # Reward is normalized health of North sector plus survival of South
        reward = (state["sectors"]["North"]["vitality"] / 100.0) * 0.5 
        if success: reward = 1.0
        elif done: reward = 0.0
        
        return reward, done, info

    def grade(self, trajectory: list) -> float:
        final_state = trajectory[-1]["observation"]["sectors"]
        if final_state["North"]["moisture"] >= 30.0 and final_state["South"]["vitality"] > 50.0:
            return 1.0
        return 0.0

# --- TASK 2: Contagion Containment ---
class ContagionTask(AgroTask):
    def __init__(self):
        super().__init__("pest_control", 4)

    def get_initial_state(self) -> Dict[str, Any]:
        return {
            "sectors": {
                "North": {"crop_type": "Corn", "growth_stage": "Vegetative", "vitality": 50.0, "moisture": 60.0, "nitrogen": 40.0, "phosphorus": 40.0, "potassium": 40.0, "pest_population": 120},
                "South": {"crop_type": "Corn", "growth_stage": "Vegetative", "vitality": 100.0, "moisture": 60.0, "nitrogen": 40.0, "phosphorus": 40.0, "potassium": 40.0, "pest_population": 0}
            },
            "weather_forecast": "sunny",
            "global_temperature": 25.0,
            "budget": 300.0,
            "inventory": {"water": 100.0, "pesticide": 40.0, "fertilizer": 0.0},
            "step_count": 0
        }

    def calculate_reward(self, state: Dict[str, Any], action: Action, step: int) -> Tuple[float, bool, str]:
        state, info = process_engine(state, action, {"pesticide": 5.0})
        
        total_pests = sum(s["pest_population"] for s in state["sectors"].values())
        done = step >= self.max_steps or total_pests == 0
        
        # We want to save South from getting infected, and clean North
        s_vitality = state["sectors"]["South"]["vitality"]
        reward = s_vitality / 100.0 if total_pests < 10 else 0.0
        if total_pests == 0: reward = 1.0
            
        return reward, done, f"Total Pests: {total_pests} | {info}"

    def grade(self, trajectory: list) -> float:
        final_state = trajectory[-1]["observation"]["sectors"]
        total_pests = sum(s["pest_population"] for s in final_state.values())
        return 1.0 if total_pests <= 5 else max(0.0, 1.0 - (total_pests / 100.0))

# --- TASK 3: Spatial Yield Maximization ---
class YieldMaxTask(AgroTask):
    def __init__(self):
        super().__init__("yield_maximization", 8)

    def get_initial_state(self) -> Dict[str, Any]:
        return {
            "sectors": {
                "North": {"crop_type": "Rice", "growth_stage": "Flowering", "vitality": 100.0, "moisture": 50.0, "nitrogen": 30.0, "phosphorus": 30.0, "potassium": 30.0, "pest_population": 0},
                "South": {"crop_type": "Wheat", "growth_stage": "Ripening", "vitality": 100.0, "moisture": 40.0, "nitrogen": 30.0, "phosphorus": 30.0, "potassium": 30.0, "pest_population": 0}
            },
            "weather_forecast": "locust_swarm",
            "global_temperature": 28.0,
            "budget": 1000.0,
            "inventory": {"water": 500.0, "pesticide": 100.0, "fertilizer": 100.0},
            "step_count": 0
        }

    def calculate_reward(self, state: Dict[str, Any], action: Action, step: int) -> Tuple[float, bool, str]:
        if step == 3: state["weather_forecast"] = "heatwave"
        if step == 6: state["weather_forecast"] = "rain"
        
        state, info = process_engine(state, action, {"water": 0.5, "pesticide": 2.0, "fertilizer": 4.0})
        
        avg_vitality = sum(s["vitality"] for s in state["sectors"].values()) / 2.0
        done = step >= self.max_steps or avg_vitality <= 0
        
        if done:
            reward = avg_vitality / 100.0
            return reward, True, f"Season ended. Avg Vitality: {avg_vitality:.1f}%"
            
        return avg_vitality / 1000.0, False, info

    def grade(self, trajectory: list) -> float:
        final_state = trajectory[-1]["observation"]["sectors"]
        avg_health = sum(s["vitality"] for s in final_state.values()) / 2.0
        return max(0.0, min(1.0, avg_health / 100.0))

TASK_REGISTRY = {
    "irrigation_fix": DroughtTask(),
    "pest_control": ContagionTask(),
    "yield_maximization": YieldMaxTask()
}
