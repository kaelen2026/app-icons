---
name: registry-driven-feature
description: Registry-driven 功能扩展 SOP。用户要求新增平台、导出格式、集成、渠道、模板、预设、文件类型、菜单项或类似可枚举能力时使用；先建声明式 registry，让 UI、输出、文档和测试从 registry 派生，避免分散分支。
---

# Registry-Driven 功能扩展

适用于一组可枚举能力：导出平台、支付 provider、第三方集成、文件格式、模板、预设、渠道、feature flags、菜单项、生成目标等。目标是把“有哪些能力”集中成声明式数据，让 UI、输出、文档和测试从同一来源派生。

## 1. 判断是否适合 registry

适合：

- 新增项与现有项结构相似。
- UI 列表、输出文件、文档、验证规则都依赖同一组 metadata。
- 之前已经出现多个 `if platform === ...` 或 `switch kind` 分支。
- 未来还会继续增加同类项。

不适合：

- 只有一个一次性特例。
- 每个项行为完全不同，抽象会隐藏复杂度。
- registry 会包含大量 imperative callbacks，反而难以测试。

## 2. 设计 registry 形状

先定义 typed contract：

```ts
type RegistryItem = {
  id: ItemId;
  label: string;
  description?: string;
  files?: readonly OutputFile[];
  requirements?: readonly Requirement[];
  variant?: RenderVariant;
};
```

实践要点：

- `id` 用 literal union，不用随意 string。
- registry 用 `as const` 或 `satisfies` 保留字面量推断。
- metadata、路径、尺寸、文案、约束放 registry。
- 复杂编码或副作用放 helper/adapter，不放组件。

## 3. 派生而不是复制

这些内容应尽量从 registry 派生：

- UI 列表、checkbox、tabs、menus。
- output file list。
- ZIP/package contents。
- README/install instructions。
- validation/readiness messages。
- tests table。
- analytics labels 或 feature identifiers。

新增一个 item 时，理想情况下只改 registry、少量 focused helper 和测试。

## 4. 边界放置

推荐边界：

- `registry.ts`: 声明式数据和类型。
- `buildOutput.ts`: 从 registry 生成输出。
- `readiness.ts`: 从 registry 生成校验/缺失项。
- `RegistryPanel.tsx`: 只渲染派生 UI 和用户选择。
- `__tests__/registry.test.ts`: 覆盖完整性和派生结果。

组件不要 hard-code 某个 item 的文件名、尺寸或说明，除非是无法抽象的真实 UI affordance。

## 5. 测试策略

覆盖：

- registry ids 唯一。
- 每个 item 必填 metadata 完整。
- UI 展示 registry 中的 item。
- output builder 为每个 selected item 生成正确结果。
- README/docs/file-list 与 output 一致。
- 新 item 不需要修改无关组件分支。

用 table-driven tests 遍历 registry，比为每个 item 手写重复测试更稳。

## 6. 反模式

避免：

- registry 有一份，UI 另有一份 hard-coded list。
- ZIP/output builder 另写一套平台分支。
- README 文案和实际文件路径分离维护。
- `switch` 分支散落在多个组件。
- 为新增项引入全局 refactor，超过 registry 需求。

完成时确认：删除或新增一个 registry item 后，相关 UI、输出和文档不会悄悄不同步。
