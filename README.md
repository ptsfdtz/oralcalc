# 小学计算题生成器

小学计算题生成器（前端版），支持本地配置持久化、PDF 预览与打印导出。

## 本地开发

- 安装依赖：`pnpm install`
- 启动开发：`pnpm dev`
- 构建产物：`pnpm build`

## 部署

- GitHub Pages：使用 `.github/workflows/deploy-pages.yml`
- Cloudflare（Wrangler）：已提供 `wrangler.toml`，构建后可直接执行 `npx wrangler deploy`
