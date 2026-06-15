---
name: agent-gitflow-workflow
description: 通用 agent Git 工作流 SOP。用户要求修改代码/文档、提交、开分支、准备 PR、处理脏工作区或遵守 GitFlow 时使用；先检查分支和工作区，保护用户改动，按项目分支策略提交和汇报。
---

# Agent GitFlow 工作流

用于任何有 Git 仓库的项目。目标是让 agent 在动手前知道自己站在哪个分支、哪些文件已经被用户改过、提交应该进哪个短生命周期分支，以及最终怎么清楚汇报。

## 1. 前置检查

先运行：

```sh
git branch --show-current
git status --short
git remote -v
```

如果项目有 `AGENTS.md`、`CLAUDE.md`、`docs/gitflow.md`、`CONTRIBUTING.md` 或类似文件，先读其中的分支和提交规则。

## 2. 分支策略

按项目规则执行；没有项目规则时采用保守默认：

- 不直接在 `main` 或 `master` 上做功能、修复、文档或维护提交。
- 新建短分支：`feature/*`、`fix/*`、`docs/*`、`chore/*`。
- 如果项目有 `dev` 或 `develop` 集成分支，PR 通常指向集成分支而不是 release 分支。
- 不擅自 rebase、reset、force push 或改写用户历史。

示例：

```sh
git switch -c docs/update-agent-workflow
```

## 3. 脏工作区处理

把已有改动视为用户改动：

- 无关改动：不要碰，不要格式化，不要暂存。
- 相关改动：先读懂，再在其基础上增量修改。
- 冲突或含义不明：停下来说明具体文件和风险，再问用户。
- 永远不要用 `git reset --hard`、`git checkout -- <file>`、`git clean` 清理用户改动，除非用户明确要求。

提交前只暂存本次工作涉及文件：

```sh
git add path/to/changed-file
git diff --staged
```

## 4. 提交前验证

先根据改动面跑 focused checks，再跑项目要求的 gate：

- 文档：Markdown lint、链接检查或项目文档检查。
- 代码：相关 unit/component tests、typecheck、lint。
- UI：组件测试、视觉/浏览器 smoke、设计 lint。
- 发布或依赖：full quality gate 和 audit。

不要把验证失败的代码提交，除非用户明确要求记录失败状态；这种情况下提交信息和最终汇报要说明失败。

## 5. 提交规范

优先遵守项目 commitlint 或贡献指南。没有规则时用 Conventional Commits：

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `test: ...`
- `refactor: ...`
- `chore: ...`

提交前确认：

```sh
git status --short
git diff --staged --stat
```

提交后确认：

```sh
git status --short --branch
git log -1 --oneline
```

## 6. 最终汇报

汇报包含：

- 分支名和 commit hash。
- 变更范围。
- 已运行验证及结果。
- 未运行但有价值的验证及原因。
- 工作区是否干净；如不干净，说明剩余文件是否属于用户或本次任务。
