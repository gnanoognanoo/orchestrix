import os
import google.generativeai as genai

api_key = "AIzaSyCkoB9OFPiRc910SSL0JcG4rFy7tUmrwZk"
genai.configure(api_key=api_key)

print("Listing models:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(m.name)
