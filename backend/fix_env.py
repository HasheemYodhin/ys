import os

def fix_encoding(filename):
    try:
        # Read as binary
        with open(filename, 'rb') as f:
            raw = f.read()
        
        # Check for BOMs
        content = None
        encoding = None
        
        if raw.startswith(b'\xff\xfe'):
            print(f"{filename} detected as UTF-16 LE")
            encoding = 'utf-16-le'
        elif raw.startswith(b'\xfe\xff'):
            print(f"{filename} detected as UTF-16 BE")
            encoding = 'utf-16-be'
        else:
            print(f"{filename} does not look like UTF-16. checking content...")
            # Try decoding as utf-16 anyway if likely
            try:
                raw.decode('utf-16')
                print("Decoded as utf-16 successfully")
            except:
                print("Not valid utf-16")
        
        if encoding:
            content = raw.decode(encoding)
            # Write back as utf-8
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Successfully converted {filename} to UTF-8")
        else:
            print("No fix applied.")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_encoding("d:\\ys\\ys\\backend\\.env")
