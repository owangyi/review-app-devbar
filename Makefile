.PHONY: help install build dev up down logs clean reset-env test hosts-check quick-start

help: ## 显示帮助信息
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## 安装依赖
	npm install
	@echo "✅ Dependencies installed"

build: ## 构建前端
	npm run build
	@echo "✅ Frontend built successfully"

hosts-check: ## 检查 /etc/hosts 配置
	@echo "📝 Checking /etc/hosts configuration..."
	@if grep -q "develop.discovery.wang" /etc/hosts 2>/dev/null; then \
		echo "✅ Hosts configured correctly"; \
	else \
		echo "⚠️  Hosts not configured!"; \
		echo ""; \
		echo "Run this command to add required entries:"; \
		echo ""; \
		echo "sudo bash -c 'cat >> /etc/hosts << EOF"; \
		echo "# Review App DevBar - Local Development"; \
		echo "127.0.0.1  develop.discovery.wang"; \
		echo "127.0.0.1  develop.api.discovery.wang"; \
		echo "127.0.0.1  feature-dev-001.discovery.wang"; \
		echo "127.0.0.1  feature-dev-001.api.discovery.wang"; \
		echo "127.0.0.1  discovery.wang"; \
		echo "EOF'"; \
	fi

quick-start: hosts-check build ## 快速启动（检查hosts + 构建 + 启动）
	@bash scripts/quick-start.sh

dev: build ## 启动本地开发环境（双域名系统）
	@echo "🚀 Starting local development environment..."
	docker-compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "✅ Services started!"
	@echo ""
	@echo "📍 Access Points:"
	@echo "   • develop:         http://develop.discovery.wang"
	@echo "   • feature-dev-001: http://feature-dev-001.discovery.wang"
	@echo "   • DevBar API:      http://develop.discovery.wang/dev-ops/environments.php"
	@echo ""
	@echo "Run 'make logs' to view logs"

up: build ## 构建并启动生产环境
	docker-compose up -d
	@echo "✅ Services started"
	@echo "Access at: http://localhost"

down: ## 停止所有服务
	docker-compose down
	docker-compose -f docker-compose.dev.yml down
	@echo "✅ Services stopped"

logs: ## 查看所有日志
	docker-compose -f docker-compose.dev.yml logs -f

logs-nginx: ## 查看 Nginx 日志
	docker-compose -f docker-compose.dev.yml logs -f nginx

logs-php: ## 查看 PHP 日志
	docker-compose -f docker-compose.dev.yml logs -f php-fpm

clean: ## 清理构建产物和容器
	rm -rf dist/ node_modules/
	docker-compose down -v
	docker-compose -f docker-compose.dev.yml down -v
	@echo "✅ Cleaned up"

reset-env: ## 重置环境（清除 Cookie）
	@echo "Visit http://develop.discovery.wang/reset-env to reset environment cookies"

test: ## 测试 API（双域名系统）
	@echo "🧪 Testing DevBar API..."
	@curl -s http://develop.discovery.wang/dev-ops/environments.php | head -n 20 || echo "⚠️  API not responding"
	@echo ""
	@echo "🧪 Testing Backend API (develop)..."
	@curl -s http://develop.api.discovery.wang/health || echo "⚠️  Backend not responding"
	@echo ""
	@echo "🧪 Testing Backend API (feature-dev-001)..."
	@curl -s http://feature-dev-001.api.discovery.wang/health || echo "⚠️  Backend not responding"

status: ## 检查服务状态
	@echo "=== Docker Containers ==="
	@docker-compose -f docker-compose.dev.yml ps
	@echo ""
	@echo "=== Network Status ==="
	@docker network ls | grep devbar

rebuild: down build dev ## 完全重建并重启

restart: ## 重启服务
	docker-compose -f docker-compose.dev.yml restart
	@echo "✅ Services restarted"

