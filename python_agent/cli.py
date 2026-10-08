import sys
import os

# Ensure UTF-8 output encoding on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

from .agent import GeminiAssetAgent
from .config import config
from .tools import AGENT_TOOLS, get_asset_statistics

BANNER = r"""
========================================================================
   🤖  AssetMS AI Chatbot - Autonomous Gemini 2.5 Flash Agent
========================================================================
 Model: %s
 Database: %s @ %s
------------------------------------------------------------------------
 Special Commands:
   /tools   - List all callable agent tools
   /stats   - Instant macro inventory metrics
   /reset   - Reset conversation memory
   /help    - Show commands list
   exit     - Quit chat
========================================================================
"""

def start_cli():
    print(BANNER % (config.GEMINI_MODEL, config.DB_NAME, config.DB_HOST))

    agent = GeminiAssetAgent()

    if not agent.client:
        print("\n[!] NOTICE: GEMINI_API_KEY / AI_API_KEY is not set or invalid in .env.")
        print("    You can enter your Gemini API key now for this session.")
        user_key = input("Enter Gemini API Key (or press Enter to skip): ").strip()
        if user_key:
            agent = GeminiAssetAgent(api_key=user_key)

    print("\nChatbot initialized. Type your questions below (e.g. 'Show me all broken chairs in Computer Science', 'Who are our top vendors?'):\n")

    while True:
        try:
            user_input = input("\n👤 You > ").strip()
            if not user_input:
                continue

            if user_input.lower() in ("exit", "quit", "q"):
                print("\nGoodbye! 👋\n")
                break

            if user_input.startswith("/"):
                cmd = user_input.lower()
                if cmd == "/tools":
                    print("\n📋 Available Agent Tools:")
                    for t in AGENT_TOOLS:
                        print(f"  • {t.__name__}: {t.__doc__.strip().splitlines()[0] if t.__doc__ else ''}")
                    continue
                elif cmd == "/stats":
                    print("\n📊 Current Asset Statistics:")
                    print(get_asset_statistics())
                    continue
                elif cmd == "/reset":
                    agent.reset_chat()
                    print("\n🔄 Conversation memory cleared.")
                    continue
                elif cmd == "/help":
                    print("\nCommands: /tools, /stats, /reset, exit")
                    continue
                else:
                    print(f"Unknown command '{user_input}'. Type /help for assistance.")
                    continue

            print("\n🤖 Thinking & executing agent tools...")
            result = agent.chat(user_input)
            
            print(f"\n🤖 Agent ({config.GEMINI_MODEL}):\n")
            print(result.get("response", ""))

        except (KeyboardInterrupt, EOFError):
            print("\nSession ended.")
            break
        except Exception as e:
            print(f"\n[Error] {e}")

if __name__ == "__main__":
    start_cli()
