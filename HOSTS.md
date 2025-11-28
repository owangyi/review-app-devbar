# 本地 Hosts 配置

## 说明

为了在本地开发环境中测试多分支部署，需要在 `/etc/hosts` 文件中添加域名映射。

## 配置步骤

1. 编辑 hosts 文件：
```bash
sudo nano /etc/hosts
```

2. 添加以下内容：

```
# DevBar 本地开发环境 - 前端域名
127.0.0.1  develop.discovery.wang
127.0.0.1  feature-dev-001-say-hello-world.discovery.wang
127.0.0.1  feature-dev-002-update-hello-world.discovery.wang
127.0.0.1  discovery.wang

# DevBar 本地开发环境 - 后端 API 域名
127.0.0.1  develop.api.discovery.wang
127.0.0.1  feature-dev-001-say-hello-world.api.discovery.wang
127.0.0.1  feature-dev-002-update-hello-world.api.discovery.wang
```

3. 保存并退出（Ctrl+X，然后 Y，然后 Enter）

4. 验证配置：
```bash
ping develop.discovery.wang
# 应该看到 127.0.0.1 的响应
```

## 当前分支说明

### Main 分支
- **develop**: 主开发分支
  - 前端: http://develop.discovery.wang
  - 后端: http://develop.api.discovery.wang

### Feature 分支
- **feature/DEV-001-say-hello-world**: 第一个功能分支
  - 前端: http://feature-dev-001-say-hello-world.discovery.wang
  - 后端: http://feature-dev-001-say-hello-world.api.discovery.wang

- **feature/DEV-002-update-hello-world**: 第二个功能分支
  - 前端: http://feature-dev-002-update-hello-world.discovery.wang
  - 后端: http://feature-dev-002-update-hello-world.api.discovery.wang

## 启动服务

配置 hosts 后，启动开发环境：

```bash
docker-compose -f docker-compose.dev.yml up -d
```

访问任意分支地址即可看到 DevBar，并可在分支之间自由切换。

## 注意事项

- 分支名中的 `/` 会被转换为 `-`（如 `feature/DEV-001` → `feature-dev-001`）
- 所有字母会被转换为小写
- 特殊字符会被替换为 `-`
- 这是 DevBar 的 `branchToSubdomain()` 函数的转换逻辑

