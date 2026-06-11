import json
import os

def main():
    class_names_path = '/Users/kartik/Documents/Projects/AGRO/ai/data/class_names.json'
    old_treatment_path = '/Users/kartik/Documents/Projects/AGRO/ai/data/treatment_db.json'
    
    display_names_out_path = '/Users/kartik/Documents/Projects/AGRO/ai/data/class_display_names.json'
    new_treatment_out_path = '/Users/kartik/Documents/Projects/AGRO/ai/data/treatment_db.json'
    
    with open(class_names_path, 'r') as f:
        class_names = json.load(f)
        
    try:
        with open(old_treatment_path, 'r') as f:
            old_treatments = json.load(f)
    except Exception:
        old_treatments = {}
        
    display_names = {}
    treatment_db = {}
    
    # Crop emojis mapping
    crop_emojis = {
        "Apple": "🍎",
        "Blueberry": "🫐",
        "Cherry": "🍒",
        "Corn": "🌽",
        "Grape": "🍇",
        "Orange": "🍊",
        "Peach": "🍑",
        "Pepper": "🫑",
        "Potato": "🥔",
        "Raspberry": "🍓",
        "Soybean": "🫛",
        "Squash": "🥒",
        "Strawberry": "🍓",
        "Tomato": "🍅"
    }
    
    # Detailed structured information based on class type
    for c in class_names:
        parts = c.split("___")
        crop_raw = parts[0]
        disease_raw = parts[1]
        
        # Clean crop name
        crop = crop_raw.replace("_", " ").replace("(including sour)", "").strip()
        
        # Clean disease name
        disease = disease_raw.replace("_", " ").strip()
        if "healthy" in disease.lower():
            disease = "Healthy"
            is_healthy = True
        else:
            is_healthy = False
            
        emoji = crop_emojis.get(crop.split(" ")[0], "🌿")
        if is_healthy:
            emoji = "✅"
            
        display_names[c] = {
            "disease": disease,
            "crop": crop,
            "emoji": emoji,
            "is_healthy": is_healthy
        }
        
        # Determine severity
        if is_healthy:
            severity = "Low"
        elif any(x in disease.lower() for x in ["scab", "rust", "rot", "blight", "greening", "esca", "virus", "mosaic", "spider"]):
            severity = "High"
        else:
            severity = "Medium"
            
        # Get base recommendation from old treatment db if available, otherwise generate
        old_rec = old_treatments.get(c, "")
        if isinstance(old_rec, dict):
            old_rec = old_rec.get("remedy", "")
            
        # Standardize default immediate action
        if is_healthy:
            immediate_action = "Maintain regular crop inspections, watering schedules, and soil nutrient levels."
            fungicide = "None required"
            dosage = "N/A"
            frequency = "N/A"
            prevention = [
                "Ensure clean tool sanitization",
                "Maintain optimal crop spacing for airflow",
                "Perform regular crop monitoring"
            ]
            fertilizer_advice = "Follow default N-P-K recommendation based on crop growth stage."
            best_season_to_watch = "All seasons"
        else:
            immediate_action = f"Isolate infected plants. Prune and safely dispose of affected leaves. Do not compost."
            if "blight" in disease.lower():
                fungicide = "Copper-based fungicide (e.g., Blitox or Bordeaux mixture)"
                dosage = "2g per litre of water"
                frequency = "Spray every 7-10 days"
                prevention = [
                    "Avoid overhead irrigation to keep foliage dry",
                    "Ensure maximum air circulation",
                    "Rotate crops annually"
                ]
                fertilizer_advice = "Reduce high-nitrogen fertilizer. Increase potassium to strengthen cell walls."
                best_season_to_watch = "Monsoon & high humidity seasons"
            elif "rust" in disease.lower():
                fungicide = "Propiconazole or Hexaconazole"
                dosage = "1 ml per litre of water"
                frequency = "Spray at 10-14 day intervals"
                prevention = [
                    "Remove alternative hosts in surrounding area",
                    "Sow rust-resistant crop varieties",
                    "Ensure adequate field drainage"
                ]
                fertilizer_advice = "Apply balanced N-P-K. Add micronutrient spray if plant shows weakness."
                best_season_to_watch = "Cool, wet mornings"
            elif "rot" in disease.lower() or "scab" in disease.lower():
                fungicide = "Captan or Carbendazim"
                dosage = "2g per litre of water"
                frequency = "Spray twice at 15-day intervals"
                prevention = [
                    "Clear fallen leaves and mummified fruits in winter",
                    "Prune dead twigs during dormancy",
                    "Apply protective sprays before bloom"
                ]
                fertilizer_advice = "Apply calcium-rich amendments to soil. Boost organic compost."
                best_season_to_watch = "Early spring & fruit set"
            elif "powdery" in disease.lower() or "mold" in disease.lower():
                fungicide = "Wettable Sulfur or Neem Oil formulation"
                dosage = "3g per litre of water"
                frequency = "Spray every 7 days"
                prevention = [
                    "Plant in sunny areas with good air circulation",
                    "Prune lower leaves to reduce soil-splash transmission",
                    "Avoid overhead watering late in the day"
                ]
                fertilizer_advice = "Ensure balanced phosphate fertilization to support robust root systems."
                best_season_to_watch = "Dry, warm days with humid nights"
            elif "virus" in disease.lower() or "mosaic" in disease.lower() or "greening" in disease.lower():
                fungicide = "No direct cure. Insecticide for vectors (e.g., Imidacloprid)"
                dosage = "0.5 ml per litre of water"
                frequency = "Spray every 14 days to control vector insects (whiteflies/aphids/psyllids)"
                prevention = [
                    "Use certified virus-free seeds/grafts",
                    "Remove and destroy infected plants immediately",
                    "Install sticky yellow traps to monitor vectors"
                ]
                fertilizer_advice = "Apply seaweed extract or foliar potash to boost overall plant vigor."
                best_season_to_watch = "Peak vector seasons (warm dry months)"
            else:
                fungicide = "Broad-spectrum copper fungicide or Mancozeb"
                dosage = "2.5g per litre of water"
                frequency = "Spray every 10 days"
                prevention = [
                    "Sanitize pruning shears between plants",
                    "Ensure optimal plant spacing",
                    "Clear crop residues post-harvest"
                ]
                fertilizer_advice = "Apply well-decomposed manure and potash fertilizer."
                best_season_to_watch = "Warm, rainy intervals"
                
            # If we had a specific old recommendation, blend it in
            if old_rec:
                immediate_action = f"{old_rec} | {immediate_action}"

        treatment_db[c] = {
            "display_name": f"{crop} {disease}",
            "crop": crop,
            "severity_default": severity,
            "immediate_action": immediate_action,
            "fungicide": fungicide,
            "dosage": dosage,
            "frequency": frequency,
            "prevention": prevention,
            "fertilizer_advice": fertilizer_advice,
            "best_season_to_watch": best_season_to_watch
        }
        
    with open(display_names_out_path, 'w') as f:
        json.dump(display_names, f, indent=2)
        print(f"Saved display names to {display_names_out_path}")
        
    with open(new_treatment_out_path, 'w') as f:
        json.dump(treatment_db, f, indent=2)
        print(f"Saved structured treatments to {new_treatment_out_path}")

if __name__ == '__main__':
    main()
