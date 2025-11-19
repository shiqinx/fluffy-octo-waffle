# 认证模块前后端接口对接分析

## 📋 接口匹配状态

| 接口 | 前端路径 | 后端路径 | 状态 | 说明 |
|------|----------|----------|------|------|
| 用户登录 | POST /api/auth/login | POST /api/auth/login | ✅ 已适配 | 参数格式和响应格式已调整 |
| 刷新令牌 | POST /api/auth/refresh | POST /api/auth/refresh | ✅ 已适配 | 请求头和响应格式已优化 |
| 检查令牌 | GET /api/auth/check | GET /api/auth/check | ✅ 已适配 | 响应格式已统一 |

## 🔧 已修复的问题

### 1. 用户登录接口

**问题：**
- 前端缺少 `rememberMe` 参数
- 响应格式不匹配后端JWT格式

**修复：**
```javascript
// 前端参数适配
const loginData = {
  username: data.studentId || data.username,
  password: data.password,
  rememberMe: data.rememberMe || false  // 新增
}

// 响应格式适配
return {
  success: true,
  message: '登录成功',
  result: {
    token: backendData.accessToken || backendData.token || '',
    refreshToken: backendData.refreshToken || '',        // 新增
    tokenType: backendData.tokenType || 'Bearer',        // 新增
    expiresIn: backendData.expiresIn || null,
    rememberMe: backendData.rememberMe || false,          // 新增
    user: backendData.user || {}
  }
}
```

### 2. 刷新令牌接口

**问题：**
- 后端需要从 Authorization 头获取 refreshToken
- 前端直接调用没有传递正确的请求头

**修复：**
```javascript
// 添加Authorization请求头
const response = await request.post('/api/auth/refresh', {}, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('refreshToken') || ''}`
  }
})

// 请求拦截器增强
if (refreshToken && config.url && config.url.includes('/api/auth/refresh')) {
  config.headers['X-Refresh-Token'] = refreshToken
}
```

### 3. 检查令牌接口

**问题：**
- 响应格式缺少 `aboutToExpire` 字段
- 字段名称不一致

**修复：**
```javascript
// 响应格式适配
return {
  success: true,
  message: '令牌验证成功',
  result: {
    valid: backendData.valid !== undefined ? backendData.valid : true,
    aboutToExpire: backendData.aboutToExpire || false,  // 新增
    userId: backendData.userId || '',
    username: backendData.username || '',
    expiresIn: backendData.expiresIn || null
  }
}
```

## 🔄 请求拦截器增强

### 新增功能：
1. **刷新令牌支持** - 自动为刷新令牌接口添加必要的请求头
2. **自动令牌刷新** - 401错误时自动尝试刷新令牌并重试请求
3. **统一响应格式处理** - 自动包装后端直接返回的数据

### 关键代码：
```javascript
// 刷新令牌支持
const refreshToken = localStorage.getItem('refreshToken')
if (refreshToken && config.url && config.url.includes('/api/auth/refresh')) {
  config.headers['X-Refresh-Token'] = refreshToken
}

// 自动令牌刷新
if (response?.status === 401) {
  if (!config.url.includes('/api/auth/refresh')) {
    // 尝试刷新令牌并重试请求
    const refreshResponse = await request.post('/api/auth/refresh', {}, {
      headers: { 'Authorization': `Bearer ${refreshToken}` }
    })
    // 重新发送原请求...
  }
}
```

## 📊 后端数据格式对照

### 登录接口响应
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "rememberMe": false
}
```

### 刷新令牌响应
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### 检查令牌响应
```json
{
  "valid": true,
  "aboutToExpire": false,
  "userId": 123
}
```

## 🧪 测试建议

### 1. 基础功能测试
- ✅ 正常登录流程
- ✅ 记住我功能
- ✅ 令牌自动刷新
- ✅ 令牌过期处理

### 2. 异常情况测试
- ❌ 无效用户名密码
- ❌ 过期的刷新令牌
- ❌ 网络连接失败
- ❌ 并发请求处理

### 3. 边界条件测试
- 🔍 令牌即将过期（15分钟内）
- 🔍 长时间无操作后唤醒
- 🔍 多标签页同步登录状态

## 📝 联调检查清单

### 前端检查
- [x] 登录参数包含 `rememberMe` 字段
- [x] 正确处理JWT响应格式
- [x] 刷新令牌存储在localStorage
- [x] 请求拦截器支持令牌自动刷新
- [x] 响应拦截器统一处理401错误

### 后端检查
- [x] LoginRequest DTO包含rememberMe字段
- [x] 刷新令牌接口从Authorization头提取令牌
- [x] JWT令牌包含必要的用户信息
- [x] 错误响应格式统一

### 配置检查
- [x] CORS配置允许前端域名
- [x] JWT过期时间配置合理
- [x] 刷新令牌过期时间长于访问令牌
- [x] 日志记录包含必要的调试信息

## 🚀 下一步行动

1. **启动后端服务** - 确保认证服务正常运行
2. **切换到后端模式** - 运行 `switch-to-backend.bat` 脚本
3. **测试登录流程** - 使用测试页面验证接口对接
4. **验证令牌刷新** - 测试自动刷新机制
5. **检查错误处理** - 验证异常情况的用户体验

## 📞 技术支持

如果在联调过程中遇到问题，请检查：
1. 浏览器控制台的网络请求日志
2. 后端服务的日志输出
3. JWT令牌的生成和验证逻辑
4. 前端localStorage中的令牌存储状态

---

**更新时间：** 2025-11-04  
**版本：** v1.0.0  
**状态：** ✅ 认证模块接口对接完成