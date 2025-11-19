# 🎯 活动模块前后端联调完整指南

## 📋 联调准备清单

### ✅ 前端已完成修复
1. **获取活动列表接口** - 适配后端 `@RequestParam String keyword` 参数
2. **同意加入活动接口** - 构造正确的 `ParticipateInActivityResponse` 数据格式
3. **发送聊天消息接口** - 使用 FormData 发送混合参数（@RequestParam + @RequestBody）

### 📁 已创建的文件
- `api-integration-analysis.md` - 接口对比分析报告
- `test-activity-api.html` - 活动API联调测试页面
- `backend-integration-guide.md` - 后端联调通用指南
- `switch-to-backend.bat` - Windows环境切换脚本

## 🚀 联调步骤

### 第一步：切换到后端环境
```bash
# 运行环境切换脚本
.\switch-to-backend.bat

# 或手动修改 .env.development
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8080/api
```

### 第二步：启动后端服务
确保后端Spring Boot服务运行在 `http://localhost:8080`

### 第三步：测试接口连接
访问测试页面：`http://localhost:3001/test-activity-api.html`

## 🔧 接口对接详情

### 1. 创建活动 ✅
**前端：** `POST /api/activity/create`  
**后端：** `POST /api/activity/create`  
**状态：** 接口路径匹配，数据格式兼容

### 2. 获取活动列表 ⚠️ 已修复
**前端：** `GET /api/activity/list?keyword=搜索词`  
**后端：** `GET /api/activity/list?keyword=搜索词`  
**修复：** 确保keyword参数始终存在（空字符串）

### 3. 获取活动详情 ✅
**前端：** `GET /api/activity/detail/{id}`  
**后端：** `GET /api/activity/detail/{id}`  
**状态：** 接口路径匹配

### 4. 加入活动 ✅
**前端：** `POST /api/activity/join`  
**后端：** `POST /api/activity/join`  
**状态：** 接口路径匹配

### 5. 同意加入活动 ⚠️ 已修复
**前端：** `POST /api/activity/agree-join`  
**后端：** `POST /api/activity/agree-join`  
**修复：** 构造正确的 `ParticipateInActivityResponse` 格式

### 6. 活动签到 ✅
**前端：** `POST /api/activity/check-in`  
**后端：** `POST /api/activity/check-in`  
**状态：** 接口路径匹配

### 7. 发送聊天消息 ⚠️ 已修复
**前端：** `POST /api/activity/chat/send` (FormData)  
**后端：** `POST /api/activity/chat/send`  
**修复：** 使用 FormData 发送混合参数

### 8. 获取聊天历史 ✅
**前端：** `GET /api/activity/chat/history/{id}`  
**后端：** `GET /api/activity/chat/history/{id}`  
**状态：** 接口路径匹配

## 🧪 测试用例

### 基础功能测试
```javascript
// 1. 创建活动
const activityData = {
  title: "API测试活动",
  description: "这是一个测试活动",
  location: "测试地点",
  startTime: "2024-12-20T10:00:00Z",
  endTime: "2024-12-20T12:00:00Z",
  maxParticipants: 50
}

// 2. 获取活动列表
const listParams = { keyword: "测试" }

// 3. 加入活动
const joinData = {
  activityId: 1,
  message: "我想参加这个活动"
}

// 4. 同意加入
const agreeData = {
  activityId: 1,
  userId: 2,
  status: "approved",
  message: "申请已通过"
}

// 5. 发送聊天消息
const chatData = {
  activityId: 1,
  content: "Hello, 这是测试消息!"
}
```

## 🔍 调试技巧

### 1. 网络请求监控
- 打开浏览器开发者工具 → Network 标签
- 检查请求URL、参数、响应状态码
- 查看响应数据格式

### 2. 常见问题排查
- **CORS错误**：检查后端CORS配置
- **401未授权**：检查JWT token是否正确传递
- **400参数错误**：检查请求参数格式
- **404接口不存在**：确认后端接口路径

### 3. 环境快速切换
```bash
# 切换到Mock模式
.\scripts\switch-env.bat mock

# 切换到后端模式
.\scripts\switch-env.bat backend
```

## 📊 数据格式对照

### 活动数据格式
```javascript
// 前端期望格式
{
  "id": 1,
  "title": "活动标题",
  "description": "活动描述",
  "location": "活动地点",
  "startTime": "2024-12-20T10:00:00Z",
  "endTime": "2024-12-20T12:00:00Z",
  "maxParticipants": 50,
  "currentParticipants": 10,
  "status": "active"
}
```

### 用户认证格式
```javascript
// 请求头
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

## 🎯 联调成功标准

### ✅ 接口调用成功
- 所有接口返回200状态码
- 数据格式正确解析
- 前端页面正常显示数据

### ✅ 功能流程完整
1. 创建活动 → 活动列表显示新活动
2. 用户加入活动 → 活动详情显示参与者
3. 发送聊天消息 → 聊天历史记录更新
4. 活动签到 → 签到状态更新

### ✅ 错误处理完善
- 网络错误有友好提示
- 参数错误有明确反馈
- 权限错误有相应处理

## 🆘 常见问题解决

### Q1: 后端接口返回404
**解决方案：** 检查后端服务是否启动，确认接口路径正确

### Q2: 前端请求被CORS阻止
**解决方案：** 后端添加CORS配置，允许前端域名访问

### Q3: JWT认证失败
**解决方案：** 检查token是否正确传递，确认后端认证拦截器配置

### Q4: 数据格式不匹配
**解决方案：** 参照数据格式对照表，调整前后端数据结构

---

## 🎉 准备就绪！

现在你可以：
1. 运行 `.\switch-to-backend.bat` 切换环境
2. 启动后端Spring Boot服务
3. 访问 `http://localhost:3001/test-activity-api.html` 测试接口
4. 逐步验证各个功能模块

**祝你联调顺利！** 🚀