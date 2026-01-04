from dotenv import dotenv_values
import os

env_path = 'd:\\ys\\ys\\backend\\.env'

if not os.path.exists(env_path):
    print(f"File not found: {env_path}")
else:
    print(f"File exists: {env_path}")
    try:
        config = dotenv_values(env_path)
        print("Keys found in .env:")
        for key in config.keys():
            print(f"- {key}")
            
        if not config:
            print("No keys found! File might be empty or malformed.")
            # Read first few bytes to check if it's still weird encoding
            with open(env_path, 'rb') as f:
                print(f"First 20 bytes: {f.read(20)}")
    except Exception as e:
        print(f"Error parsing .env: {e}")
