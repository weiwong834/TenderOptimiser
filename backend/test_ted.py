import requests
import logging

logger = logging.getLogger(__name__)


def unwrap(field):
    if isinstance(field, list):
        return ", ".join(str(x) for x in field)
    elif isinstance(field, dict):
        return field.get("eng") or next(iter(field.values()), "N/A")
    return field


def test_ted_with_full_fields():
    endpoint = "https://api.ted.europa.eu/v3/notices/search"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "TenderOptimizer/1.0"
    }

    payload = {
        "query":
        "description-glo ~ \"technical\" OR title-glo ~ \"technical\" OR award-criterion-name-lot ~ \"technical\"",
        "limit":
        30,
        "page":
        1,
        "onlyLatestVersions":
        False,
        "paginationMode":
        "PAGE_NUMBER",
        "scope":
        "ALL",
        "fields": [
            "TI", "CY", "DS", "winner-country", "winner-name",
            "winner-decision-date", "tender-value", "tender-value-highest",
            "tender-value-lowest", "estimated-value-lot",
            "estimated-value-cur-lot", "BT-711-LotResult", "BT-710-LotResult",
            "award-criterion-name-lot", "award-criterion-number-weight-lot",
            "tender-rank"
        ]
    }

    try:
        response = requests.post(endpoint,
                                 json=payload,
                                 headers=headers,
                                 timeout=20)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            notices = data.get("notices", [])
            print(f"\n✅ {len(notices)} notices found.")
            for i, n in enumerate(notices, 1):
                title = unwrap(n.get("TI", "No title"))
                description = unwrap(n.get("DS", "No description"))
                country = unwrap(n.get("CY", "Unknown"))

                tender_value = unwrap(n.get("tender-value", "N/A"))
                estimated_value = unwrap(n.get("estimated-value-lot", "N/A"))
                awarded_value = unwrap(n.get("BT-711-LotResult", "N/A"))
                currency = unwrap(n.get("BT-710-LotResult", "N/A"))

                winner_country = unwrap(n.get("winner-country", "Unknown"))
                winner_id = unwrap(n.get("winner-name", "N/A"))
                decision_date = unwrap(n.get("winner-decision-date", "N/A"))

                rank = unwrap(n.get("tender-rank", "N/A"))
                criteria_name = unwrap(n.get("award-criterion-name-lot",
                                             "N/A"))
                criteria_weight = unwrap(
                    n.get("award-criterion-number-weight-lot", "N/A"))

                print(f"\n--- Tender {i} ---")
                print(f"Title: {title}")
                print(f"Country: {country}")
                print(f"Description: {description}")
                print(f"Tender Value: {tender_value} {currency}")
                print(f"Estimated Value: {estimated_value} {currency}")
                print(f"Awarded Value: {awarded_value} {currency}")
                print(f"Winner Country: {winner_country}")
                print(f"Winner ID: {winner_id}")
                print(f"Winner Decision Date: {decision_date}")
                print(f"Rank: {rank}")
                print(f"Evaluation Criteria: {criteria_name}")
                print(f"Criteria Weights: {criteria_weight}")

        else:
            print("❌ Error:", response.text)
    except Exception as e:
        print("❌ Exception occurred:", e)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_ted_with_full_fields()
