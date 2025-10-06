#!/bin/bash

# Script to download external images from blog posts and convert them to relative references
# Usage: ./download-and-localize-images.sh <blog-post-directory>
# Example: ./download-and-localize-images.sh website/src/content/blog-posts/best-platform-for-webtoon-creators

set -e

if [ -z "$1" ]; then
    echo "Error: Please provide a blog post directory"
    echo "Usage: $0 <blog-post-directory>"
    echo "Example: $0 website/src/content/blog-posts/best-platform-for-webtoon-creators"
    exit 1
fi

BLOG_POST_DIR="$1"
INDEX_FILE="$BLOG_POST_DIR/index.mdx"

if [ ! -f "$INDEX_FILE" ]; then
    echo "Error: $INDEX_FILE not found"
    exit 1
fi

# Extract the blog post slug from the directory path
BLOG_POST_SLUG=$(basename "$BLOG_POST_DIR")

# Determine the assets directory based on the blog post structure
# From the examples: ../../../assets/images/blog-posts/how-to-monetize-a-webcomic-complete-guide-2025/
ASSETS_BASE_DIR="website/src/assets/images/blog-posts"
BLOG_POST_ASSETS_DIR="$ASSETS_BASE_DIR/$BLOG_POST_SLUG"

# Create the assets directory if it doesn't exist
mkdir -p "$BLOG_POST_ASSETS_DIR"

echo "Processing blog post: $BLOG_POST_SLUG"
echo "Assets directory: $BLOG_POST_ASSETS_DIR"
echo ""

# Find all external image URLs (http:// or https://)
# Matches both ![alt](url) and ![](url) format
IMAGE_URLS=$(grep -oP '!\[.*?\]\(\K(https?://[^\)]+)' "$INDEX_FILE" || true)

if [ -z "$IMAGE_URLS" ]; then
    echo "No external images found in $INDEX_FILE"
    exit 0
fi

# Counter for images
IMAGE_COUNT=1
TOTAL_IMAGES=$(echo "$IMAGE_URLS" | wc -l)

echo "Found $TOTAL_IMAGES external image(s) to download"
echo ""

# Create a temporary file for the updated content
TMP_FILE=$(mktemp)
cp "$INDEX_FILE" "$TMP_FILE"

# Download each image and update the markdown file
while IFS= read -r IMAGE_URL; do
    if [ -z "$IMAGE_URL" ]; then
        continue
    fi

    echo "[$IMAGE_COUNT/$TOTAL_IMAGES] Downloading: $IMAGE_URL"

    # Determine file extension from URL or default to .png
    EXT=$(echo "$IMAGE_URL" | grep -oP '\.(png|jpg|jpeg|gif|webp|svg)(\?.*)?$' | grep -oP '\.(png|jpg|jpeg|gif|webp|svg)' || echo ".png")

    # Generate filename
    FILENAME="image${IMAGE_COUNT}${EXT}"
    OUTPUT_PATH="$BLOG_POST_ASSETS_DIR/$FILENAME"

    # Download the image
    if curl -L -f -s -o "$OUTPUT_PATH" "$IMAGE_URL"; then
        echo "  Saved to: $OUTPUT_PATH"

        # Calculate the relative path from the blog post to the assets directory
        # From: website/src/content/blog-posts/SLUG/index.mdx
        # To: website/src/assets/images/blog-posts/SLUG/imageN.ext
        # Relative path: ../../../assets/images/blog-posts/SLUG/imageN.ext
        RELATIVE_PATH="../../../assets/images/blog-posts/$BLOG_POST_SLUG/$FILENAME"

        # Escape special characters in URL for sed
        ESCAPED_URL=$(echo "$IMAGE_URL" | sed 's/[\/&]/\\&/g')
        ESCAPED_RELATIVE_PATH=$(echo "$RELATIVE_PATH" | sed 's/[\/&]/\\&/g')

        # Replace the URL in the temp file
        sed -i "s|${ESCAPED_URL}|${ESCAPED_RELATIVE_PATH}|g" "$TMP_FILE"
        echo "  Updated reference in markdown"
    else
        echo "  Failed to download image (keeping original URL)"
    fi

    echo ""
    IMAGE_COUNT=$((IMAGE_COUNT + 1))
done <<< "$IMAGE_URLS"

# Replace the original file with the updated one
mv "$TMP_FILE" "$INDEX_FILE"

echo "Done! Processed $((IMAGE_COUNT - 1)) image(s)"
echo "Updated file: $INDEX_FILE"
echo "Images saved to: $BLOG_POST_ASSETS_DIR"
