<template>
  <div class="layout">
    <el-container style="height: 100vh">
      <el-aside width="200px" style="background-color: #f5f5f5">
        <el-menu
          router
          default-active="/file"
          style="height: 100%"
        >
          <el-menu-item index="/file">
            <i class="el-icon-folder-opened"></i>
            <span>文件管理</span>
          </el-menu-item>
          <el-menu-item index="/share">
            <i class="el-icon-share"></i>
            <span>文件分享</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <i class="el-icon-user"></i>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="text-align: right; background: #fff">
          <el-button link @click="logout">退出登录</el-button>
        </el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.el-header {
  line-height: 60px;
  border-bottom: 1px solid #eee;
}
</style>