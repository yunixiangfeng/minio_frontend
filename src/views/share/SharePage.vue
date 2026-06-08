<template>
  <div style="max-width: 600px; margin: 50px auto">
    <el-card>
      <h3>分享文件</h3>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="文件名">{{ info.name }}</el-descriptions-item>
        <el-descriptions-item label="大小">{{ info.size }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 15px">
        <el-button type="primary" @click="saveToMy">保存到我的网盘</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { shareDetail, saveShare } from '@/api/share'
import { ElMessage } from 'element-plus'

const route = useRoute()
const info = ref({})

onMounted(async () => {
  const res = await shareDetail({ identity: route.params.id })
  info.value = res
})

const saveToMy = async () => {
  await saveShare({
    repositoryIdentity: info.value.repository_identity,
    parentId: 0
  })
  ElMessage.success('已保存到你的文件列表')
}
</script>