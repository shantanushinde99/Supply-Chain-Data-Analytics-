import sys
import os

# Add the parent directory to sys.path to allow imports
base_dir = os.path.dirname(os.path.dirname(__file__))
sys.path.append(base_dir)

from backend.api.chat import chat_with_data, ChatRequest

# We need to simulate the env var if not set
if "GROQ_API_KEY" not in os.environ:
    os.environ["GROQ_API_KEY"] = "fake_key_for_test"

req = ChatRequest(query="What is the total revenue?", history=[])

try:
    res = chat_with_data(req)
    print("RESULT:", res)
except Exception as e:
    import traceback
    traceback.print_exc()
