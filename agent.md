# Koibito Agent Guide

## 项目技术栈（已确认）

### 前端

- **框架**: React 19 (`react`, `react-dom`)
- **语言**: TypeScript 5（严格模式开启）
- **构建工具**: Vite 7（`@vitejs/plugin-react`）
- **样式系统**: Tailwind CSS v4（`@tailwindcss/vite`）
- **UI 组件**: shadcn/ui（`radix-nova` 风格）+ Radix UI + Base UI
- **图标**: `lucide-react` + `react-icons`
- **样式辅助**: `class-variance-authority`、`clsx`、`tailwind-merge`、`tw-animate-css`

### 桌面端

- **框架**: Tauri v2
- **后端语言**: Rust 2021
- **Rust 依赖**: `tauri`, `tauri-plugin-opener`, `serde`, `serde_json`

### 工程与质量

- **包管理**: pnpm（存在 `pnpm-lock.yaml`）
- **Lint**: ESLint 9 + TypeScript ESLint + React Hooks/Refresh 插件
- **格式化**: Prettier 3
- **模块别名**: `@ -> ./src`

## 目录概览

- `src/`: React + TS 前端代码
- `src-tauri/`: Tauri + Rust 桌面端代码
- `public/`: 静态资源
- `components.json`: shadcn 配置

## 常用命令

- `pnpm dev`：启动前端开发服务器（Vite）
- `pnpm build`：TypeScript 编译检查并构建前端
- `pnpm lint`：运行 ESLint
- `pnpm format`：运行 Prettier
- `pnpm tauri dev`：启动 Tauri 桌面开发模式

## Agent 协作建议

1. 修改 UI 时优先复用 `src/components/ui/` 中已有组件。
2. 样式优先使用 Tailwind class 与 `src/index.css` 里的主题变量。
3. 新增导入路径优先使用 `@/` 别名。
4. 提交前至少执行：`pnpm lint`。
5. 涉及桌面能力时同步检查 `src-tauri/tauri.conf.json` 与 Rust 端权限/插件。

## 当前项目状态（基于扫描）

- 项目是 **React + Vite 前端** 与 **Tauri + Rust 桌面壳** 的混合应用。
- UI 方向已采用 **shadcn/ui + Tailwind v4 + 主题变量体系**。
