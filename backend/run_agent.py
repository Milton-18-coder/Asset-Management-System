#!/usr/bin/env python3
"""
Entrypoint runner for the Gemini 2.5 Flash Python AI Agent.

Usage:
    python run_agent.py             # Launches interactive Terminal CLI Chatbot
    python run_agent.py --server    # Launches REST API server on port 5050
    python run_agent.py --help      # Show help options
"""

import sys
import argparse
from python_agent.cli import start_cli
from python_agent.api import start_server

def main():
    parser = argparse.ArgumentParser(description="AssetMS Python Gemini 2.5 Flash AI Agent")
    parser.add_argument("--server", action="store_true", help="Run as REST API Server on port 5050")
    parser.add_argument("--port", type=int, default=5050, help="Custom port for API server (default: 5050)")
    parser.add_argument("--cli", action="store_true", help="Run interactive terminal chatbot (default)")
    
    args = parser.parse_args()

    if args.server:
        start_server(port=args.port)
    else:
        start_cli()

if __name__ == "__main__":
    main()
