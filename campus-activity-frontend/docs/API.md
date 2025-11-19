# API 文档

## 概述

本文档描述了校园活动平台前端API的完整规范，包括认证、活动、用户、团队、聊天和位置等模块的API接口。

## 目录

- [认证API](#认证api)
- [活动API](#活动api)
- [用户API](#用户api)
- [团队API](#团队api)
- [聊天API](#聊天api)
- [位置API](#位置api)
- [错误处理](#错误处理)
- [参数验证](#参数验证)

---

## 认证API

### 登录

**接口地址：** `POST /api/auth/login`

**参数格式：**
```javascript
{
  studentId?: string,     // 学号（6-12位数字）
  username?: string,      // 用户名（3-20位字母数字下划线）
  password: string,       // 密码（至少6位，包含字母和数字）
  rememberMe?: boolean    // 记住密码选项
}
```

**使用示例：**
```javascript
import { validatedApi } from '@/api'

// 使用学号登录
const response = await validatedApi.login({
  studentId: '20210001',
  password: 'password123'
})

// 使用用户名登录
const response = await validatedApi.login({
  username: 'john_doe',
  password: 'password123'
})
```

**响应格式：**
```javascript
{
  success: boolean,
  message: string,
  data: {
    id: string,
    studentId: string,
    username: string,
    realName: string,
    email?: string,
    phone?: string,
    avatar?: string,
    creditScore: number,
    role: string
  },
  token: string
}
```

### 注册

**接口地址：** `POST /api/auth/register`

**参数格式：**
```javascript
{
  studentId: string,      // 学号（6-12位数字，唯一）
  realName: string,       // 真实姓名（2-10位中文）
  password: string,       // 密码（至少6位，包含字母和数字）
  confirmPassword: string, // 确认密码
  phone?: string,         // 手机号（可选）
  email?: string          // 邮箱（可选）
}
```

**使用示例：**
```javascript
const response = await validatedApi.register({
  studentId: '20210002',
  realName: '张三',
  password: 'password123',
  confirmPassword: 'password123',
  phone: '13800138000',
  email: 'zhangsan@example.com'
})
```

### 修改密码

**接口地址：** `PUT /api/auth/password`

**参数格式：**
```javascript
{
  oldPassword: string,    // 旧密码
  newPassword: string,    // 新密码
  confirmPassword: string // 确认新密码
}
```

---

## 活动API

### 创建活动

**接口地址：** `POST /api/activities`

**参数格式：**
```javascript
{
  title: string,          // 活动标题（1-100字符）
  description: string,    // 活动描述（10-2000字符）
  startTime: string,      // 开始时间（ISO格式）
  endTime: string,        // 结束时间（ISO格式）
  location: {             // 活动地点
    name: string,
    address: string,
    latitude: number,
    longitude: number
  },
  maxParticipants: number, // 最大参与人数（1-1000）
  tags?: string[],        // 标签数组（最多10个）
  type?: string,          // 活动类型
  requirements?: string   // 参与要求
}
```

**使用示例：**
```javascript
const response = await validatedApi.createActivity({
  title: '篮球友谊赛',
  description: '欢迎所有篮球爱好者参加的友谊比赛',
  startTime: '2024-01-20T14:00:00Z',
  endTime: '2024-01-20T17:00:00Z',
  location: {
    name: '学校体育馆',
    address: '北京市海淀区XX路XX号',
    latitude: 39.9042,
    longitude: 116.4074
  },
  maxParticipants: 20,
  tags: ['运动', '篮球', '友谊赛']
})
```

### 加入活动

**接口地址：** `POST /api/activities/:id/join`

**参数格式：**
```javascript
{
  activityId: string,     // 活动ID
  userId: string,         // 用户ID
  message?: string        // 申请消息（最多200字符）
}
```

**使用示例：**
```javascript
const response = await validatedApi.joinActivity({
  activityId: 'activity_123',
  userId: 'user_456',
  message: '我很想参加这个活动'
})
```

### 获取活动列表

**接口地址：** `GET /api/activities`

**参数格式：**
```javascript
{
  page?: number,          // 页码（默认1）
  pageSize?: number,      // 每页数量（默认10，最大100）
  keyword?: string,       // 搜索关键词（最多50字符）
  type?: string,          // 活动类型筛选
  status?: string         // 活动状态筛选
}
```

**使用示例：**
```javascript
const response = await validatedApi.getActivities({
  page: 1,
  pageSize: 20,
  keyword: '篮球'
})
```

---

## 用户API

### 获取用户信息

**接口地址：** `GET /api/users/profile`

**响应格式：**
```javascript
{
  success: boolean,
  data: {
    id: string,
    studentId: string,
    username: string,
    realName: string,
    email?: string,
    phone?: string,
    avatar?: string,
    creditScore: number,
    role: string,
    createdAt: string,
    updatedAt: string
  }
}
```

### 更新用户信息

**接口地址：** `PUT /api/users/profile`

**参数格式：**
```javascript
{
  realName?: string,      // 真实姓名
  email?: string,         // 邮箱
  phone?: string,         // 手机号
  avatar?: string         // 头像URL
}
```

---

## 团队API

### 创建团队

**接口地址：** `POST /api/teams`

**参数格式：**
```javascript
{
  name: string,           // 团队名称
  description: string,    // 团队描述
  maxMembers: number,     // 最大成员数
  tags?: string[]         // 团队标签
}
```

### 加入团队

**接口地址：** `POST /api/teams/:id/join`

**参数格式：**
```javascript
{
  teamId: string,         // 团队ID
  userId: string,         // 用户ID
  message?: string        // 申请消息
}
```

---

## 聊天API

### 发送消息

**接口地址：** `POST /api/messages`

**参数格式：**
```javascript
{
  receiverId: string,     // 接收者ID
  content: string,        // 消息内容
  type?: string          // 消息类型（text, image, file等）
}
```

### 获取消息列表

**接口地址：** `GET /api/messages`

**参数格式：**
```javascript
{
  page?: number,          // 页码
  pageSize?: number,      // 每页数量
  userId?: string         // 特定用户的消息
}
```

---

## 位置API

### 更新位置

**接口地址：** `PUT /api/location`

**参数格式：**
```javascript
{
  latitude: number,       // 纬度
  longitude: number,      // 经度
  address?: string       // 地址描述
}
```

### 获取附近活动

**接口地址：** `GET /api/activities/nearby`

**参数格式：**
```javascript
{
  latitude: number,       // 当前纬度
  longitude: number,      // 当前经度
  radius?: number        // 搜索半径（米，默认5000）
}
```

---

## 错误处理

### 错误类型

```javascript
// 验证错误
{
  code: 'VALIDATION_ERROR',
  message: '参数验证失败',
  field: 'studentId',
  details: '学号格式错误'
}

// 认证错误
{
  code: 'AUTH_ERROR',
  message: '认证失败',
  type: 'INVALID_CREDENTIALS'
}

// 网络错误
{
  code: 'NETWORK_ERROR',
  message: '网络连接失败',
  status: 500
}

// 资源未找到
{
  code: 'NOT_FOUND',
  message: '资源不存在',
  resource: 'activity'
}
```

### 错误处理示例

```javascript
import { handleApiError } from '@/utils/errorHandler'

try {
  const response = await validatedApi.login(credentials)
  // 处理成功响应
} catch (error) {
  const apiError = handleApiError(error)
  
  switch (apiError.code) {
    case 'VALIDATION_ERROR':
      console.log('验证失败:', apiError.field)
      break
    case 'AUTH_ERROR':
      console.log('认证失败:', apiError.type)
      break
    case 'NETWORK_ERROR':
      console.log('网络错误:', apiError.status)
      break
    default:
      console.log('未知错误:', apiError.message)
  }
}
```

---

## 参数验证

### 验证规则

所有API参数都会经过严格的验证，主要验证规则包括：

- **必填字段检查**：确保必需参数不为空
- **格式验证**：使用正则表达式验证格式
- **长度限制**：检查字符串长度和数值范围
- **业务逻辑验证**：如时间顺序、唯一性等

### 自定义验证

```javascript
import { validateParams, ValidationRules } from '@/utils/validation'

// 自定义验证规则
const customRules = {
  customField: {
    required: true,
    pattern: /^[A-Z]{3}$/,
    message: '必须是3位大写字母'
  }
}

// 执行验证
const validatedData = await validateParams(data, customRules)
```

---

## 使用指南

### 1. 导入API

```javascript
// 导入所有API
import api from '@/api'

// 导入特定API
import { validatedApi, validateLoginParams } from '@/api'
```

### 2. 使用带验证的API

推荐使用 `validatedApi`，它会自动进行参数验证和错误处理：

```javascript
// 登录
const response = await validatedApi.login({
  studentId: '20210001',
  password: 'password123'
})

// 创建活动
const response = await validatedApi.createActivity(activityData)
```

### 3. 错误处理

```javascript
try {
  const response = await validatedApi.someApi(params)
  // 处理成功响应
} catch (error) {
  // 错误已经被统一处理，可以直接使用
  console.error(error.message)
}
```

### 4. 参数验证

如果需要单独验证参数：

```javascript
import { validateLoginParams } from '@/api'

try {
  const validatedParams = await validateLoginParams(rawParams)
  // 使用验证后的参数
} catch (error) {
  // 处理验证错误
}
```

---

## 更新日志

### v2.0.0 (当前版本)
- ✅ 统一API入口和规范
- ✅ 优化错误处理机制
- ✅ 规范参数格式验证
- ✅ 完善API文档

### v1.0.0 (历史版本)
- 基础API功能实现
- Mock数据支持
- 基本错误处理

---

## 注意事项

1. **认证Token**：大部分API需要在请求头中包含认证token
2. **参数格式**：所有时间参数使用ISO 8601格式
3. **分页参数**：页码从1开始，每页最大100条记录
4. **错误处理**：建议使用try-catch包装所有API调用
5. **参数验证**：推荐使用validatedApi进行自动验证

---

## 联系方式

如有API相关问题，请联系开发团队或查看项目文档。