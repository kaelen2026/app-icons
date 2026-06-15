---
name: app-icons-workflow
description: App Icons 项目专用开发 SOP。用户要求分析、实现、修复、重构、测试、调整 UI、导出平台、保存设计、发布前检查或修改本仓库代码/文档时都应使用；先按 GitFlow 和项目文档建立上下文，再根据变更类型选择架构边界、测试层级和质量门槛。
---

# App Icons 项目工作流

用于在 `kaelen/app-icons` 仓库内做分析、代码、文档、测试、UI、导出、保存设计、重构和发布前工作。这个项目是浏览器-only 的 Next.js 图标生成器，核心风险不在“能不能写出功能”，而在是否破坏状态模型、Canvas 渲染边界、导出注册表、设计系统和本地质量门槛。

## 0. 先确认工作区

在任何代码或文档改动前：

```sh
git branch --show-current
git status --short
```

- 如果在 `main`，先读 `docs/gitflow.md`，再创建短生命周期分支：`feature/*`、`fix/*`、`docs/*` 或 `chore/*`。
- 不要覆盖或回滚用户已有改动。遇到无关脏文件时忽略；遇到相关脏文件时先读懂再合并自己的改动。
- PR 目标分支是 `dev`，不是 `main`。

## 1. 必读文档路由

始终先读：

- `docs/gitflow.md`

按任务类型补读：

- 多步骤实现、跨模块变更、结构性重构：`docs/agent-workflow.md`
- UI 或交互变更：`docs/design-system.md`
- 架构、状态、模块边界、导出、保存设计：`docs/architecture.md`
- 代码结构、类型、安全边界、测试策略：`docs/coding-standards.md`
- 测试命令选择：`docs/testing.md`
- 质量门槛或发布前验证：`docs/quality.md`
- durable 架构决策：相关 `docs/adr/*.md`
- Next.js API、路由、metadata、构建约定变更：先读 `node_modules/next/dist/docs/` 下的相关指南。这个仓库的 Next 版本可能不同于模型训练记忆。

## 2. 项目不变量

做设计和实现决策时保持这些约束：

- 产品完全运行在浏览器端。不要添加 server routes、API handlers、数据库、鉴权、上传路径或服务端状态。
- `IconConfig` 是设计状态的单一来源，定义在 `src/types/icon.ts`。面板接收 `config` 和 `onChange(patch)`，不要在面板里复制保存同一字段。
- Canvas 渲染属于 `src/lib/renderIcon.ts` 及其 helper。React 组件只调度渲染和展示状态；不要把 Canvas 细节塞进组件。
- live preview 和 export 必须共享渲染路径。特殊平台差异优先建 `RenderVariant`，不要写第二套 renderer。
- 导出平台是 registry-driven。平台文件、尺寸、README、ZIP 内容、manifest/file-list 预览应从 `src/modules/exporting/lib/exportPresets.ts` 派生。
- 保存设计属于 `src/modules/saved-designs`。本地存储、解析、快照和数量限制在模块内处理。
- `src/lib/*` 和 `src/components/*` 中可能有兼容 shim；新的实现优先放到 owning module。
- 用户输入、localStorage、导入 JSON、data URL、文件上传都不可信，必须经现有 parser/schema 边界。

## 3. 变更类型 SOP

### UI / 组件 / 交互

1. 读 `docs/design-system.md`。
2. 使用 `src/app/globals.css` 中的 token 和 Tailwind 语义名；不要在组件里新增核心 UI hex 色。
3. 保持 dense terminal-studio：暗色 token surface、hairline border、紧凑 mono typography、小圆角、直接工具控件。
4. 避免装饰性营销模式：不要 hero card、gradient blob、stock illustration、浮动大卡片或宽松 dashboard 风格。
5. 保持移动端无横向溢出；固定格式元素要有稳定尺寸。
6. 交互控件保留可访问名称；测试优先用 role/name/label 查询。
7. 改组件行为时更新 component tests；影响路由、canvas、下载或移动布局时补 e2e。

常用验证：

```sh
pnpm lint:design
pnpm test:component
pnpm test:e2e
```

### `IconConfig` / 导入导出配置字段

1. 先定位字段是否属于全局设计状态；如果是，更新 `src/types/icon.ts`。
2. 同步默认值、schema/parser、localStorage persistence、import sanitizer。
3. 更新 affected panels、renderer、export/saved-design snapshot。
4. 添加 parser/default/persistence 测试和相关组件或 renderer 测试。
5. 不要用局部 React state 镜像同一 config 字段。

常用验证：

```sh
pnpm test:unit
pnpm test:component
pnpm typecheck
```

### Canvas / 渲染 / 平台安全区

1. 先读 `docs/adr/0003-canvas-renderer-react-boundary.md`。
2. 优先改 `src/lib/renderVariants.ts` 或 renderer helper，而不是组件。
3. 平台 mask、safe zone、foreground scale 差异优先表达为 `RenderVariant`。
4. 保证 live preview 和 offscreen export 走同一渲染核心。
5. 为变体行为添加 unit tests；需要真实浏览器 canvas smoke 时跑 e2e。

### 导出平台 / ZIP / README / ICO

1. 先读 `docs/adr/0002-registry-driven-platform-exports.md` 和 `docs/adr/0004-export-config-snapshot.md`。
2. 新平台先改 registry：`src/modules/exporting/lib/exportPresets.ts`。
3. ZIP、file-list preview、README、metadata 应从 registry 派生，避免在 `ExportPanel` 写平台分支。
4. 多尺寸 bundle 放在 focused encoder，如 `ico.ts`，不要放进组件。
5. `icon-config.json` 不应包含 `imageSrc`；需要用 `hasImage` 表达缺失图片提醒。

常用验证：

```sh
pnpm test:unit src/modules/exporting
pnpm test:component src/modules/exporting
pnpm test:e2e
```

### 保存设计 / localStorage

1. 新保存设计逻辑放进 `src/modules/saved-designs`。
2. 存储和导入数据视为不可信；解析逻辑放在 module lib。
3. hook 协调浏览器状态和 React state，组件负责 UI。
4. 覆盖 malformed data、limit、snapshot、restore、user-visible status。

### Next.js app 文件

1. 先读 `node_modules/next/dist/docs/` 中与 App Router、metadata、route segment 或 build 相关的文档。
2. 保持 browser-only 边界。`src/app/page.tsx` 是 `ssr: false` dynamic wrapper，用来让 studio 初始化时读取持久化状态。
3. 不要为了小功能新增 server-only 依赖、API route 或 build-time 浏览器 API 引用。

## 4. 多步骤工作流

当任务跨模块、跨文件、改变行为面或属于结构性重构：

1. 读 `docs/agent-workflow.md`。
2. 写短计划，明确边界、测试和回滚风险。
3. 尽量把实现拆成可独立 review 的任务。
4. 主 agent 负责集成、验证和最终报告；coding subagent 做 scoped implementation；review subagent 做独立审查。
5. 写代码的 subagent 不应是同一任务的唯一 reviewer。
6. 先跑 focused verification，再跑 broad gate。

小型单文件修复可以直接做，但风险有意义时仍应分离实现和 review 思路。

## 5. 测试选择

根据改动面选择最小有效验证，再在完成前升级到必要门槛：

- Pure logic、parser、registry、encoder：`pnpm test:unit`
- React component、hook、accessible interaction：`pnpm test:component`
- 路由、canvas smoke、下载、移动布局：`pnpm test:e2e`
- 生产构建后的浏览器行为：`pnpm build` 后 `pnpm test:e2e:prod`
- 类型边界：`pnpm typecheck`
- UI token/design 约束：`pnpm lint:design`
- 全量本地门槛：`pnpm quality`
- 发布或依赖变更：额外跑 `pnpm audit:deps`

`pnpm quality` 包含 coverage、lint、dead-code、typecheck 和 build，耗时较长；先用 focused checks 定位问题，再跑 full gate。

## 6. 收尾检查

完成前：

```sh
git status --short
```

最终汇报要包含：

- 改了什么和为什么放在这些边界。
- 跑了哪些验证命令，以及结果。
- 没跑的高价值验证和原因。
- 是否还有用户已有改动或残余风险。

不要宣称完成，除非实现已集成、review/自检发现已处理或说明、必要验证通过，并且工作区状态已检查。
