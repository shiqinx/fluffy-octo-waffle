# User模块接口对接分析文档

## 概述
本文档详细分析了后端UserController与前端auth.js的接口对接情况，记录了发现的问题及修复方案。

## 接口匹配分析

### 1. 接口路径对比

| 功能 | 后端接口路径 | 前端调用路径 | 状态 |
|------|-------------|-------------|------|
| 用户注册 | POST /api/user/register | POST /api/user/register | ✅ 已修复 |
| 用户登录 | POST /api/user/login | POST /api/user/login | ✅ 已修复 |
| 修改密码 | POST /api/user/change-password | POST /api/user/change-password | ✅ 已修复 |
| 用户登出 | POST /api/user/logout | POST /api/user/logout | ✅ 已修复 |

**修复前问题：** 前端auth.js使用/api/auth/*路径，与后端UserController的/api/user/*不匹配。

### 2. 请求DTO兼容性分析

#### UserRegisterRequest
**后端字段结构：**
```java
public class UserRegisterRequest {
    private String realName;      // 真实姓名
    private String studentId;     // 学号
    private String password;      // 密码
}
```

**前端处理：**
- ✅ 已添加`convertToUserRegisterRequest`转换函数
- ✅ 参数验证从username/email改为realName/studentId
- ✅ 字段映射正确

#### UserLoginRequest
**后端字段结构：**
```java
public class UserLoginRequest {
    private String userId;        // 用户ID（学号）
    private String userPassword;  // 用户密码
    private boolean rememberMe;   // 记住我
}
```

**前端处理：**
- ✅ 使用`convertToUserLoginRequest`转换函数
- ✅ 字段映射：userId→userId, password→userPassword, rememberMe→rememberMe

#### ChangePasswordRequest
**后端字段结构：**
```java
public class ChangePasswordRequest {
    private Integer userId;           // 用户ID
    private String user_OldPassword;  // 旧密码
    private String user_NewPassword;  // 新密码
}
```

**前端处理：**
- ✅ 使用`convertToChangePasswordRequest`转换函数
- ✅ 字段映射正确

### 3. 响应DTO兼容性分析

#### UserRegisterResponse
**后端响应格式：**
```json
{
    "code": 200,
    "message": "注册成功",
    "userId": 12345,
    "timestamp": 1234567890
}
```

**前端处理：**
- ✅ 响应格式兼容
- ✅ 正确提取userId和message字段

#### UserLoginResponse
**后端响应格式：**
```json
{
    "code": 200,
    "message": "登录成功",
    "userId": 12345,
    "timestamp": 1234567890,
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "tokenType": "Bearer",
    "rememberMe": true
}
```

**前端处理：**
- ✅ 已修复响应格式适配
- ✅ 正确处理accessToken→token, userId→user对象转换
- ✅ 处理refreshToken和rememberMe字段

#### ChangePasswordResponse
**后端响应格式：**
```json
{
    "code": 200,
    "message": "密码修改成功",
    "userId": 12345,
    "timestamp": 1234567890
}
```

**前端处理：**
- ✅ 响应格式兼容
- ✅ 正确提取userId和message字段

## 修复内容汇总

### 1. 新增转换函数
在`src/utils/dataModelConverter.js`中添加：
```javascript
export const convertToUserRegisterRequest = (frontendData) => {
  return {
    realName: frontendData.realName,
    studentId: frontendData.studentId,
    password: frontendData.password
  }
}
```

### 2. 修改接口路径
所有接口路径从`/api/auth/*`修改为`/api/user/*`：
- register: `/api/auth/register` → `/api/user/register`
- login: `/api/auth/login` → `/api/user/login`
- changePassword: `/api/auth/change-password` → `/api/user/change-password`
- logout: `/api/auth/logout` → `/api/user/logout`

### 3. 更新导入语句
在`src/api/auth.js`中添加：
```javascript
import {
  handleApiError,
  convertToUserRegisterRequest,
  convertToUserLoginRequest,
  convertToChangePasswordRequest
} from '@/utils/dataModelConverter'
```

### 4. 修复响应格式处理
- **login函数：** 适配JWT响应格式，正确处理accessToken、userId等字段
- **changePassword函数：** 添加userId和timestamp字段提取
- **logout函数：** 添加userId和timestamp字段提取

## 测试建议

### 1. 功能测试
- [ ] 用户注册功能测试
- [ ] 用户登录功能测试（包含记住我选项）
- [ ] 密码修改功能测试
- [ ] 用户登出功能测试

### 2. 边界情况测试
- [ ] 注册时缺少必要参数
- [ ] 登录时错误的用户名密码
- [ ] 修改密码时旧密码错误
- [ ] 未登录状态下调用需要认证的接口

### 3. 数据格式测试
- [ ] 前端表单数据到后端DTO的转换
- [ ] 后端响应到前端数据模型的转换
- [ ] 错误响应格式的统一处理

## 兼容性说明

### 前端版本兼容性
- ✅ Vue 3.x
- ✅ Axios 1.x
- ✅ 现有UI组件无需修改

### 后端版本兼容性
- ✅ Spring Boot 3.x
- ✅ Spring Security 6.x
- ✅ JWT Token认证

## 注意事项

1. **Token存储：** 前端需要正确存储JWT accessToken和refreshToken
2. **认证头：** 后续API调用需要在请求头中携带Bearer Token
3. **错误处理：** 统一使用handleApiError处理API错误
4. **数据验证：** 前端表单验证与后端@Valid注解验证保持一致

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0 | 2024-12-XX | 初始版本，完成User模块接口对接分析 |
| 1.1 | 2024-12-XX | 修复接口路径不匹配问题 |
| 1.2 | 2024-12-XX | 添加数据转换函数和响应格式适配 |

---

**文档维护：** 前端开发团队  
**最后更新：** 2024-12-XX  
**版本：** 1.0