<template>
  <div>
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px">
      <h3 style="margin: 0">我的分享</h3>
      <el-button type="danger" plain size="small" @click="clearAll" :disabled="shareHistory.length === 0">
        清空记录
      </el-button>
    </div>

    <el-empty v-if="shareHistory.length === 0" description="暂无分享记录，在文件管理页面点击「分享」按钮创建" />

    <el-table v-else :data="shareHistory" border>
      <el-table-column prop="name" label="文件名" min-width="160" show-overflow-tooltip />
      <el-table-column label="分享链接" min-width="280">
        <template #default="scope">
          <el-link type="primary" :href="scope.row.url" target="_blank" style="word-break: break-all">
            {{ scope.row.url }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="有效期" width="120">
        <template #default="scope">
          <el-tag :type="isExpired(scope.row.expiredAt) ? 'danger' : 'success'" size="small">
            {{ isExpired(scope.row.expiredAt) ? '已过期' : '有效' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="scope">{{ scope.row.createdAt }}</template>
      </el-table-column>
      <el-table-column label="操作" width="140">
        <template #default="scope">
          <el-button link @click="copyLink(scope.row.url)">复制链接</el-button>
          <el-button link type="danger" @click="removeItem(scope.row.identity)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-alert
      type="info"
      :closable="false"
      style="margin-top: 16px"
      title="分享链接在文件管理页面点击分享按钮创建，链接有效期为 24 小时。"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const STORAGE_KEY = 'minio_share_history'

const shareHistory = ref([])

onMounted(() => {
  loadHistory()
})

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    shareHistory.value = raw ? JSON.parse(raw) : []
  } catch {
    shareHistory.value = []
  }
}

const isExpired = (expiredAt) => {
  if (!expiredAt) return false
  return new Date(expiredAt) < new Date()
}

const copyLink = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制到剪贴板')
  } catch {
    ElMessage.warning('复制失败，请手动复制')
  }
}

const removeItem = (identity) => {
  shareHistory.value = shareHistory.value.filter(item => item.identity !== identity)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shareHistory.value))
  ElMessage.success('已删除')
}

const clearAll = async () => {
  await ElMessageBox.confirm('确定清空所有分享记录吗？', '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).catch(() => null)
  shareHistory.value = []
  localStorage.removeItem(STORAGE_KEY)
  ElMessage.success('已清空')
}
</script>
