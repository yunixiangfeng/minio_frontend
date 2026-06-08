<template>
  <div class="register">
    <el-card style="width: 420px; margin: 100px auto">
      <h2 style="text-align: center; margin-bottom: 20px">注册账号</h2>
      <el-form @submit.prevent="submit">
        <el-form-item>
          <el-input v-model="form.name" placeholder="用户名" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.email" placeholder="邮箱" type="email" />
        </el-form-item>
        <el-form-item>
          <div style="display: flex; gap: 10px">
            <el-input v-model="form.code" placeholder="验证码" style="flex:1" />
            <el-button @click="sendCode" :loading="sending" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item>
          <el-input v-model="form.password" type="password" placeholder="密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" style="width:100%" :loading="submitting">
            注册
          </el-button>
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
const sending = ref(false)
const submitting = ref(false)
const countdown = ref(0)

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
}

const sendCode = async () => {
  if (!form.value.email) {
    ElMessage.warning('请先填写邮箱')
    return
  }
  sending.value = true
  try {
    await sendMailCode({ email: form.value.email })
    ElMessage.success('验证码已发送，请查收邮件')
    startCountdown()
  } catch (err) {
    ElMessage.error('发送失败：' + (err?.response?.data?.message || err?.message || '请检查邮箱是否正确'))
  } finally {
    sending.value = false
  }
}

const submit = async () => {
  if (!form.value.name || !form.value.email || !form.value.code || !form.value.password) {
    ElMessage.warning('请填写完整信息')
    return
  }
  submitting.value = true
  try {
    await userRegister(form.value)
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (err) {
    ElMessage.error('注册失败：' + (err?.response?.data?.message || err?.message || '请检查验证码是否正确'))
  } finally {
    submitting.value = false
  }
}
</script>
