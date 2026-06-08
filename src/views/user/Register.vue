<template>
  <div class="register">
    <el-card style="width: 420px; margin: 100px auto">
      <h2 style="text-align: center; margin-bottom: 20px">注册账号</h2>
      <el-form @submit.prevent="submit">
        <el-form-item>
          <el-input v-model="form.name" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.email" placeholder="邮箱" />
        </el-form-item>
        <el-form-item>
          <div style="display: flex; gap: 10px">
            <el-input v-model="form.code" placeholder="验证码" style="flex:1" />
            <el-button @click="sendCode">获取验证码</el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" block>注册</el-button>
        </el-form-item>
        <div style="text-align:center">
          <el-button link @click="$router.push('/login')">已有账号去登录</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { userRegister, sendMailCode } from '@/api/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const form = ref({ name: '', email: '', code: '', password: '' })

const sendCode = async () => {
  await sendMailCode({ email: form.value.email })
  ElMessage.success('验证码已发送')
}

const submit = async () => {
  await userRegister(form.value)
  ElMessage.success('注册成功')
  router.push('/login')
}
</script>