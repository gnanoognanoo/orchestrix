import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("HF_API_KEY")
url = "https://api-inference.huggingface.co/models/google/flan-t5-large"
headers = {"Authorization": f"Bearer {api_key}"}

prompt = "Summarize: The study of quantum mechanics explores the behavior of matter and energy at atomic scales."

print(f"Testing HF API (Legacy) with model: google/flan-t5-large...")
try:
    response = requests.post(url, headers=headers, json={"inputs": prompt, "parameters": {"wait_for_model": True}}, timeout=30)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
