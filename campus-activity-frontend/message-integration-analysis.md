# Message模块前后端接口对接分析

## 📋 接口匹配情况总览

| 接口名称 | 后端路径 | 前端路径 | 匹配状态 |
|---------|---------|---------|---------|
| 撤回消息 | POST /api/messages/recall | POST /api/messages/recall | ⚠️ **请求格式不匹配** |
| 发送消息 | POST /api/messages/send | POST /api/messages/send | ⚠️ **请求格式不匹配** |
| 查看个人消息历史 | GET /api/messages/history | GET /api/messages/history | ⚠️ **响应格式不匹配** |
| 查看活动消息历史 | GET /api/messages/activity/history/{activityId} | GET /api/messages/activity/history/{activityId} | ⚠️ **响应格式不匹配** |

## 🔍 详细接口分析

### 1. 撤回消息接口

**后端接口：**
```java
@PostMapping("/recall")
public ResponseEntity<String> recallMessage(@RequestBody RecallMessageRequest recall) {
    try {
        String result = messageServer.recallMessage(recall);
        return ResponseEntity.ok(result);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("撤回失败：" + e.getMessage());
    }
}
```

**前端接口：**
```javascript
export const recallMessage = async (messageId) => {
  const response = await request.post('/api/messages/recall', { messageId })
  return {
    success: true,
    message: '消息撤回成功',
    result: response.data || {}
  }
}
```

**匹配状态：** ⚠️ **请求格式不匹配**

### 2. 发送消息接口

**后端接口：**
```java
@PostMapping("/send")
public ResponseEntity<String> sendMessage(@RequestBody MessageSendDTO messageSendDTO) {
    try {
        String result = messageServer.sendMessage(messageSendDTO);
        return ResponseEntity.ok(result);
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("发送失败：" + e.getMessage());
    }
}
```

**前端接口：**
```javascript
export const sendMessage = async (params) => {
  const { convertToMessageSendDTO } = await import('@/utils/dataModelConverter')
  const sendData = convertToMessageSendDTO(messageDTO)
  const response = await request.post('/api/messages/send', sendData)
  return {
    success: true,
    message: '消息发送成功',
    result: response.data || {}
  }
}
```

**匹配状态：** ⚠️ **请求格式不匹配**

### 3. 查看个人消息历史接口

**后端接口：**
```java
@GetMapping("/history")
public ResponseEntity<ListMessageHistory> getPersonalMessageHistory(
        @RequestParam String receiverId) {
    MessageHistoryRequest historyRequest = new MessageHistoryRequest();
    historyRequest.setReceiveId(Integer.valueOf(receiverId));
    ListMessageHistory messageHistory = messageServer.messageHistory(historyRequest);
    return ResponseEntity.ok(messageHistory);
}
```

**前端接口：**
```javascript
export const getMessageHistory = async (params) => {
  const response = await request.get('/api/messages/history', {
    params: { receiveId, page: pageNum, pageSize: size }
  })
  return {
    success: true,
    message: '获取消息历史成功',
    result: response.data || { messageHistory: [], result: false }
  }
}
```

**匹配状态：** ⚠️ **响应格式不匹配**

### 4. 查看活动消息历史接口

**后端接口：**
```java
@GetMapping("/activity/history/{activityId}")
public ResponseEntity<ListMessageHistory> getActivityMessageHistory(
        @PathVariable String activityId) {
    MessageHistoryRequest historyRequest = new MessageHistoryRequest();
    historyRequest.setReceiveId(Integer.valueOf(activityId));
    ListMessageHistory messageHistory = messageServer.messageHistory(historyRequest);
    return ResponseEntity.ok(messageHistory);
}
```

**前端接口：**
```javascript
export const getActivityMessageHistory = async (activityId, params) => {
  const response = await request.get(`/api/messages/activity/history/${activityId}`, {
    params: { page: pageNum, pageSize: size }
  })
  return {
    success: true,
    message: '获取活动消息历史成功',
    result: response.data || { messageHistory: [], result: false }
  }
}
```

**匹配状态：** ⚠️ **响应格式不匹配**

## 🔄 数据格式兼容性分析

### 后端DTO结构分析

#### 1. RecallMessageRequest（预期）
```java
public class RecallMessageRequest {
    private String messageId;        // 消息ID
    private String senderId;         // 发送者ID
    private String receiverId;       // 接收者ID
    private String sentAt;          // 发送时间
    // 其他必要字段...
}
```

#### 2. MessageSendDTO（预期）
```java
public class MessageSendDTO {
    private String content;         // 消息内容
    private Integer senderId;       // 发送者ID
    private Integer receiverId;     // 接收者ID
    private String type;           // 消息类型
    private String sentAt;         // 发送时间
    // 其他必要字段...
}
```

#### 3. ListMessageHistory（预期）
```java
public class ListMessageHistory {
    private List<Message> messageHistory;  // 消息历史列表
    private Boolean result;                 // 操作结果
    private Integer total;                  // 总数量
    private Integer page;                   // 当前页码
    private Integer pageSize;               // 页面大小
}
```

### 前端发送的数据格式

#### 1. 撤回消息请求
```javascript
// 前端发送
{ messageId: messageId }

// 后端RecallMessageRequest期望
{
  messageId: "消息ID",
  senderId: "发送者ID",
  receiverId: "接收者ID", 
  sentAt: "发送时间"
}
```

#### 2. 发送消息请求
```javascript
// 前端转换后数据
{
  senderId: messageData.senderId,
  senderName: messageData.senderName,
  receiverId: messageData.receiverId,
  receiverType: messageData.receiverType,
  content: messageData.content,
  type: messageData.type || 'text'
}

// 后端MessageSendDTO期望
{
  content: "消息内容",
  senderId: 123,
  receiverId: 456,
  type: "text",
  sentAt: "2025-01-03T10:00:00Z"
}
```

### 响应格式兼容性

**后端响应：**
```java
// 成功响应（字符串）
ResponseEntity.ok("消息撤回成功")

// 失败响应（字符串）
ResponseEntity.badRequest().body("撤回失败：" + e.getMessage())

// 历史消息响应（对象）
ResponseEntity.ok(ListMessageHistory)
```

**前端期望响应：**
```javascript
// 统一格式
{
  success: true,
  message: '操作成功',
  result: { /* 具体数据 */ }
}
```

## 🛠️ 修复方案

### 1. 统一响应格式处理

修改前端messages.js中的响应处理逻辑，支持字符串和对象两种响应格式：

```javascript
// 处理字符串响应
if (typeof response === 'string') {
  return {
    success: response.includes('成功'),
    message: response,
    result: {}
  }
}

// 处理对象响应
if (response && typeof response === 'object') {
  return {
    success: true,
    message: '操作成功',
    result: response
  }
}
```

### 2. 修正撤回消息请求格式

```javascript
export const recallMessage = async (messageData) => {
  // 构建完整的撤回请求
  const recallRequest = {
    messageId: messageData.messageId,
    senderId: messageData.senderId,
    receiverId: messageData.receiverId,
    sentAt: messageData.sentAt
  }
  
  const response = await request.post('/api/messages/recall', recallRequest)
  // ... 响应处理
}
```

### 3. 增强数据转换函数

```javascript
export const convertToRecallMessageRequest = (messageData) => {
  return {
    messageId: messageData.messageId,
    senderId: messageData.senderId,
    receiverId: messageData.receiverId,
    sentAt: messageData.sentAt || new Date().toISOString()
  }
}
```

### 4. 处理历史消息响应格式

```javascript
// 处理ListMessageHistory响应
if (response && response.messageHistory) {
  return {
    success: true,
    message: '获取消息历史成功',
    result: {
      messageHistory: response.messageHistory,
      total: response.total || response.messageHistory.length,
      page: response.page || 1,
      pageSize: response.pageSize || 20
    }
  }
}
```

## 🧪 联调测试建议

### 1. 撤回消息测试

```javascript
// 测试撤回消息
const recallData = {
  messageId: 'msg_123456',
  senderId: 'user_001',
  receiverId: 'user_002',
  sentAt: '2025-01-03T10:00:00Z'
}

const result = await recallMessage(recallData)
console.log('撤回结果:', result)
```

### 2. 发送消息测试

```javascript
// 测试发送消息
const messageData = {
  senderId: 123,
  receiverId: 456,
  content: '这是一条测试消息',
  type: 'text'
}

const result = await sendMessage(messageData)
console.log('发送结果:', result)
```

### 3. 获取消息历史测试

```javascript
// 测试获取个人消息历史
const historyParams = {
  receiveId: '123',
  page: 1,
  pageSize: 20
}

const result = await getMessageHistory(historyParams)
console.log('消息历史:', result)
```

## 📝 检查清单

### 前端检查项
- [ ] 修改撤回消息请求格式，包含完整字段
- [ ] 统一响应格式处理，支持字符串和对象响应
- [ ] 增强数据转换函数，确保字段匹配
- [ ] 处理历史消息的复杂响应结构

### 后端检查项
- [ ] 确认RecallMessageRequest的具体字段要求
- [ ] 确认MessageSendDTO的完整字段定义
- [ ] 确认ListMessageHistory的响应结构
- [ ] 验证分页参数的处理逻辑

### 联调测试项
- [ ] 测试撤回消息功能的完整流程
- [ ] 测试发送消息功能的参数传递
- [ ] 测试个人消息历史的获取和分页
- [ ] 测试活动消息历史的获取和分页
- [ ] 验证错误处理和异常情况

## 🚀 建议实施步骤

1. **修复响应格式处理** - 统一处理字符串和对象响应
2. **修正撤回消息请求** - 补充必要的请求字段
3. **增强数据转换** - 完善DTO转换函数
4. **处理复杂响应** - 适配历史消息的响应结构
5. **全面测试** - 验证所有接口的完整功能

通过以上修复，Message模块的前后端接口将实现完全兼容，确保消息功能的正常运行。