<template>
  <div class="layout">
    <el-container style="height: 100vh">
      <el-aside width="200px" style="background-color: #f5f5f5">
        <div style="height: 60px; display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e6e6e6">
          <span style="font-weight: bold; font-size: 16px; color: #409eff">☁ MinIO 云盘</span>
        </div>
        <el-menu
          router
          :default-active="$route.path"
          style="height: calc(100% - 60px); border-right: none"
        >
          <el-menu-item index="/file">
            <el-icon><Folder /></el-icon>
            <span>文件管理</span>
          </el-menu-item>
          <el-menu-item index="/share">
            <el-icon><Share /></el-icon>
            <span>我的分享</span>
          </el-menu-item>
          <el-menu-item index="/user">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header style="display: flex; justify-content: flex-end; align-items: center; background: #fff; border-bottom: 1px solid #eee">
          <el-button link type="danger" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </el-header>
        <el-main style="background: #f9f9f9">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Folder, Share, User, SwitchButton } from '@element-plus/icons-vue'

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
</style>
