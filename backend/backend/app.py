from flask import Flask, jsonify
from flask_cors import CORS

from scamshield.routes import scamshield_bp


app = Flask(__name__)

# ---------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------

app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": "*"
        }
    },
)


# ---------------------------------------------------------
# WELTHRA ROOT
# ---------------------------------------------------------

@app.get("/")
def home():
    return jsonify(
        {
            "application": "WELTHRA",
            "status": "online",
        }
    )


# ---------------------------------------------------------
# SCAMSHIELD MODULE
# ---------------------------------------------------------

app.register_blueprint(
    scamshield_bp
)


# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )