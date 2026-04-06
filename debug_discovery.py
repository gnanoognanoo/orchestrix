import requests
from pprint import pprint

base_url = "https://api.semanticscholar.org/graph/v1"
endpoint = f"{base_url}/paper/search"
params = {
    "query": "Artificial Intelligence",
    "offset": 0,
    "limit": 5,
    "fields": "paperId,title,authors,year,abstract,url,citationCount"
}

try:
    response = requests.get(endpoint, params=params, timeout=15)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        pprint(data)
    else:
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
