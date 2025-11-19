# 认证模块后端联调指南

## 🚀 快速开始

### 1. 环境准备
确保你的后端认证服务已启动并运行在正确端口。

### 2. 前端环境切换
```bash
# Windows用户
switch-to-backend.bat

# 或手动修改
# 编辑 .env.development
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080
```

### 3. 启动前端服务
```bash
npm run dev
```

### 4. 访问测试页面
打开浏览器访问：`http://localhost:3001/test-auth-api.html`

## 📋 接口对接详情

### 用户登录接口
- **路径：** `POST /api/auth/login`
- **前端参数：**
  ```javascript
  {
    username: "testuser",        // 用户名或学号
    password: "password123",     // 密码
    rememberMe: false           // 记住我选项
  }
  ```
- **后端响应：**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600,
    "rememberMe": false
  }
  ```

### 刷新令牌接口
- **路径：** `POST /api/auth/refresh`
- **请求头：** `Authorization: Bearer {refreshToken}`
- **后端响应：**
  ```json
  {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600
  }
  ```

### 检查令牌接口
- **路径：** `GET /api/auth/check`
- **请求头：** `Authorization: Bearer {accessToken}`
- **后端响应：**
  ```json
  {
    "valid": true,
    "aboutToExpire": false,
    "userId": 123
  }
  ```

## 🔧 核心功能特性

### 1. 自动令牌刷新
- 当收到401错误时，前端自动尝试刷新令牌
- 刷新成功后自动重试原请求
- 刷新失败时自动跳转登录页

### 2. 令牌存储管理
- 访问令牌存储在localStorage
- 刷新令牌独立存储，支持长期有效
- 自动清理过期令牌

### 3. 请求拦截增强
- 自动添加Authorization请求头
- 支持Mock/后端模式切换
- 统一错误处理和响应格式

## 🧪 测试用例

### 基础功能测试
1. **正常登录流程**
   - 输入用户名密码
   - 选择记住我选项
   - 验证返回的令牌信息

2. **令牌状态检查**
   - 登录后检查令牌有效性
   - 验证令牌过期时间
   - 测试即将过期提醒

3. **令牌刷新机制**
   - 手动刷新令牌
   - 自动刷新测试
   - 刷新失败处理

### 异常情况测试
1. **无效凭据**
   - 错误的用户名密码
   - 验证错误提示信息

2. **令牌过期**
   - 模拟令牌过期场景
   - 验证自动刷新机制

3. **网络异常**
   - 网络连接失败
   - 服务器无响应
   - 超时处理

## 📊 调试技巧

### 1. 浏览器开发者工具
```javascript
// 查看当前令牌
console.log('Access Token:', localStorage.getItem('token'))
console.log('Refresh Token:', localStorage.getItem('refreshToken'))

// 查看请求详情
// Network标签页 -> 查看API请求的Headers和Response
```

### 2. 后端日志检查
- 检查JWT生成和验证日志
- 查看用户认证流程
- 监控令牌刷新请求

### 3. 常见问题排查
```javascript
// 清除所有令牌重新开始
localStorage.clear()

// 检查环境配置
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
console.log('Use Mock:', import.meta.env.VITE_USE_MOCK)
```

## 🔒 安全注意事项

### 1. 令牌安全
- 令牌仅在HTTPS环境下传输
- 刷新令牌设置合理的过期时间
- 定期轮换令牌密钥

### 2. 前端安全
- 避免在console.log中输出敏感信息
- 及时清理过期的令牌
- 设置适当的CORS策略

### 3. 后端安全
- 验证令牌签名
- 检查令牌过期时间
- 实现令牌黑名单机制

## 📈 性能优化

### 1. 请求优化
- 合并多个认证请求
- 使用请求缓存机制
- 实现请求去重

### 2. 令牌管理
- 预刷新令牌机制
- 并发请求处理
- 令牌存储优化

## 🚨 故障排除

### 常见错误及解决方案

1. **401 Unauthorized**
   - 检查令牌是否存在
   - 验证令牌格式
   - 确认后端验证逻辑

2. **403 Forbidden**
   - 检查用户权限
   - 验证角色配置
   - 确认资源访问控制

3. **500 Internal Server Error**
   - 检查后端日志
   - 验证数据库连接
   - 确认服务配置

4. **CORS Error**
   - 检查后端CORS配置
   - 验证预检请求
   - 确认允许的域名

## 📞 技术支持

如果在联调过程中遇到问题：

1. **检查日志**
   - 浏览器控制台错误
   - 网络请求状态
   - 后端服务日志

2. **验证配置**
   - API地址配置
   - 端口设置
   - 环境变量

3. **测试工具**
   - 使用Postman测试后端接口
   - 使用浏览器开发者工具
   - 查看测试页面结果

## ✅ 联调成功标准

- [ ] 用户可以正常登录获取令牌
- [ ] 令牌可以正常验证用户状态
- [ ] 令牌过期时可以自动刷新
- [ ] 异常情况有合适的错误处理
- [ ] 前后端数据格式完全匹配
- [ ] 安全机制正常工作

---

**更新时间：** 2025-11-04  
**版本：** v1.0.0  
**状态：** 🚀 准备联调