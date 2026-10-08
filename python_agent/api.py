import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from .agent import GeminiAssetAgent
from .config import config
from .tools import AGENT_TOOLS

app = Flask(__name__)
CORS(app)

# Global persistent agent instance (can also create per-session if needed)
agent_instance = GeminiAssetAgent()

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "online",
        "service": "AssetMS Python Gemini 2.5 Flash Agent",
        "model": config.GEMINI_MODEL,
        "has_api_key": bool(config.GEMINI_API_KEY and config.GEMINI_API_KEY != "your_ai_api_key_here")
    })

@app.route('/api/tools', methods=['GET'])
def list_tools():
    tools_info = []
    for t in AGENT_TOOLS:
        doc = t.__doc__.strip() if t.__doc__ else ""
        first_line = doc.splitlines()[0] if doc else ""
        tools_info.append({
            "name": t.__name__,
            "description": first_line
        })
    return jsonify({"tools": tools_info, "count": len(tools_info)})

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json() or {}
    prompt = data.get("prompt", "").strip()
    api_key_override = data.get("apiKey", "").strip()

    if not prompt:
        return jsonify({"error": "Prompt is required."}), 400

    current_agent = agent_instance
    if api_key_override:
        current_agent = GeminiAssetAgent(api_key=api_key_override)

    result = current_agent.chat(prompt)
    return jsonify(result)

@app.route('/api/reset', methods=['POST'])
def reset():
    agent_instance.reset_chat()
    return jsonify({"success": True, "message": "Chat conversation reset."})

def start_server(port: int = None):
    p = port or config.PORT
    print(f"\n🚀 Starting Gemini 2.5 Flash Agent Server on http://localhost:{p}")
    print(f"📡 Endpoints:")
    print(f"   • POST http://localhost:{p}/api/chat")
    print(f"   • GET  http://localhost:{p}/api/health")
    print(f"   • GET  http://localhost:{p}/api/tools")
    print(f"   • POST http://localhost:{p}/api/reset\n")
    app.run(host='0.0.0.0', port=p, debug=False)

if __name__ == "__main__":
    start_server()
