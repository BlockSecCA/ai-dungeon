#!/usr/bin/env python3
"""
Build script for AI Dungeon game.
Combines all source files into a single HTML file for deployment.

Usage:
    python build.py                  # Build to dist/ai-dungeon.html
    python build.py --output FILE    # Build to custom location
"""

import os
import sys
import base64
import re
from pathlib import Path

# Paths
SCRIPT_DIR = Path(__file__).parent
SRC_DIR = SCRIPT_DIR / "src"
DIST_DIR = SCRIPT_DIR / "dist"
ASSETS_DIR = SRC_DIR / "assets"

def read_file(path):
    """Read file contents as string."""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def encode_image(path):
    """Encode image file as base64 data URI."""
    suffix = path.suffix.lower()
    mime_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    }
    mime = mime_types.get(suffix, 'application/octet-stream')
    
    with open(path, 'rb') as f:
        data = base64.b64encode(f.read()).decode('ascii')
    
    return f"data:{mime};base64,{data}"

def process_portraits(config_content):
    """Replace PORTRAIT:filename placeholders with base64 data URIs."""
    # Match PORTRAIT:filename up to quote or comma
    pattern = r'PORTRAIT:([^"\'`,\s]+)'
    
    def replace_portrait(match):
        filename = match.group(1)
        image_path = ASSETS_DIR / filename
        if image_path.exists():
            print(f"  Embedding portrait: {filename}")
            return encode_image(image_path)
        else:
            print(f"  WARNING: Portrait not found: {filename}")
            return ""
    
    return re.sub(pattern, replace_portrait, config_content)

def build(output_path=None):
    """Build the single-file HTML output."""
    if output_path is None:
        output_path = DIST_DIR / "ai-dungeon.html"
    else:
        output_path = Path(output_path)
    
    print("Building AI Dungeon...")
    print(f"  Source: {SRC_DIR}")
    print(f"  Output: {output_path}")
    
    # Read source files
    print("\nReading source files...")
    index_html = read_file(SRC_DIR / "index.html")
    styles_css = read_file(SRC_DIR / "styles.css")
    config_js = read_file(SRC_DIR / "config.js")
    engine_js = read_file(SRC_DIR / "engine.js")
    
    # Process portraits in config
    print("\nProcessing portraits...")
    config_js = process_portraits(config_js)
    
    # Inject CSS
    print("\nInjecting CSS...")
    output = index_html.replace("/* INJECT:styles.css */", styles_css)
    
    # Inject JS
    print("Injecting JavaScript...")
    output = output.replace("// INJECT:config.js", config_js)
    output = output.replace("// INJECT:engine.js", engine_js)
    
    # Ensure output directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)
    
    size_kb = output_path.stat().st_size / 1024
    print(f"\nBuild complete: {output_path}")
    print(f"Output size: {size_kb:.1f} KB")
    
    return output_path

def main():
    output_path = None
    
    # Parse arguments
    args = sys.argv[1:]
    if '--output' in args:
        idx = args.index('--output')
        if idx + 1 < len(args):
            output_path = args[idx + 1]
    
    build(output_path)

if __name__ == "__main__":
    main()
