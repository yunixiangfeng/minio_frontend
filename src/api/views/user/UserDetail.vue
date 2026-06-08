<template>
  <div>
    <el-card v-loading="loading">
      <h3 style="margin-bottom: 16px">个人信息</h3>

      <template v-if="info.name">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="用户名">{{ info.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ info.email || '--' }}</el-descriptions-item>
          <el-descriptions-item label="用户标识">
            <el-text type="info" style="font-size: 12px; word-break: break-all">{{ identity }}</el-text>
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <el-empty v-else-if="!loading" description="暂未获取到用户信息">
        <el-button type="primary" @click="$router.push('/login')">重新登录</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userDetail } from '@/api/user'
import { ElMessage } from 'element-plus'

const info = ref({})
const loading = ref(true)
const identity = ref('')

/**
 * 获取用户 identity：优先从 localStorage 缓存读取（登录时写入），
 * 兜底从 JWT token payload 解析
 */
const getIdentity = () => {
  // 优先读登录时缓存的值
  const cached = localStorage.getItem('user_identity')
  if (cached) return cached

  // 兜底：解析 JWT payload
  try {
    const token = localStorage.getItem('token')
    if (!token) return ''
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(base64))
    return json.Identity || json.identity || ''
  } catch {
    return ''
  }
}

onMounted(async () => {
  loading.value = true
  try {
    identity.value = getIdentity()
    if (!identity.value) {
      ElMessage.warning('未找到用户信息，请重新登录')
      return
    }
    const res = await userDetail(identity.value)
    info.value = res || {}
  } catch (err) {
    ElMessage.error('获取用户信息失败：' + (err?.response?.data?.message || err?.message || ''))
  } finally {
    loading.value = false
  }
})
</script>
