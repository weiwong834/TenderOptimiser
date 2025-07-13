from flask import Flask, request, jsonify
from flask_cors import CORS  # only if your frontend is on another port
from main import TenderAnalyzer  # or wherever TenderAnalyzer is defined

app = Flask(__name__)
CORS(app)  # optional but likely necessary

analyzer = TenderAnalyzer()

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    title = data.get("title", "Untitled Tender")
    description = data.get("description", "")
    estimated_value = data.get("estimated_value", "1000000 SGD")

    result = analyzer.analyse_tender(title, description, estimated_value)

    return jsonify({
        "keywords": result.keywords,
        "similar_tenders": result.similar_tenders,
        "pricing_analysis": result.pricing_analysis,
        "bid_recommendation": result.bid_recommendation
    })

@app.route("/")
def index():
    return "Tender Optimizer API is running ✅"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
