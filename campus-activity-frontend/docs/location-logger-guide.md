# 位置日志系统使用指南

## 概述

本文档介绍了校园活动平台中的位置日志系统（`locationLogger`），该系统用于统一管理位置服务相关的日志记录，提供更灵活的日志级别控制和环境适配能力。

## 日志工具位置

日志工具位于：`src/utils/logger/locationLogger.js`

## 日志级别

系统支持以下日志级别（由低到高）：

- **debug**: 详细开发信息，仅在开发环境显示
- **info**: 一般信息，用于跟踪流程
- **warn**: 警告信息，表示潜在问题
- **error**: 错误信息，表示已发生的错误
- **trace**: 详细的调用堆栈信息，用于调试

## 基本使用方法

### 1. 导入日志工具

在需要使用日志的文件中导入：

```javascript
import { locationLogger } from '@/utils/logger/locationLogger'
```

### 2. 记录不同级别的日志

```javascript
// 调试信息
locationLogger.debug('位置初始化开始')

// 一般信息
locationLogger.info('位置数据已更新')

// 警告信息
locationLogger.warn('位置精度低于预期')

// 错误信息
locationLogger.error('获取位置失败', error)

// 跟踪信息
locationLogger.trace('详细的位置处理流程')
```

### 3. 日志上下文

可以传递额外的上下文对象来丰富日志信息：

```javascript
locationLogger.info('位置更新', { 
  latitude: 39.9042, 
  longitude: 116.4074,
  accuracy: 10 
})
```

## 环境适配

日志系统会根据当前环境自动调整日志输出行为：

- **开发环境**：显示所有级别的日志，包括debug级别
- **测试环境**：显示info及以上级别的日志
- **生产环境**：仅显示warn和error级别的日志，保护用户隐私

## 集成示例

### 在位置工具中使用

```javascript
// src/utils/location.js 中的使用示例
import { locationLogger } from '@/utils/logger/locationLogger'

export const getCurrentPosition = async () => {
  locationLogger.debug('开始获取当前位置')
  try {
    // 位置获取逻辑
    locationLogger.info('位置获取成功')
    return position
  } catch (error) {
    locationLogger.error('获取位置失败', error)
    throw error
  }
}
```

### 在Vuex Store中使用

```javascript
// src/stores/location.js 中的使用示例
import { defineStore } from 'pinia'
import { locationLogger } from '@/utils/logger/locationLogger'

export const useLocationStore = defineStore('location', {
  actions: {
    async initializeLocationService() {
      locationLogger.debug('初始化位置服务')
      try {
        // 初始化逻辑
        locationLogger.info('位置服务初始化完成')
      } catch (error) {
        locationLogger.error('初始化位置服务失败', error)
      }
    }
  }
})
```

## 最佳实践

1. **使用适当的日志级别**：根据信息重要性选择合适的级别
2. **提供有意义的消息**：日志消息应清晰描述发生了什么
3. **错误时包含异常对象**：使用第二个参数传递错误对象以获取完整堆栈
4. **避免记录敏感信息**：特别是在生产环境中，不要记录用户隐私数据
5. **保持一致性**：在整个位置服务模块中使用相同的日志风格

## 配置和扩展

### 修改日志级别

可以在`locationLogger.js`文件中修改`LOG_LEVEL`常量来调整默认日志级别：

```javascript
// 修改为所需的最低日志级别
const LOG_LEVEL = 'info' // 可选值: 'debug', 'info', 'warn', 'error', 'trace'
```

### 添加自定义日志处理器

如需将日志发送到远程服务器或其他目标，可以扩展`createLogger`函数中的处理器：

```javascript
// 示例：添加远程日志发送功能
const remoteLogger = (level, message, data) => {
  if (level >= LOG_LEVEL && import.meta.env.PROD) {
    // 发送日志到远程服务器
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, data, timestamp: new Date() })
    })
  }
}

// 在createLogger中添加此处理器
```

## 注意事项

1. 开发环境下，所有日志都会打印到控制台
2. 生产环境下，debug和info级别的日志会被自动过滤
3. 当需要调试特定功能时，可以临时使用trace级别获取更详细信息
4. 确保在生产发布前检查日志内容，避免泄露敏感信息