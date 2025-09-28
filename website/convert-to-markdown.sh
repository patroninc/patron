#!/bin/bash
mkdir -p dist/markdown

find dist/html -type f -name "*.html" | while read -r file; do
    relative_path="${file#dist/html/}"
    
    dest_path="dist/markdown/${relative_path%.html}.md"
    
    mkdir -p "$(dirname "$dest_path")"
    
    npx @wcj/html-to-markdown-cli "$file" --stdout > "$dest_path"
done