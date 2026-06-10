from pydantic import BaseModel, Field
from typing import Literal, Dict, List

# --- PRECISION AGRICULTURE COMPONENTS ---

class SectorObservation(BaseModel):
    crop_type: str = Field(description="Type of crop in this sector (e.g., Wheat, Corn)")
    growth_stage: str = Field(description="Growth phase (Seedling, Vegetative, Flowering, Ripening, Harvested)")
    vitality: float = Field(..., description="Crop health (0.0-100.0). Drops if conditions are poor.")
    moisture: float = Field(..., description="Soil moisture level %")
    nitrogen: float = Field(..., description="Nitrogen ppm")
    phosphorus: float = Field(..., description="Phosphorus ppm")
    potassium: float = Field(..., description="Potassium ppm")
    pest_population: int = Field(..., description="Count of active pests in this sector")

# --- ENVIRONMENT STATE ---

class Observation(BaseModel):
    sectors: Dict[str, SectorObservation] = Field(..., description="Map of sector ID (e.g. 'North', 'South') to its localized state")
    weather_forecast: str = Field(..., description="Upcoming weather (sunny, rain, heatwave, storm, locust_swarm)")
    global_temperature: float = Field(..., description="Ambient temperature (C)")
    budget: float = Field(..., description="Available funds (USD)")
    inventory: Dict[str, float] = Field(..., description="Current stockpiles (water, pesticide, fertilizer)")
    step_count: int = Field(..., description="Current step in the episode")

# --- ACTION SPACE ---

class ActionCommand(BaseModel):
    target_sector: str = Field(..., description="ID of the sector to target (e.g. 'North', 'South', 'global')")
    cmd: Literal["irrigate", "spray_pesticide", "apply_fertilizer", "harvest", "wait"] = Field(..., description="Task to perform")
    amount: float = Field(0.0, description="Quantity of resource to use")

class Action(BaseModel):
    commands: List[ActionCommand] = Field(
        default_factory=list, 
        description="List of commands to execute simultaneously in this step. Max 3 commands per step."
    )

class Reward(BaseModel):
    reward: float = Field(..., ge=0.0, le=1.0, description="Reward normalized 0.0 to 1.0")
    done: bool = Field(..., description="Whether the episode has terminated")
    info: str = Field(..., description="Simulation feedback and logs")
