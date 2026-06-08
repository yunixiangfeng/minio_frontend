<template>
  <div>
    <el-card>
      <h3>个人信息</h3>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ info.name }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ info.email }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userDetail } from '@/api/user'

const info = ref({})
onMounted(async () => {
  info.value = await userDetail()
})
</script>