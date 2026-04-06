import os
from google import genai

api_key = "AIzaSyCkoB9OFPiRc910SSL0JcG4rFy7tUmrwZk"
client = genai.Client(api_key=api_key)

print("Testing google-genai generation...")
response = client.models.generate_content(
    model='gemini-2.0-flash',
    contents='Say something very short.',
)
print(response.text)
