<template>
  <div class="login">
    <el-card style="width: 400px; margin: 100px auto">
      <h2 style="text-align: center; margin-bottom: 20px">MinIO 云盘登录</h2>
      <el-form @submit.prevent="handleLogin">
        <el-form-item>
          <el-input v-model="form.name" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" style="width:100%" :loading="loading">登录</el-button>
        </el-form-item>
        <div style="text-align: center">
          <el-button link @click="$router.push('/register')">去注册</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userLogin } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ name: '', password: '' })
const loading = ref(false)

/**
 * 从 JWT token 中解析 payload，获取用户 identity
 * 后端 UserClaim 结构体字段为 Identity（大写），dgrijalva/jwt-go 默认序列化为大写
 */
const parseTokenIdentity = (token) => {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = JSON.parse(atob(base64))
    return json.Identity || json.identity || ''
  } catch {
    return ''
  }
}

const handleLogin = async () => {
  if (!form.value.name || !form.value.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }
  loading.value = true
  try {
    const res = await userLogin(form.value)
    const token = res?.token
    if (!token) throw new Error('服务器未返回 token')
    localStorage.setItem('token', token)
    if (res?.refresh_token) {
      localStorage.setItem('refresh_token', res.refresh_token)
    }
    // 解析并缓存 identity，供个人中心等页面使用
    const identity = parseTokenIdentity(token)
    if (identity) localStorage.setItem('user_identity', identity)

    ElMessage.success('登录成功')
    router.push('/')
  } catch (err) {
    ElMessage.error('登录失败：' + (err?.response?.data?.message || err?.message || '用户名或密码错误'))
  } finally {
    loading.value = false
  }
}
</script>
