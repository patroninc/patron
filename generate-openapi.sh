#!/bin/bash

set -e

echo "🔄 Generating fresh OpenAPI spec..."
cargo run --manifest-path backend/server/Cargo.toml --bin redoc_ci > clients/ts-sdk/openapi.json

echo "✅ OpenAPI spec generated at clients/ts-sdk/openapi.json"

echo "🔧 Adding additionalProperties: true to Value schema..."

# Use jq to add additionalProperties: true to the Value schema
jq '
  # Add additionalProperties to Value schema
  .components.schemas.Value.additionalProperties = true
' clients/ts-sdk/openapi.json > clients/ts-sdk/openapi.json.tmp && mv clients/ts-sdk/openapi.json.tmp clients/ts-sdk/openapi.json

echo "✅ Added additionalProperties: true to Value schema"

echo "🔄 Rebuilding TypeScript SDK..."
cd clients/ts-sdk
speakeasy run

echo "✅ TypeScript SDK rebuilt successfully"
echo "🎉 OpenAPI generation and SDK rebuild complete!"