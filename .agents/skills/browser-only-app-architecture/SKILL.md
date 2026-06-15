---
name: browser-only-app-architecture
description: 浏览器-only 应用架构 SOP。用户要求构建或修改纯客户端工具、静态 Web app、文件处理器、图像/配置生成器、localStorage 持久化、导入导出、隐私敏感上传或避免后端时使用；保持无服务器边界，隔离浏览器 API，验证不可信输入。
---

# 浏览器-Only 应用架构

适用于静态工具、客户端生成器、图像编辑器、配置导入导出器和隐私敏感上传应用。核心约束：用户数据留在浏览器，渲染、处理、持久化和导出都在客户端完成。

## 1. 架构边界

默认不要添加：

- API routes
- server actions
- database
- auth
- upload endpoints
- background server jobs
- server-only secrets

除非用户明确改变产品边界，否则新增功能应在浏览器内完成。

## 2. 数据流

典型 flow：

```text
user input / file / localStorage / URL
-> parser and sanitizer
-> typed client state
-> renderer or transformer
-> preview / download / local persistence
```

所有入口先过 parser，之后再进入 typed state。不要让 UI、renderer 或 exporter 直接消费 untrusted raw data。

## 3. 浏览器 API 隔离

隔离这些 API：

- `window`
- `document`
- `localStorage`
- `FileReader`
- `Blob`
- `URL.createObjectURL`
- Canvas APIs
- Clipboard APIs
- Web Workers

在 Next.js 或 SSR-capable 框架中，确保这些 API 只在 client-only path、effect、event handler 或 dynamic client wrapper 内使用。

## 4. 隐私和导出

处理用户文件时：

- 不上传，除非用户明确要求。
- 不把原始私有文件嵌入导出 metadata，除非这是产品需求。
- 导出配置时考虑 size 和 privacy；用 `hasFile`、`requiresReupload` 等 metadata 表达缺失文件。
- 下载内容在浏览器生成，清理 object URLs。

## 5. 性能约束

浏览器-only 意味着重活在客户端：

- 大文件读取要显示进度或状态。
- 生成多文件包时分批或让 UI 有 pending 状态。
- 重复计算用 memoization、worker 或缓存，但先确认瓶颈。
- Canvas/image 处理考虑尺寸上限和失败路径。

不要用后端来掩盖可以在客户端合理解决的问题，除非需求已经改变。

## 6. 测试策略

覆盖：

- malformed localStorage/import data。
- unsupported file types。
- missing browser APIs in test/build environment。
- download/export contents。
- privacy-sensitive snapshots 不包含原始私有 bytes。
- browser smoke for preview and download.

构建验证尤其重要，因为 server/client boundary 错误常在 production build 暴露。

## 7. 完成检查

完成前确认：

- 没有新增 server route、database、auth 或 secret dependency。
- Browser APIs 不会在 build-time/server path 执行。
- 所有 untrusted inputs 都被解析。
- 用户可见错误清楚，失败不会静默吞掉。
- 导出和持久化策略符合隐私边界。
