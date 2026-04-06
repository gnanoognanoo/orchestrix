import os
import requests
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()

def synthesize_papers(papers: List[Dict[str, Any]]):
    """
    STRICT SYNTHESIS SERVICE FOR GROQ API.
    Refactored to identify 400 Bad Request errors and implement perfect payload sanitation.
    """
    
    # 1. & 7. Validate Input Papers & Minimum Content (50 chars)
    if not isinstance(papers, list):
        print("ERROR: papers is not an array")
        return "Invalid input format: Expected papers array"

    # Filter papers: each must have a valid string abstract of at least 10 chars
    valid_papers = [
        p for p in papers 
        if p.get('abstract') and isinstance(p.get('abstract'), str) and len(p.get('abstract').strip()) > 10
    ]

    # Enforcement: If valid abstracts < 2 → Error
    if len(valid_papers) < 2:
        print(f"ERROR: Only {len(valid_papers)} valid abstracts found.")
        return "Not enough valid abstracts for synthesis (min 2 required)"

    # 2. Safe Abstract Combination (12000 char threshold)
    combined_abstracts = ""
    for i, p in enumerate(valid_papers):
        title = p.get('title', 'Unknown Title').strip()
        abstract = p.get('abstract', '').strip()
        
        # Structure per requested format:
        combined_abstract_part = f"\nPaper {i+1}: {title}\n<abstract>\n{abstract}\n</abstract>\n"
        
        # Prevent token overflow
        if len(combined_abstracts) + len(combined_abstract_part) > 12000:
            print("WARNING: Prompt truncated at 12,000 characters to prevent overflow.")
            break
        combined_abstracts += combined_abstract_part

    # Prevent Empty Request (50 char minimum)
    if len(combined_abstracts.strip()) < 50:
        print("ERROR: Abstract content too small for synthesis")
        return "Abstract content too small for synthesis"

    # 3. Validate structuredPrompt
    title_text = "Generate a research synthesis across the selected papers."
    structured_prompt = f"{title_text}\n{combined_abstracts}"
    
    # Validation check: Ensure string, not null, not empty
    if not isinstance(structured_prompt, str) or not structured_prompt.strip():
        print("ERROR: Invalid synthesis prompt")
        return "Invalid synthesis prompt"

    # 4. Groq Payload - EXACT API SPECIFICATION
    # No additional fields. No nested objects inside content.
    body = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": "You are an expert academic research synthesis agent."
            },
            {
                "role": "user",
                "content": structured_prompt
            }
        ],
        "temperature": 0.4,
        "max_tokens": 1200
    }

    # 5. Debug Logging Before API Call
    print(f"DEBUG: Papers received: {len(papers)}")
    print(f"DEBUG: Valid abstracts filter count: {len(valid_papers)}")
    print(f"DEBUG: typeof structuredPrompt: {type(structured_prompt)}")
    print(f"DEBUG: structuredPrompt.length: {len(structured_prompt)}")
    print(f"DEBUG: Payload: {json.dumps(body, indent=2)}")

    api_key = os.getenv("GROQ_API_KEY")
    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    
    if not api_key:
        print("ERROR: GROQ_API_KEY is not defined")
        return "GROQ_API_KEY is not defined"
        
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(groq_url, headers=headers, json=body, timeout=120)
        
        # console.log("Groq Response Status:", response.status)
        print(f"DEBUG: Groq Response Status: {response.status_code}")
        
        # 6. Improved Error Handling (400 Bad Request)
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                synthesis_text = data['choices'][0]['message']['content']
                print("Synthesis Completed Successfully")
                return synthesis_text
            else:
                return "Invalid Groq response structure"
                
        elif response.status_code == 400:
            # Log full response body
            error_text = response.text
            print(f"ERROR: Groq 400 Error: {error_text}")
            return f"Groq Bad Request: {error_text}"
            
        else:
            print(f"ERROR: Groq API Error {response.status_code}: {response.text}")
            return f"Groq API Error: {response.status_code}"
            
    except Exception as e:
        print(f"CRITICAL BACKEND EXCEPTION: {str(e)}")
        return f"Synthesis service temporarily unavailable: {str(e)}"
