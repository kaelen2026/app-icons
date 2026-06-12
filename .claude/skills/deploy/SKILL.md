---
name: deploy
description: 部署项目到 Vercel。要求在 main 分支且工作区干净，先跑通本地验证门槛（lint + typecheck + build），再用 Vercel CLI 部署预览或生产环境。
---

# 部署到 Vercel

将本项目（纯客户端 Next.js 应用，pnpm）部署到 Vercel。默认部署预览环境；仅当用户明确说"生产"/"production"/"正式环境"时才加 `--prod`。

## 步骤

### 1. Git 前置检查（不满足则中止）

部署必须满足两个条件，任一不满足就停止部署并告知用户，不要替用户切分支、提交或暂存改动：

```sh
git rev-parse --abbrev-ref HEAD   # 必须输出 main
git status --porcelain            # 必须无输出（含未跟踪文件）
```

- 不在 `main` 分支：中止，提示用户先合并/切换到 `main`。
- 工作区不干净（有改动或未跟踪文件）：中止，提示用户先提交或清理。

### 2. 本地验证（必须先通过）

部署前必须跑通项目的验证门槛，任何一步失败都停下来修复，不要带病部署：

```sh
pnpm lint && pnpm typecheck && pnpm build
```

### 3. 检查 Vercel CLI 与登录状态

```sh
vercel --version || pnpm dlx vercel --version
vercel whoami
```

- CLI 不存在时，用 `pnpm dlx vercel` 代替 `vercel` 执行后续命令（不要全局安装，除非用户要求）。
- `whoami` 失败说明未登录。登录是交互式操作，提示用户在会话里输入 `! vercel login` 自行完成，然后继续。

### 4. 关联项目（首次部署）

检查是否已关联：存在 `.vercel/project.json` 即已关联，跳过本步。

未关联时运行：

```sh
vercel link --yes
```

注意：部署走 CLI 直接上传，不依赖 Vercel 的 Git 集成。

### 5. 部署

预览部署（默认）：

```sh
vercel deploy --yes
```

生产部署（仅用户明确要求时）：

```sh
vercel deploy --prod --yes
```

### 6. 验证并汇报

- 把部署输出里的 URL 完整告诉用户。
- 用 `curl -sI <url>` 确认返回 200（预览部署若开启了 Deployment Protection 可能返回 401，属正常，向用户说明即可）。
- 部署失败时用 `vercel inspect <url> --logs` 查看构建日志，定位原因后修复重试。

## 注意事项

- 项目是纯浏览器端应用（无 API 路由、无数据库、无环境变量依赖），正常情况下零配置即可部署，不要添加 `vercel.json`/`vercel.ts` 除非确有需要。
- Vercel 会自动识别 Next.js 框架和 pnpm（依据 `pnpm-lock.yaml`），不要手动覆盖 build 命令。
- 不要在部署过程中提交代码或修改项目文件。
