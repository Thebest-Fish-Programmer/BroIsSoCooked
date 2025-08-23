from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder="Assets", template_folder=".")

@app.route("/")
def index():
    return send_from_directory(".", "LaunchWeb.html")

@app.route("/Assets/<path:filename>")
def assets(filename):
    return send_from_directory("Assets", filename)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
