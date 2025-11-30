#!/bin/bash

# Smart Irrigation System - Quick Deploy Script
# This script helps you build and prepare for production deployment

echo "🚀 Smart Irrigation System - Production Build"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "DEPLOYMENT.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
echo "Installing backend dependencies..."
cd backend
npm install --production=false
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

cd ../frontend
echo "Installing frontend dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi
cd ..

# Step 2: Build frontend
echo ""
echo "🏗️  Step 2: Building frontend for production..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build frontend"
    exit 1
fi
cd ..

# Step 3: Check environment variables
echo ""
echo "🔍 Step 3: Checking environment configuration..."
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found!"
    echo "Please create backend/.env with:"
    echo "  - MONGO_URI"
    echo "  - JWT_SECRET"
    echo "  - PORT"
fi

# Step 4: Summary
echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Setup MongoDB Atlas (free tier): https://www.mongodb.com/cloud/atlas"
echo "2. Create backend/.env with MONGO_URI and JWT_SECRET"
echo "3. Choose hosting platform:"
echo "   - Render.com (recommended): See DEPLOYMENT.md"
echo "   - Vercel (frontend) + Render (backend)"
echo "   - Railway.app"
echo ""
echo "📖 Full deployment guide: See DEPLOYMENT.md"
echo ""
echo "🎉 Your app is ready to deploy!"
