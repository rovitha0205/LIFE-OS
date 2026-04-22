from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__)


def simulate_scenario(text: str) -> dict:
    lowered = text.lower()
    if "study" in lowered:
        return {
            "type": "productivity",
            "title": "High Productivity Outcome",
            "detail": "Your scenario suggests a strong productivity increase with higher execution confidence.",
            "recommendation": "Keep study blocks in your prime focus window and protect them from interruptions.",
            "tone": "green",
        }

    if "rest" in lowered:
        return {
            "type": "recovery",
            "title": "Recovery Benefit Outcome",
            "detail": "Your scenario improves recovery quality and reduces cognitive fatigue risk.",
            "recommendation": "Anchor rest after high-load tasks to sustain long-term performance.",
            "tone": "blue",
        }

    return {
        "type": "balanced",
        "title": "Balanced Outcome",
        "detail": "Your scenario balances delivery and energy with stable but moderate impact.",
        "recommendation": "Add one explicit priority to increase clarity and expected gains.",
        "tone": "red",
    }


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/index.html")
def dashboard_page():
    return send_from_directory(".", "index.html")


@app.route("/insights.html")
def insights_page():
    return send_from_directory(".", "insights.html")


@app.route("/simulator.html")
def simulator_page():
    return send_from_directory(".", "simulator.html")


@app.route("/focus.html")
def focus_page():
    return send_from_directory(".", "focus.html")


@app.route("/style.css")
def style_file():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def script_file():
    return send_from_directory(".", "script.js")


@app.route("/simulate", methods=["POST"])
def simulate():
    payload = request.get_json(silent=True) or {}
    scenario = str(payload.get("scenario", "")).strip()
    if not scenario:
        return jsonify({"error": "Scenario is required"}), 400

    return jsonify(simulate_scenario(scenario))


if __name__ == "__main__":
    app.run(debug=True)
