#!/bin/bash

# Script to help set up and run series length tests
# This script helps you get authentication credentials and run the tests

echo "==================================================="
echo "Series Length Functionality Test Runner"
echo "==================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.template .env
    echo "✓ Created .env file from template"
    echo ""
    echo "📝 Please edit .env and add your credentials:"
    echo "   1. Start the backend server (if not already running)"
    echo "   2. Open your browser and log into http://localhost:8080"
    echo "   3. Open browser DevTools (F12)"
    echo "   4. Go to Application > Cookies > http://localhost:8080"
    echo "   5. Copy the session cookie value and paste it as PATRONTS_COOKIE_AUTH in .env"
    echo "   6. Or go to Network tab, find an authenticated request, copy the Authorization"
    echo "      header value (without 'Bearer ') and paste as PATRONTS_BEARER_AUTH"
    echo ""
    echo "After editing .env, run this script again."
    exit 0
fi

# Check if credentials are set
source .env

if [ -z "$PATRONTS_BEARER_AUTH" ] && [ -z "$PATRONTS_COOKIE_AUTH" ]; then
    echo "❌ Error: No credentials found in .env file"
    echo ""
    echo "Please edit .env and add at least one of:"
    echo "  - PATRONTS_BEARER_AUTH (API token)"
    echo "  - PATRONTS_COOKIE_AUTH (session cookie)"
    exit 1
fi

echo "✓ Found credentials in .env"
echo ""

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✓ Server is running"
else
    echo "❌ Server is not responding at http://localhost:8080"
    echo "Please start the backend server before running tests."
    exit 1
fi

echo ""
echo "🔨 Building SDK..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ SDK built successfully"
else
    echo "❌ Failed to build SDK"
    exit 1
fi

echo ""
echo "🧪 Running series length tests..."
echo ""
npx tsx seriesLength.test.ts
