import os
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("HF_API_KEY")
client = InferenceClient(api_key=api_key)

model = "google/flan-t5-xxl"
prompt = "Summarize the key contributions of quantum computing in 2024."

print(f"Testing HF InferenceClient with model: {model}...")
try:
    response = client.text_generation(
        prompt,
        model=model,
        max_new_tokens=100
    )
    print(f"Status: SUCCESS")
    print(f"Response: {response}")
except Exception as e:
    import traceback
    print(f"Error: {e}")
    traceback.print_exc()
