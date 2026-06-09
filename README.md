# EduLab - 轻量级线下教培综合管理系统

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

## 项目简介

EduLab 是一款面向中小型线下教培机构的轻量化综合管理平台，专注解决学员、课程、排课、教师、薪资五大核心业务的管理需求。

### 核心特性

- 轻量化架构，内存占用低（<1000MB）
- 学员管理、课程排课、教师档案、薪资自动核算
- 前后端分离，界面简洁易用
- MySQL 稳定存储
- Docker 容器化，一键部署
- 支持 Windows / Linux 跨平台运行

## 技术栈

### 前端
- Vue3 + Vite + TypeScript
- Element Plus UI 组件库
- Pinia 状态管理
- Axios HTTP 客户端

### 后端
- Node.js + Express
- MySQL 8.0+
- Sequelize ORM
- JWT 身份认证

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- Docker & Docker Compose (可选)

### 方式一：Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/edulab.git
cd edulab

# 2. 配置环境变量
export DB_PASSWORD=your_secure_password
export JWT_SECRET=your_jwt_secret

# 3. 启动服务
docker-compose up -d

# 4. 访问系统
# 前端: http://localhost:8088
# 默认账号: admin / admin123
```

### 方式二：本地开发

```bash
# 1. 克隆项目
git clone https://github.com/your-repo/edulab.git
cd edulab

# 2. 安装依赖
npm install

# 3. 配置数据库
# 创建 MySQL 数据库: edulab
# 设置环境变量或修改 .env 文件

# 4. 初始化数据库（首次运行）
npm run db:sync

# 5. 启动开发服务器
npm run dev

# 访问 http://localhost:5173
# API 服务: http://localhost:8088
```

## 功能模块

### 1. 学员管理
- 学员档案管理（姓名、联系方式、年龄、年级、状态）
- 报名、续费、缴费记录
- 学员上课签到
- 数据检索、筛选、导出

### 2. 课程与排课
- 课程信息管理（科目、课时、费用）
- 教室管理
- 按周/按月排课
- 教师/学员双视角课表
- 排课冲突检测

### 3. 教师管理
- 教师档案（基本信息、科目、底薪、课时费）
- 授课记录与课时统计
- 权限控制（教师只读自身数据）

### 4. 薪资管理
- 薪资规则配置
- 按月自动核算薪资
- 薪资明细、结算状态管理
- 导出 Excel 工资表

### 5. 数据看板
- 学员总数、教师数、今日课程、当月薪资概览

### 6. 系统管理
- 账号权限（管理员/教师）
- 密码修改
- 数据备份
- 操作日志

## 项目结构

```
edulab/
├── LICENSE                 Apache-2.0 协议
├── README.md               项目说明
├── docker-compose.yml      Docker 部署
├── Dockerfile              构建脚本
├── frontend/               前端源码
│   ├── src/
│   │   ├── api/           API 请求
│   │   ├── pages/          页面组件
│   │   ├── stores/         状态管理
│   │   └── router/         路由配置
│   └── package.json
├── api/                    后端源码
│   ├── config/             配置文件
│   ├── models/             数据模型
│   ├── routes/             路由定义
│   ├── middlewares/         中间件
│   └── server.ts           服务入口
└── package.json            根配置文件
```

## API 文档

API 前缀: `/api/v1/`

| 模块 | 路由 | 说明 |
|------|------|------|
| 认证 | /api/v1/auth | 登录、登出、密码修改 |
| 学员 | /api/v1/students | 学员 CRUD |
| 课程 | /api/v1/courses | 课程 CRUD |
| 教室 | /api/v1/classrooms | 教室 CRUD |
| 排课 | /api/v1/schedules | 排课管理 |
| 教师 | /api/v1/teachers | 教师 CRUD |
| 薪资 | /api/v1/salarys | 薪资核算 |
| 签到 | /api/v1/signins | 签到管理 |
| 系统 | /api/v1/system | 看板、日志、备份 |

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

## 开源协议

本项目采用 [Apache License 2.0](LICENSE) 开源协议。

- 允许商用
- 可修改、可闭源分发
- 需要保留版权声明

## 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Express.js](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
