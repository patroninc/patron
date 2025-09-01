#!/bin/bash

set -e

echo "🔄 Generating fresh OpenAPI spec..."
cargo run --manifest-path backend/server/Cargo.toml --bin redoc_ci > clients/ts-sdk/openapi.json

echo "✅ OpenAPI spec generated at clients/ts-sdk/openapi.json"

echo "🔄 Rebuilding TypeScript SDK..."
cd clients/ts-sdk
speakeasy run

echo "✅ TypeScript SDK rebuilt successfully"
echo "🎉 OpenAPI generation and SDK rebuild complete!"