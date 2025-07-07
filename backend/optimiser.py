from ted_api import get_similar_tenders
from gemini_helper import suggest_optimal_bid

# Simulate input tender
new_tender = {
    "title": "Software Licensing for Public Sector",
    "estimated": "1200000 EUR"
}

past = get_similar_tenders("software", limit=5)
suggestion = suggest_optimal_bid(new_tender, past)

print("\n✅ Gemini's Suggested Bid:")
print(suggestion)

