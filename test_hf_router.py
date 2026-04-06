import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("HF_API_KEY")
url = "https://router.huggingface.co/hf-inference/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "google/flan-t5-xxl",
    "messages": [
        {"role": "user", "content": "Summarize the key contributions of quantum computing in 2024."}
    ],
    "max_tokens": 500
}

print(f"Testing HF Router (v1/chat) with model: google/flan-t5-xxl...")
try:
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
