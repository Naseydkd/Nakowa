#!/bin/bash

# Database Setup Script for Nakowa MVP
# This script helps set up the database for development

echo "🚀 Setting up Nakowa database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update DATABASE_URL in .env file before continuing"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check if npm packages are installed
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npx prisma generate

# Test database connection
echo "🔍 Testing database connection..."
if npx prisma db pull --schema=./prisma/schema.prisma 2>/dev/null; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Push schema to database
echo "📊 Applying database schema..."
npx prisma db push

# Seed database
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo "✅ Database setup completed successfully!"
echo ""
echo "📋 Default credentials:"
echo "   Admin: admin@nakowa.com / admin123"
echo "   Agent: agent@nakowa.com / agent123"
echo ""
echo "🔍 You can view the database with: npm run db:studio"
echo "🚀 Start the server with: npm run start:dev"