#!/bin/bash
# Quick Start Script for Review App DevBar - Local Development

set -e

echo "🚀 Review App DevBar - Local Development Setup"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Required hosts entries
REQUIRED_HOSTS=(
    "develop.discovery.wang"
    "develop.api.discovery.wang"
    "feature-dev-001.discovery.wang"
    "feature-dev-001.api.discovery.wang"
    "discovery.wang"
)

# Check /etc/hosts configuration
echo -e "${BLUE}📝 Checking /etc/hosts configuration...${NC}"
HOSTS_MISSING=false
for host in "${REQUIRED_HOSTS[@]}"; do
    if ! grep -q "$host" /etc/hosts 2>/dev/null; then
        HOSTS_MISSING=true
        break
    fi
done

if [ "$HOSTS_MISSING" = true ]; then
    echo -e "${YELLOW}⚠️  Some required hosts entries are missing!${NC}"
    echo ""
    echo "Please add the following to your /etc/hosts file:"
    echo ""
    echo -e "${BLUE}127.0.0.1  develop.discovery.wang${NC}"
    echo -e "${BLUE}127.0.0.1  develop.api.discovery.wang${NC}"
    echo -e "${BLUE}127.0.0.1  feature-dev-001.discovery.wang${NC}"
    echo -e "${BLUE}127.0.0.1  feature-dev-001.api.discovery.wang${NC}"
    echo -e "${BLUE}127.0.0.1  discovery.wang${NC}"
    echo ""
    echo "Run this command to add them:"
    echo ""
    echo -e "${YELLOW}sudo bash -c 'cat >> /etc/hosts << EOF"
    echo "# Review App DevBar - Local Development"
    echo "127.0.0.1  develop.discovery.wang"
    echo "127.0.0.1  develop.api.discovery.wang"
    echo "127.0.0.1  feature-dev-001.discovery.wang"
    echo "127.0.0.1  feature-dev-001.api.discovery.wang"
    echo "127.0.0.1  discovery.wang"
    echo -e "EOF'${NC}"
    echo ""
    read -p "Press Enter after adding hosts entries to continue..."
else
    echo -e "${GREEN}✅ Hosts configuration OK${NC}"
fi
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${RED}❗ Please edit .env file with your GitLab credentials before continuing!${NC}"
    echo ""
    echo "Required fields:"
    echo "  - GITLAB_ACCESS_TOKEN"
    echo "  - FRONTEND_PROJECT_ID"
    echo "  - BACKEND_PROJECT_ID"
    echo ""
    read -p "Press Enter when ready to continue..."
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Build frontend
echo ""
echo "🔨 Building frontend..."
npm run build
echo -e "${GREEN}✅ Frontend built${NC}"

# Check Docker
echo ""
echo "🐳 Checking Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker ready${NC}"

# Start services
echo ""
echo "🚢 Starting services with docker-compose..."
docker-compose -f docker-compose.dev.yml up -d

echo ""
echo -e "${GREEN}✅ Services started successfully!${NC}"
echo ""
echo "=============================================="
echo "📍 Access Points (双域名系统):"
echo ""
echo -e "   ${GREEN}前端分支:${NC}"
echo "   • develop:         http://develop.discovery.wang"
echo "   • feature-dev-001: http://feature-dev-001.discovery.wang"
echo "   • 主域名:          http://discovery.wang"
echo ""
echo -e "   ${GREEN}后端 API 分支:${NC}"
echo "   • develop:         http://develop.api.discovery.wang/health"
echo "   • feature-dev-001: http://feature-dev-001.api.discovery.wang/health"
echo ""
echo -e "   ${GREEN}DevBar API (共享):${NC}"
echo "   • 环境列表:        http://develop.discovery.wang/dev-ops/environments.php"
echo "   • 重置 Cookie:     http://develop.discovery.wang/reset-env"
echo ""
echo "=============================================="
echo "🎯 使用方法:"
echo ""
echo "   1. 访问任意前端域名（如 develop.discovery.wang）"
echo "   2. 页面底部会显示 DevBar 工具栏"
echo "   3. 使用 DevBar 切换前后端分支"
echo "   4. 观察 Cookie 和 URL 变化"
echo ""
echo "=============================================="
echo "📊 Useful Commands:"
echo "   查看日志:     docker-compose -f docker-compose.dev.yml logs -f"
echo "   停止服务:     docker-compose -f docker-compose.dev.yml down"
echo "   重启服务:     docker-compose -f docker-compose.dev.yml restart"
echo "   重新构建:     npm run build && docker-compose -f docker-compose.dev.yml restart nginx"
echo ""
echo "📚 Documentation:"
echo "   README.md         - 快速开始"
echo "   ARCHITECTURE.md   - 架构设计"
echo "   LIFECYCLE.md      - 生命周期"
echo ""
echo "=============================================="

