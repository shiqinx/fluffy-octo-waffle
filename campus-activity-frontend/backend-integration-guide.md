# 后端联调指南

## 📋 联调前准备

### 1. 环境配置切换

#### 开发环境配置文件
```bash
# 修改 src/.env.development
VITE_USE_MOCK=false          # 关闭Mock数据
VITE_API_BASE_URL=http://localhost:8080/api  # 后端服务地址
VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
```

#### 生产环境配置文件
```bash
# src/.env.production (已经配置好)
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-domain.com/api
VITE_AMAP_KEY=30b170859f00b71edbd631aab944129a
```

### 2. 后端服务要求

确保后端服务提供以下API接口：

#### 团队相关接口
```
GET    /api/team/my-teams           # 获取我的团队列表
POST   /api/team/create             # 创建团队
GET    /api/team/{id}               # 获取团队详情
PUT    /api/team/{id}               # 更新团队信息
DELETE /api/team/{id}               # 删除团队
GET    /api/team/search             # 搜索团队
POST   /api/team/apply              # 申请加入团队
POST   /api/team/agree-apply        # 同意团队申请
POST   /api/team/leave/{id}         # 退出团队
GET    /api/team/{id}/join-requests # 获取团队加入申请
POST   /api/team/agree-join-request/{id} # 同意加入申请
```

#### 用户认证接口
```
POST   /api/auth/login              # 用户登录
POST   /api/auth/register           # 用户注册
GET    /api/auth/userinfo           # 获取用户信息
POST   /api/auth/logout             # 用户登出
```

#### 活动相关接口
```
GET    /api/activity/list           # 获取活动列表
POST   /api/activity/create         # 创建活动
GET    /api/activity/{id}           # 获取活动详情
POST   /api/activity/enroll         # 报名活动
```

## 🚀 联调步骤

### 1. 启动后端服务
```bash
# 确保后端服务在指定端口运行
# 默认端口: 8080
# API基础路径: /api
```

### 2. 切换前端配置
```bash
# 1. 修改环境变量
# 编辑 src/.env.development
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api

# 2. 重启前端开发服务器
npm run dev
```

### 3. 验证连接
打开浏览器访问 `http://localhost:3000`，检查网络面板：
- 所有API请求应该指向 `http://localhost:8080/api`
- 不应该有Mock数据的标记

## 🔍 调试技巧

### 1. 网络请求监控
前端已配置完整的请求/响应拦截器，在控制台可以看到：
```
🚀 发起请求: {url, method, data, mockMode}
✅ 请求成功: {url, data}
❌ 请求失败: {url, status, message}
```

### 2. 常见问题排查

#### CORS跨域问题
如果遇到跨域错误，确保后端配置了正确的CORS头：
```javascript
// 后端需要配置
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### 认证Token问题
前端会在请求头中自动添加：
```
Authorization: Bearer {token}
```

#### 数据格式问题
前端期望的响应格式：
```javascript
{
  success: true,
  data: {...},
  message: "操作成功"
}
```

### 3. 切换Mock/真实API
快速切换模式：
```javascript
// 在浏览器控制台执行
localStorage.setItem('VITE_USE_MOCK', 'false') // 切换到真实API
localStorage.setItem('VITE_USE_MOCK', 'true')  // 切换到Mock
```

## 📊 数据格式对照

### 团队数据格式
```javascript
// 前端发送 → 后端接收
{
  name: "团队名称",
  description: "团队描述",
  avatar: "头像URL",
  maxMembers: 50,
  tags: ["标签1", "标签2"]
}

// 后端返回 → 前端接收
{
  success: true,
  data: {
    id: 1,
    name: "团队名称",
    description: "团队描述",
    avatar: "头像URL",
    leaderId: 1,
    leaderName: "队长姓名",
    memberCount: 10,
    maxMembers: 50,
    tags: ["标签1", "标签2"],
    createdAt: "2024-01-01T00:00:00Z",
    role: "owner" // owner | member
  }
}
```

### 用户数据格式
```javascript
// 登录请求
{
  username: "用户名",
  password: "密码"
}

// 登录响应
{
  success: true,
  data: {
    token: "jwt_token",
    user: {
      id: 1,
      username: "用户名",
      nickname: "昵称",
      avatar: "头像URL",
      email: "邮箱"
    }
  }
}
```

## 🛠️ 联调工具

### 1. API测试页面
访问以下页面进行API测试：
- `http://localhost:3000/test-teams-api.html` - 团队API测试
- `http://localhost:3000/test-activity-api.html` - 活动API测试

### 2. 环境检查页面
访问 `http://localhost:3000/check-user-and-teams.html` 查看：
- 当前环境配置
- API连接状态
- 数据加载情况

## 📝 注意事项

### 1. 环境变量
- 修改 `.env` 文件后需要重启开发服务器
- 确保所有环境变量都以 `VITE_` 开头

### 2. 数据持久化
- Mock数据存储在内存中，刷新后丢失
- 真实API数据应该持久化到数据库

### 3. 错误处理
- 前端已实现统一的错误处理机制
- 后端应该返回标准化的错误格式

### 4. 性能优化
- 启用API缓存机制
- 合理设置请求超时时间
- 实现分页加载

## 🆘 常见问题

### Q: 请求发送到Mock而不是后端？
A: 检查 `VITE_USE_MOCK` 是否设置为 `false`，并重启开发服务器

### Q: 出现CORS错误？
A: 确保后端配置了正确的CORS策略，允许前端域名访问

### Q: 认证失败？
A: 检查Token是否正确传递，后端是否正确验证JWT

### Q: 数据格式不匹配？
A: 参考上方数据格式对照表，确保前后端数据结构一致

## 📞 技术支持

如果在联调过程中遇到问题，可以：
1. 查看浏览器控制台日志
2. 检查网络请求详情
3. 使用API测试页面验证接口
4. 查看环境检查页面的配置信息

---

**祝联调顺利！** 🎉