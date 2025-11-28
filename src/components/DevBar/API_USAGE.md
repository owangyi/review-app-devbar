# API Client Usage Guide

本文档说明如何在前端代码中使用 API 客户端来调用后端服务。

## 架构说明

- **前端域名**：`<branch>.discovery.wang`（如 `feature-dev-002.discovery.wang`）
- **后端域名**：`<branch>.api.discovery.wang`（如 `feature-dev-001.api.discovery.wang`）

前后端使用独立的域名系统，分支编号不会重复。

## 导入 API 客户端

```typescript
import { api, apiRequest, getBackendBaseUrl } from './components/DevBar/apiClient';
```

## 基本使用

### GET 请求

```typescript
// 获取用户列表
const response = await api.get('/users');
const users = await response.json();
```

### POST 请求

```typescript
// 创建新用户
const response = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});
const newUser = await response.json();
```

### PUT 请求

```typescript
// 更新用户
const response = await api.put('/users/123', {
  name: 'Jane Doe'
});
```

### DELETE 请求

```typescript
// 删除用户
const response = await api.delete('/users/123');
```

### PATCH 请求

```typescript
// 部分更新用户
const response = await api.patch('/users/123', {
  email: 'newemail@example.com'
});
```

## 高级用法

### 自定义请求头

```typescript
const response = await api.get('/users', {
  headers: {
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value'
  }
});
```

### 错误处理

```typescript
try {
  const response = await api.get('/users');
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const users = await response.json();
  console.log(users);
} catch (error) {
  console.error('Failed to fetch users:', error);
}
```

### 获取当前后端 URL

```typescript
import { getBackendBaseUrl } from './components/DevBar/apiClient';

const backendUrl = getBackendBaseUrl();
console.log('Current backend:', backendUrl);
// 输出示例：https://feature-dev-001.api.discovery.wang
```

## 工作原理

1. **读取 Cookie**：`x_target_backend`
2. **构造 URL**：
   - 如果 Cookie 存在：`https://<cookie-value>.api.discovery.wang`
   - 如果 Cookie 不存在：从当前 URL 提取分支名，使用 `https://<branch>.api.discovery.wang`
3. **发送请求**：自动附加到构造的 URL

## 示例场景

### 场景 1：默认情况（无 Cookie）

- 当前前端 URL：`http://feature-dev-002.discovery.wang`
- Cookie：无
- API 请求：`https://feature-dev-002.api.discovery.wang/users`

### 场景 2：切换后端后

- 当前前端 URL：`http://feature-dev-002.discovery.wang`
- Cookie：`x_target_backend=feature-dev-001`
- API 请求：`https://feature-dev-001.api.discovery.wang/users`

### 场景 3：跨分支测试

- 当前前端 URL：`http://feature-dev-002.discovery.wang`（新功能）
- Cookie：`x_target_backend=main`（稳定后端）
- API 请求：`https://main.api.discovery.wang/users`
- **效果**：测试新前端功能 + 稳定后端数据

## React 组件示例

```typescript
import React, { useState, useEffect } from 'react';
import { api } from './components/DevBar/apiClient';

interface User {
  id: number;
  name: string;
  email: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} ({user.email})
        </li>
      ))}
    </ul>
  );
};

export default UserList;
```

## 注意事项

1. **CORS 配置**：确保后端 API 服务器配置了正确的 CORS 策略，允许来自 `*.discovery.wang` 的请求
2. **HTTPS**：生产环境应使用 HTTPS
3. **错误处理**：始终处理可能的网络错误和 HTTP 错误
4. **类型安全**：建议为 API 响应定义 TypeScript 接口

## 与 DevBar 的集成

API 客户端自动与 DevBar 集成：

- 用户在 DevBar 中切换后端分支
- Cookie `x_target_backend` 被设置
- 页面刷新
- 所有后续 API 请求自动使用新的后端 URL

无需修改业务代码！

