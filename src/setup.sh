#!/bin/bash

# Beba Coiffure Backend Setup Script

echo "🚀 Setting up Beba Coiffure Backend..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    exit 1
fi

# Check Go version
GO_VERSION=$(go version | cut -d ' ' -f 3 | sed 's/go//')
echo "✅ Go version: $GO_VERSION"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials before running the server."
fi

# Install dependencies
echo "📦 Installing Go dependencies..."
go mod tidy

# Check if MySQL is running (optional check)
if command -v mysql &> /dev/null; then
    echo "✅ MySQL client found"
else
    echo "⚠️  MySQL client not found. Make sure MySQL server is running."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Create MySQL database: CREATE DATABASE beba_coiffure_db;"
echo "3. Create MySQL user with permissions (see README.md)"
echo "4. Run the server: go run main.go"
echo ""
echo "The server will be available at: http://localhost:8080"
echo "API documentation: http://localhost:8080/api"
