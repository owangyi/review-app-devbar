#!/bin/bash
# 动态生成 Docker Compose 配置用于新分支

BRANCH_SLUG=$1

if [ -z "$BRANCH_SLUG" ]; then
  echo "Usage: $0 <branch-slug>"
  echo "Example: $0 feature-dev-002"
  exit 1
fi

# 检查是否已存在
if grep -q "fe-$BRANCH_SLUG:" docker-compose.yml; then
  echo "⚠️  Branch containers already exist: $BRANCH_SLUG"
  exit 0
fi

echo "📦 Adding containers for branch: $BRANCH_SLUG"

# 追加到 docker-compose.yml
cat >> docker-compose.yml << EOF

  # Auto-generated for branch: $BRANCH_SLUG
  # Generated at: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
  fe-$BRANCH_SLUG:
    image: nginx:1.25-alpine
    container_name: fe-$BRANCH_SLUG
    volumes:
      - ./dist:/usr/share/nginx/html:ro
    networks:
      - review-app-network
    restart: unless-stopped

  be-$BRANCH_SLUG:
    image: node:20-alpine
    container_name: be-$BRANCH_SLUG
    working_dir: /app
    command: sh -c "npm install && npm start"
    volumes:
      - ./backend-example:/app
    environment:
      - NODE_ENV=production
      - PORT=8080
      - BRANCH_NAME=$BRANCH_SLUG
    expose:
      - "8080"
    networks:
      - review-app-network
    restart: unless-stopped
EOF

echo "✅ Containers added successfully!"
echo "   - fe-$BRANCH_SLUG"
echo "   - be-$BRANCH_SLUG"
echo ""
echo "Run: docker-compose up -d fe-$BRANCH_SLUG be-$BRANCH_SLUG"

