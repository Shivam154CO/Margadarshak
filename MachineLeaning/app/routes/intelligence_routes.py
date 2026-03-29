"""
app/routes/intelligence_routes.py
Handles: /college_intelligence, /ping
"""
from flask import Blueprint, current_app, request, jsonify
from app.services.news_engine import NewsEngine

intelligence_bp = Blueprint("intelligence", __name__)


@intelligence_bp.route("/college_intelligence", methods=["POST", "OPTIONS"])
def get_college_intelligence():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data         = request.get_json()
        college_name = data.get("college_name", "General")
        exam_type    = data.get("exam_type", "DSE")

        result = NewsEngine.generate_intelligence(college_name, exam_type)
        return jsonify(result)

    except Exception as e:
        print(f"Error in college_intelligence: {e}")
        return jsonify({"error": str(e)}), 500


@intelligence_bp.route("/ping", methods=["GET"])
def ping():
    df = current_app.df
    return jsonify({
        "status":         "ok",
        "version":        "3.0 - Modular Blueprint Architecture",
        "total_records":  len(df),
        "unique_colleges": df['college_code'].nunique(),
        "features": [
            "Most Probable (±10 ranks, ±1.5%)",
            "Best Fit (85-115%)",
            "Good Fit (115-150%)",
            "Stretch (150-200%)",
            "STRICT category filtering",
            "Blueprint-based modular architecture"
        ]
    })
