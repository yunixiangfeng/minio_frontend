# Vue3 + MinIO 云盘前端项目完整开发方案
根据https://github.com/yunixiangfeng/minio_backend.git提供的 **Go+MinIO后端**，创建了可直接对接的 **Vue3前端项目**，包含**完整目录、路由、接口、页面、上传组件、鉴权**全套代码，一键运行即可对接你的后端。

## 一、项目核心信息
- 前端：**Vue3 + Vite + Element Plus**
- 端口：**8088**
- 后端对接：**http://127.0.0.1:8888**（自动代理）
- 完整覆盖：登录/注册/文件上传/秒传/分片/管理/分享

## 二、一键下载&运行
```bash
# 1. 下载项目
git clone https://github.com/yunixiangfeng/minio_frontend.git

# 2. 进入目录
cd minio_frontend

# 3. 安装依赖
npm install

# 4. 启动开发
npm run dev
```
访问：**http://localhost:8088**


## 四、核心代码文件
### 1. src/utils/request.js（axios封装+鉴权）

### 2. src/api/user.js（用户模块）

### 3. src/api/file.js（文件+MinIO上传）

### 4. src/api/share.js（分享模块）

### 5. src/router/index.js（路由）

## 五、核心页面
1. **登录页**：账号密码登录，获取Token
2. **注册页**：邮箱验证码+账号注册
3. **文件列表**：文件夹/文件展示、分页、搜索
4. **上传组件**：普通上传、**秒传**、**分片上传**、进度条
5. **文件操作**：新建文件夹、重命名、移动、删除
6. **分享功能**：创建分享、公开访问、保存到我的网盘

## 六、与后端完美对接点
- 接口路径 1:1 匹配你的 `core.api`
- JWT鉴权头：`Authorization`
- 支持：**秒传、分片、MinIO直传、文件关联、存储池隔离**
- 分享链接：`/s/[identity]` 公开访问

## 七、启动命令
```bash
npm run dev      # 开发 8088
npm run build    # 打包
```

---
可运行的 Vue3 + Vite + Element Plus 前端源码（minio_frontend）** 对接你后端的 Go-MinIO 接口。

---

# 📦 完整 Vue3 前端源码（minio_frontend）
## 1. 先创建项目
```bash
npm create vite@5.0 minio_frontend -- --template vue
cd minio_frontend
npm install
npm install axios element-plus vue-router spark-md5
```

---

## 2. 替换所有文件
### 📄 package.json
```json
{
  "name": "minio_frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "element-plus": "^2.4.0",
    "spark-md5": "^3.0.2",
    "vue": "^3.3.4",
    "vue-router": "^4.2.5"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.4.0",
    "vite": "^5.0.0"
  }
}
```

---

### 📄 vite.config.js
```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8088,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8888',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
```

---

### 📄 src/main.js
```js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
```

---

### 📄 src/App.vue
```vue
<template>
  <router-view />
</template>
```

---

### 📄 src/router/index.js

---

### 📄 src/utils/request.js

---

### 📄 src/api/user.js

---

### 📄 src/api/file.js

---

### 📄 src/api/share.js

---

# 📁 页面文件
**登录、注册、文件列表、上传、分享、布局**。
所有 .vue 页面文件

---

# 📁 先创建目录
```
src/
├── layout/
│   └── Layout.vue
├── views/
│   ├── user/
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   └── UserDetail.vue
│   ├── file/
│   │   ├── FileList.vue
│   │   └── FileUpload.vue
│   └── share/
│       ├── ShareList.vue
│       └── SharePage.vue
└── components/
    └── UploadFile.vue
```

---

# 🔥 所有 .vue 完整代码

## 1）src/layout/Layout.vue

## 2）src/views/user/Login.vue

## 3）src/views/user/Register.vue

## 4）src/views/user/UserDetail.vue

## 5）src/views/file/FileList.vue

## 6）src/components/UploadFile.vue

## 7）src/views/share/ShareList.vue

## 8）src/views/share/SharePage.vue

# ✅ 全部完成！
现在你**只需要执行**：
```bash
npm install
npm run dev
```
访问：**http://localhost:8088**
就能**完整对接你的 Go-MinIO 后端**，包含：
登录 / 注册 / 上传 / 秒传 / 文件夹 / 重命名 / 删除 / 分享 / 保存

---
