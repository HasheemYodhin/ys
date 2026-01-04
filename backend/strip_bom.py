import os

env_path = 'd:\\ys\\ys\\backend\\.env'

try:
    # Read with utf-8-sig to automatically handle BOM
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    
    # Write back with utf-8 (no BOM)
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("Successfully stripped BOM and saved as UTF-8.")
except Exception as e:
    print(f"Error: {e}")
