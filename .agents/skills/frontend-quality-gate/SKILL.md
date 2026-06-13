---
name: frontend-quality-gate
description: 前端项目质量门槛 SOP。用户要求完成、验证、修复 CI、发布前检查、跑测试、改 UI 后确认可用、或不知道该跑哪些命令时使用；按改动面选择 focused checks，再升级到 lint/typecheck/build/e2e/full quality gate。
---

# 前端质量门槛

用于 React、Next.js、Vite、Expo Web 或类似前端项目。目标是用最小有效验证快速定位问题，再在完成前跑足够广的门槛。

## 1. 先发现项目命令

优先读：

- `package.json`
- `README.md`
- `AGENTS.md` / `CLAUDE.md`
- `docs/testing.md`
- `docs/quality.md`
- CI 配置：`.github/workflows/*`、`.circleci/config.yml` 等

从 `package.json` 提取真实脚本名，不要凭记忆假设项目有 `npm test`、`pnpm build` 或 `next build`。

## 2. 选择 focused checks

按改动面选择：

- Pure logic、parser、formatter、registry：unit tests。
- Component、hook、form、accessibility：component tests 或 Testing Library tests。
- Route、navigation、auth/session shell、download/upload、browser API：e2e or browser smoke。
- Styling、tokens、responsive layout：design lint、component tests、browser screenshot/smoke。
- Type contracts、schema、public exports：typecheck。
- Dependency or build config：install check、typecheck、build、targeted CI command。

先跑最接近改动的命令，失败时定位并修复，再扩大范围。

## 3. 常见命令映射

根据项目实际包管理器替换 `pnpm`：

```sh
pnpm test
pnpm test:unit
pnpm test:component
pnpm test:e2e
pnpm lint
pnpm typecheck
pnpm build
pnpm quality
```

如果项目没有聚合脚本，就用 CI 中的命令组合。

## 4. UI 变更验证

UI 改动不要只跑静态检查：

1. 跑相关 component tests。
2. 启动 dev server 或 production preview。
3. 用浏览器打开相关页面。
4. 检查主要 viewport，至少包含桌面和移动宽度。
5. 验证交互、焦点、错误状态、loading/disabled 状态和文本不溢出。
6. 如果有 canvas、video、image、map、chart 或 3D，做像素/截图层面的非空检查。

## 5. 失败处理

按层级处理，不要跳到大范围重写：

- Lint/format：先看规则指向的文件和具体行。
- Typecheck：修正边界类型，避免 `any`、双重断言或关闭 strict。
- Unit failure：定位输入、输出和边界条件。
- Component failure：确认 accessible name、role、state wiring 和 async timing。
- E2E failure：区分 app bug、test selector、server readiness、browser environment。
- Build failure：检查 server/client boundary、dynamic import、metadata、environment variables。

修复后先重跑失败命令，再跑上一级门槛。

## 6. 完成门槛

通常完成前至少跑：

```sh
pnpm lint
pnpm typecheck
pnpm build
```

行为改动还应跑相关 tests。发布、部署或大重构前跑项目 full quality gate 和 e2e。

最终汇报写清：

- 跑了哪些命令。
- 哪些通过。
- 哪些没跑以及原因。
- 是否有残余风险，例如浏览器验证未覆盖某设备。
