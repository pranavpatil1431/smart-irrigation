# Smart Irrigation System - Production Build Script for Windows
# Run this script: .\deploy.ps1

Write-Host "🚀 Smart Irrigation System - Production Build" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "DEPLOYMENT.md")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Step 1: Install dependencies
Write-Host "📦 Step 1: Installing dependencies..." -ForegroundColor Cyan
Write-Host "Installing backend dependencies..."
Set-Location backend
npm install --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Set-Location ..\frontend
Write-Host "Installing frontend dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Step 2: Build frontend
Write-Host ""
Write-Host "🏗️  Step 2: Building frontend for production..." -ForegroundColor Cyan
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build frontend" -ForegroundColor Red
    exit 1
}
Set-Location ..

# Step 3: Check environment variables
Write-Host ""
Write-Host "🔍 Step 3: Checking environment configuration..." -ForegroundColor Cyan
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Warning: backend\.env not found!" -ForegroundColor Yellow
    Write-Host "Please create backend\.env with:"
    Write-Host "  - MONGO_URI"
    Write-Host "  - JWT_SECRET"
    Write-Host "  - PORT"
}

# Step 4: Summary
Write-Host ""
Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Setup MongoDB Atlas (free tier): https://www.mongodb.com/cloud/atlas"
Write-Host "2. Create backend\.env with MONGO_URI and JWT_SECRET"
Write-Host "3. Choose hosting platform:"
Write-Host "   - Render.com (recommended): See DEPLOYMENT.md"
Write-Host "   - Vercel (frontend) + Render (backend)"
Write-Host "   - Railway.app"
Write-Host ""
Write-Host "📖 Full deployment guide: See DEPLOYMENT.md"
Write-Host ""
Write-Host "🎉 Your app is ready to deploy!" -ForegroundColor Green
