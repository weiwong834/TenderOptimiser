import requests

def fetch_gebiz_tenders(limit=100, offset=0):
    dataset_id = "d_acde1106003906a75c3fa052592f2fcb"
    url = "https://data.gov.sg/api/action/datastore_search"
    params = {
        "resource_id": dataset_id,
        "limit": limit,
        "offset": offset
    }

    response = requests.get(url, params=params)
    data = response.json()

    if response.status_code == 200 and "result" in data:
        return data["result"]["records"]
    else:
        print("❌ Failed to fetch data:", data)
        return []

def search_gebiz_by_keywords(keywords, batch_size=500, max_records=5000):
    dataset_id = "d_acde1106003906a75c3fa052592f2fcb"
    url = "https://data.gov.sg/api/action/datastore_search"

    matched = []
    offset = 0

    while offset < max_records:
        params = {
            "resource_id": dataset_id,
            "limit": batch_size,
            "offset": offset
        }

        response = requests.get(url, params=params)
        data = response.json()

        if response.status_code != 200 or "result" not in data:
            print(f"❌ Failed at offset {offset}: {data}")
            break

        tenders = data["result"]["records"]
        if not tenders:
            break  # No more records

        for tender in tenders:
            description = tender.get("Tender Description", "").lower()
            if any(keyword.lower() in description for keyword in keywords):
                matched.append(tender)

        offset += batch_size

    return matched


def print_tender_info(tenders):
    for tender in tenders:
        print("\n--- Tender ---")
        print(f"Tender No: {tender.get('Tender No')}")
        print(f"Description: {tender.get('Tender Description')}")
        print(f"Agency: {tender.get('Agency')}")
        print(f"Awarded To: {tender.get('Supplier Name')}")
        print(f"Amount: S${tender.get('Awarded Amt')}")
        print(f"Award Date: {tender.get('Award Date')}")
        print(f"Status: {tender.get('Tender Detail Status')}")

if __name__ == "__main__":
    keywords = ["construction", "software"]  # You can change these
    print(f"🔍 Searching GeBIZ for tenders matching keywords: {keywords}")
    results = search_gebiz_by_keywords(keywords, batch_size=500, max_records=3000)

    print(f"\n✅ Found {len(results)} matching tenders.")
    print_tender_info(results[:5])  # Show first 5 results
