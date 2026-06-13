---
name: single-source-ui-state
description: 单一 UI 状态源 SOP。用户要求修改编辑器/配置器/表单/设计工具状态、添加配置字段、修复状态不同步、导入导出配置、localStorage 持久化或撤销重做时使用；统一 domain state、默认值、schema、parser、持久化、UI 和测试。
---

# 单一 UI 状态源

适用于编辑器、生成器、配置器、复杂表单和设计工具。核心原则：一个 domain state 是事实来源，UI 组件显示它、通过 patch/update 请求修改它，不在多个地方保存同一业务字段。

## 1. 先定位事实来源

查找：

- domain state 类型或 schema：如 `Config`、`FormState`、`EditorState`。
- 默认值：`defaultConfig`、`initialState`、schema defaults。
- parser/sanitizer：导入 JSON、URL state、localStorage、server payload。
- 持久化：localStorage、IndexedDB、query params、draft storage。
- 导出/分享：download JSON、ZIP metadata、share URL。
- history：undo/redo、autosave、reset。

在动手前写清字段应该归属哪里。如果字段影响生成结果、导出结果或可恢复设计，它通常属于 domain state，而不是组件局部 state。

## 2. 组件边界

推荐模式：

```ts
type PanelProps = {
  config: Config;
  onChange: (patch: Partial<Config>) => void;
};
```

组件可以有局部 state，但只用于短暂 UI 体验：

- 搜索词
- 临时错误消息
- open/closed 状态
- hover/focus affordance
- 未提交的文本输入草稿

不要用局部 state 镜像 domain 字段，否则会产生 reset、import、undo、autosave 和 export 不一致。

## 3. 添加或修改字段清单

新增 domain 字段时同步更新：

- 类型或 schema。
- 默认值。
- parser/sanitizer。
- persistence read/write。
- import/export/share snapshot。
- reset/preset/example data。
- undo/redo 或 history 合并逻辑。
- 相关 UI controls。
- 渲染、计算或输出逻辑。
- 测试。

删除字段时还要考虑旧数据迁移或忽略策略。

## 4. 信任边界

这些输入都不可信：

- localStorage
- imported JSON
- URL params
- uploaded files
- pasted text
- data URLs
- server payloads

用 `unknown` 接收，在 parser 里检查 shape、literal values、number range、string length 和 nullable behavior。parser 通过后再产生 typed state。

## 5. 测试策略

最小测试集：

- 默认状态包含字段且值合法。
- parser 接受合法输入。
- parser 拒绝或修正 malformed input。
- persistence round trip。
- import/export snapshot 与隐私/尺寸策略一致。
- UI 控件改变字段。
- reset/preset/history 不丢字段。

如果字段影响渲染或输出，增加 renderer/output tests。

## 6. 反模式

避免：

- 同一字段同时存在于 parent state、panel state 和 storage state。
- 为了让 TypeScript 通过而使用 `as any` 或非空断言绕过 parser。
- UI 直接解析 imported data。
- renderer 或 exporter 读取 DOM 控件值。
- 默认值和 parser fallback 不一致。

完成时确认：从任一入口进入的状态，最终都能被同一 parser/default path 规范化。
