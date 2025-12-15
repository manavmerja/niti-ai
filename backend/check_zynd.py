import inspect
from zyndai_agent.agent import AgentConfig

print("\n--- AgentConfig FIELDS ---")

# Check signature
try:
    sig = inspect.signature(AgentConfig)
    print(f"Signature: {sig}")
except Exception as e:
    print(f"Signature Error: {e}")

# Check agar ye Pydantic model hai (jo common hai AI agents me)
if hasattr(AgentConfig, 'model_fields'):
    print(f"Fields: {list(AgentConfig.model_fields.keys())}")
elif hasattr(AgentConfig, '__fields__'):
    print(f"Fields: {list(AgentConfig.__fields__.keys())}")