<template>
  <div style="max-width: 600px; margin: 50px auto">
    <el-card v-loading="loading">
      <h3 style="margin-bottom: 16px">分享文件详情</h3>

      <template v-if="info && info.repository_identity">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="文件名">{{ info.name || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ info.ext || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="大小">{{ formatSize(info.size) }}</el-descriptions-item>
        </el-descriptions>
        <div style="margin-top: 20px; display: flex; gap: 12px">
          <el-button
            v-if="isLoggedIn"
            type="primary"
            @click="saveToMy"
            :loading="saving"
          >
            保存到我的网盘
          </el-button>
          <el-button v-else @click="$router.push('/login')">登录后保存到网盘</el-button>
        </div>
      </template>

      <el-empty v-else-if="!loading" description="分享不存在或已过期" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { shareDetail, saveShare } from '@/api/share'
import { ElMessage } from 'element-plus'

const route = useRoute()
const info = ref(null)
const loading = ref(true)
const saving = ref(false)

const isLoggedIn = computed(() => !!localStorage.getItem('token'))

onMounted(async () => {
  try {
    const res = await shareDetail({ identity: route.params.id })
    // 后端返回空对象时 repository_identity 为空字符串，视为不存在
    info.value = (res && res.repository_identity) ? res : null
  } catch {
    info.value = null
  } finally {
    loading.value = false
  }
})

const saveToMy = async () => {
  saving.value = true
  try {
    // 字段名与后端 ShareBasicSaveRequest 保持一致（蛇形）
    await saveShare({
      repository_identity: info.value.repository_identity,
      parent_id: 0
    })
    ElMessage.success('已保存到你的文件列表')
  } catch (err) {
    const msg = err?.response?.data?.message || err?.message || '请确认已登录'
    ElMessage.error('保存失败：' + msg)
  } finally {
    saving.value = false
  }
}

const formatSize = (size) => {
  if (!size) return '--'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}
</script>
