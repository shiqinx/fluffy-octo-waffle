# 前后端接口对接分析报告

## 📊 Activity模块接口对比

### 🔍 接口映射分析

| 功能 | 前端API | 后端Controller | 状态 |
|------|---------|----------------|------|
| 创建活动 | `POST /api/activity/create` | `POST /api/activity/create` | ✅ 匹配 |
| 获取活动列表 | `GET /api/activity/list` | `GET /api/activity/list` | ⚠️ 参数差异 |
| 获取活动详情 | `GET /api/activity/detail/{id}` | `GET /api/activity/detail/{id}` | ✅ 匹配 |
| 加入活动 | `POST /api/activity/join` | `POST /api/activity/join` | ✅ 匹配 |
| 同意加入 | `POST /api/activity/agree-join` | `POST /api/activity/agree-join` | ⚠️ 参数差异 |
| 活动签到 | `POST /api/activity/check-in` | `POST /api/activity/check-in` | ✅ 匹配 |
| 发送聊天 | `POST /api/activity/chat/send` | `POST /api/activity/chat/send` | ⚠️ 参数差异 |
| 聊天记录 | `GET /api/activity/chat/history/{id}` | `GET /api/activity/chat/history/{id}` | ✅ 匹配 |

## ⚠️ 需要调整的接口

### 1. 获取活动列表接口

**后端期望：**
```java
@GetMapping("/list")
public ResponseEntity<CheckListActivityResponse> getActivityList(@RequestParam String keyword)
```

**前端当前调用：**
```javascript
// 前端发送 params = { keyword: "搜索词" }
const response = await request.get('/api/activity/list', { params })
```

**问题：** 后端要求 `@RequestParam String keyword`，但前端可能发送空参数

**解决方案：**
```javascript
// 修改前端调用
export const getActivityList = async (params = {}) => {
  try {
    // 确保keyword参数存在，即使为空字符串
    const requestParams = { keyword: params.keyword || '' }
    
    if (useMock) {
      const mockResponse = await mockGetActivityList(requestParams)
      return convertToPaginationData(mockResponse)
    }
    
    const response = await request.get('/api/activity/list', { params: requestParams })
    return convertToPaginationData(response.data)
  } catch (error) {
    return handleApiError(error)
  }
}
```

### 2. 同意加入活动接口

**后端期望：**
```java
@PostMapping("/agree-join")
public ResponseEntity<ParticipateInActivityResponse> agreeJoin(
    @RequestBody ParticipateInActivityResponse agreement)
```

**前端当前调用：**
```javascript
const response = await request.post('/api/activity/agree-join', data)
```

**问题：** 后端期望接收 `ParticipateInActivityResponse` 对象

**解决方案：**
```javascript
// 确保前端发送正确的数据格式
export const agreeJoinActivity = async (data) => {
  try {
    // 构造后端期望的数据格式
    const agreementData = {
      activityId: data.activityId,
      userId: data.userId,
      status: data.status || 'approved',
      // ... 其他必要字段
    }
    
    const response = await request.post('/api/activity/agree-join', agreementData)
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}
```

### 3. 发送聊天消息接口

**后端期望：**
```java
@PostMapping("/chat/send")
public ResponseEntity<String> sendActivityChat(
    HttpServletRequest httpRequest,
    @RequestParam Integer activityId,
    @RequestBody String content)
```

**前端当前调用：**
```javascript
const response = await request.post('/api/activity/chat/send', messageDTO)
```

**问题：** 后端使用 `@RequestParam` 接收 activityId，`@RequestBody` 接收 content

**解决方案：**
```javascript
export const sendActivityChat = async (data) => {
  try {
    if (!data || typeof data !== 'object' || !data.activityId || !data.content) {
      throw new Error('聊天消息必须包含活动ID和消息内容')
    }
    
    if (useMock) {
      const mockResult = await mockSendActivityChat(data)
      return {
        success: true,
        data: mockResult
      }
    }
    
    // 使用FormData发送，因为后端混合使用了@RequestParam和@RequestBody
    const formData = new FormData()
    formData.append('activityId', data.activityId)
    formData.append('content', data.content)
    
    const response = await request.post('/api/activity/chat/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    return response.data || { success: true, data: response }
  } catch (error) {
    return handleApiError(error)
  }
}
```

## 🔧 建议的后端调整

### 1. 统一请求参数格式

**建议修改聊天接口：**
```java
@PostMapping("/chat/send")
public ResponseEntity<String> sendActivityChat(
    HttpServletRequest httpRequest,
    @RequestBody ChatMessageRequest request) {
    String currentUserId = (String) httpRequest.getAttribute("currentUserId");
    User sender = userRepository.findById(Integer.valueOf(currentUserId)).orElseThrow();

    MessageSendDTO messageDTO = new MessageSendDTO(
        request.getContent(), 
        Integer.valueOf(currentUserId), 
        request.getActivityId()
    );
    String result = new MessageServer().sendMessage(messageDTO);
    return ResponseEntity.ok(result);
}
```

**对应的请求DTO：**
```java
@Data
public class ChatMessageRequest {
    private Integer activityId;
    private String content;
}
```

### 2. 添加分页支持

**建议修改活动列表接口：**
```java
@GetMapping("/list")
public ResponseEntity<CheckListActivityResponse> getActivityList(
    @RequestParam(defaultValue = "") String keyword,
    @RequestParam(defaultValue = "1") Integer page,
    @RequestParam(defaultValue = "10") Integer size) {
    ActivityListRequest listRequest = new ActivityListRequest(keyword, page, size);
    CheckListActivityResponse response = activityServer.ActivityListResponse(listRequest);
    return ResponseEntity.ok(response);
}
```

## 🧪 联调测试建议

### 1. 创建活动测试

```javascript
// 测试数据
const activityData = {
  title: "测试活动",
  description: "这是一个测试活动",
  startTime: "2024-12-20T10:00:00Z",
  endTime: "2024-12-20T12:00:00Z",
  location: "测试地点",
  maxParticipants: 50
}

// 调用测试
const result = await createActivity(activityData)
console.log('创建活动结果:', result)
```

### 2. 获取活动列表测试

```javascript
// 测试搜索
const result = await getActivityList({ keyword: "测试" })
console.log('活动列表:', result)
```

### 3. 加入活动测试

```javascript
// 测试加入活动
const result = await joinActivity("1", { message: "我想参加这个活动" })
console.log('加入活动结果:', result)
```

## 📋 联调检查清单

### 前端检查项
- [ ] 确认 `VITE_USE_MOCK=false`
- [ ] 确认 `VITE_API_BASE_URL=http://localhost:8080/api`
- [ ] 检查请求头是否包含正确的 Authorization
- [ ] 验证数据格式转换是否正确

### 后端检查项
- [ ] 确认CORS配置允许前端域名
- [ ] 验证JWT认证拦截器配置
- [ ] 检查DTO对象的字段映射
- [ ] 确认异常处理机制

### 联调测试项
- [ ] 创建活动 ✅
- [ ] 获取活动列表 ⚠️
- [ ] 获取活动详情 ✅
- [ ] 加入活动 ✅
- [ ] 同意加入 ⚠️
- [ ] 活动签到 ✅
- [ ] 发送聊天 ⚠️
- [ ] 聊天记录 ✅

## 🚀 下一步行动

1. **立即修复：**
   - 修改 `getActivityList` 参数处理
   - 调整 `sendActivityChat` 请求格式
   - 完善 `agreeJoinActivity` 数据结构

2. **建议优化：**
   - 后端统一使用 `@RequestBody` 接收JSON
   - 添加分页支持
   - 完善错误响应格式

3. **测试验证：**
   - 使用 Postman 测试后端接口
   - 使用前端测试页面验证集成
   - 检查浏览器网络请求详情

---

**准备就绪，可以开始联调！** 🎯