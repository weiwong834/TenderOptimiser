import google.generativeai as genai


def suggest_optimal_bid(new_tender, past_tenders):
    prompt = "You are a bidding advisor. Based on these past tenders:\n"
    for t in past_tenders:
        prompt += f"- {t['TI']['eng']}, Estimated: {t.get('estimated-value-lot')}, Awarded: {t.get('BT-711-LotResult')}\n"

    prompt += f"\nNew Tender:\n- {new_tender['title']}, Estimated: {new_tender['estimated']}\n"
    prompt += "What is a good bid price? Justify based on past examples."

    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    return model.generate_content(prompt).text
