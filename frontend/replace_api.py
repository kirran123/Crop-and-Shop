import os
import glob
import re

src_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src')
js_files = glob.glob(os.path.join(src_dir, '**', '*.jsx'), recursive=True)

import_meta = "`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}"

count = 0
for file_path in js_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We replace 'http://localhost:8000/api...' or `http://localhost:8000/api...`
    # We can just replace 'http://localhost:8000' with ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
    # But because they are wrapped in quotes (e.g., 'http://localhost...'), we need to ensure the whole string becomes a template literal if it isn't already.
    # Actually, simpler: just regex replace the exact string "http://localhost:8000", but we have to convert enclosing quotes to backticks if they are single/double quotes.
    
    # Regex designed to match: 'http://localhost:8000/something' -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/something`
    # And: `http://localhost:8000/something...` -> `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/something...`
    
    new_content = re.sub(
        r"(['\"\`])http://localhost:8000(.*?)(\1)",
        r"`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}\2`",
        content
    )
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f"Updated {os.path.basename(file_path)}")

print(f"Successfully migrated {count} files to use dynamic VITE_API_BASE_URL environments.")
