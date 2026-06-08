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
          <el-button type="primary" native-type="submit" block>登录</el-button>
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

const handleLogin = async () => {
  const res = await userLogin(form.value)
  localStorage.setItem('token', res.token)
  localStorage.setItem('refresh_token', res.refresh_token)
  ElMessage.success('登录成功')
  router.push('/')
}
</script>