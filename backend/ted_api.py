import requests
import os
from dotenv import load_dotenv

load_dotenv()

TED_API_KEY = os.getenv("TED_API_KEY")  # Optional, not required yet

headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "User-Agent": "TenderOptimizer/1.0"
}

def get_similar_tenders(sector_keywords="software", limit=5):
    payload = {
        "query": f"description-glo ~ \"{sector_keywords}\"",
        "limit": limit,
        "page": 1,
        "onlyLatestVersions": True,
        "paginationMode": "PAGE_NUMBER",
        "fields": [
            "TI", "CY", "estimated-value-lot", "tender-value",
            "winner-country", "winner-name", "BT-711-LotResult",
            "award-criterion-name-lot"
        ]
    }
    try:
        response = requests.post("https://api.ted.europa.eu/v3/notices/search", json=payload, headers=headers, timeout=20)
        if response.status_code == 200:
            return response.json().get("notices", [])
        else:
            print("TED API error:", response.text)
            return []
    except Exception as e:
        print("Exception calling TED API:", e)
        return []
