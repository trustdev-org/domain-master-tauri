# DomainMaster 域名管家

DomainMaster 是一个现代化的域名管理工具，专为域名投资者和网站管理员设计。它帮助您轻松追踪、管理和监控您的域名资产，提供直观的仪表盘和强大的 Whois 信息查询功能。

## ✨ 主要功能

- **📊 仪表盘概览**：实时统计域名总数、已持有、抢注中及即将过期的域名数量。
- **🔍 智能 Whois 查询**：
  - 支持一键更新 Whois 信息。
  - 提供 **结构化视图** (RDAP) 和 **原始记录** 两种查看模式。
  - 自动解析关键日期（注册日、过期日）和状态。
- **📂 便捷管理**：
  - 支持单个添加或批量导入 (.txt) 域名。
  - 本地存储 (LocalStorage) 数据持久化，无需后端数据库。
  - 右键快捷菜单，快速查看 Whois 信息。
- **⚡ 智能排序与筛选**：
  - 自定义排序逻辑：优先按域名长度、首字母、更新状态排序。
  - 按状态筛选（已拥有、抢注中、关注列表、已过期）。
  - 实时搜索功能。
- **🎨 现代化 UI**：
  - 基于 Tailwind CSS 的响应式设计。
  - 交互友好的模态框和状态徽章。
  - 防止背景滚动的模态框体验优化。

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式库**: Tailwind CSS
- **图标库**: Lucide React
- **数据存储**: LocalStorage API

## 🚀 快速开始

### 环境要求

- Node.js (推荐 v16+)
- npm 或 yarn / bun

### 安装步骤

1. **克隆项目** (如果您下载的是源码包，请解压进入目录)
   ```bash
   cd domainmaster
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者
   bun install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   浏览器访问 `http://localhost:5173` 即可使用。

## 📖 使用指南

1. **导入域名**：点击右上角的“导入”按钮，上传包含域名的 `.txt` 文件（每行一个域名）。
2. **更新信息**：点击列表上方的刷新按钮，系统将尝试获取所有域名的最新 Whois 信息。
3. **查看详情**：点击域名行或右键选择，查看详细的 Whois 数据和结构化信息。
4. **管理状态**：在详情页可以手动修改域名状态（如：改为“已拥有”或“抢注中”）。
5. **删除域名**：在列表中点击垃圾桶图标即可删除不再关注的域名。

## 📁 项目结构

```
domainmaster/
├── components/        # React 组件
│   ├── DomainList.tsx   # 域名列表与排序逻辑
│   ├── DomainModal.tsx  # 详情/编辑/Whois查看弹窗
│   ├── ImportModal.tsx  # 批量导入弹窗
│   └── ConfirmModal.tsx # 确认操作弹窗
├── services/          # 业务逻辑服务
│   ├── whoisService.ts  # RDAP/Whois 数据获取与解析
│   └── storageService.ts # LocalStorage 数据存取
├── types.ts           # TypeScript 类型定义
├── App.tsx            # 主应用入口与状态管理
└── ...
```

## 📄 许可证

本项目采用 MIT 许可证。
