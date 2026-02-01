#!/bin/bash
# Quick Setup Script for Medical App Backend

echo "🏥 Medical App Backend Setup"
echo "============================"
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Create Prisma migration
echo ""
echo "🗄️  Setting up database..."
echo "Run this command to create database tables:"
echo "  npx prisma migrate dev --name init"
echo ""

# Step 3: View Prisma Studio
echo "📊 To manage database visually, run:"
echo "  npx prisma studio"
echo ""

echo "✅ Setup complete!"
echo ""
echo "🚀 Start the server with:"
echo "  npm run dev"
echo ""
echo "📝 For more info, read DATABASE_SETUP.md"
