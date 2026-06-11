import requests
import json

def main():
    url = "http://localhost:5001/predict"
    image_path = "/Users/kartik/Documents/Projects/AGRO/sample_tomato.jpg"
    
    print(f"Sending request to Flask AI Server: {url}")
    print(f"Uploading image: {image_path}")
    
    files = {
        "image": open(image_path, "rb")
    }
    data = {
        "symptoms": "yellow spots and wilting on lower leaves",
        "crop_type": "Tomato"
    }
    
    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✓ RESPONSE SUCCESS:")
            print("Prediction details:")
            print(json.dumps(result["prediction"], indent=2))
            print("\nTop 3 predictions:")
            print(json.dumps(result["top_3"], indent=2))
            print("\nTreatment recommendations:")
            print(json.dumps(result["treatment"], indent=2))
            
            grad_cam_len = len(result.get("grad_cam_image", ""))
            print(f"\nGrad-CAM Base64 length: {grad_cam_len} characters")
            print(f"Processing time: {result.get('processing_time_ms')} ms")
            print(f"Model version: {result.get('model_version')}")
        else:
            print("✓ RESPONSE ERROR:")
            print(response.text)
            
    except Exception as e:
        print(f"Failed to connect to Flask AI server: {e}")

if __name__ == "__main__":
    main()
