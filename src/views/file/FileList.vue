<template>
  <div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 15px">
      <div>
        <el-button type="primary" @click="openUpload">上传文件</el-button>
        <el-button @click="handleCreateFolder">新建文件夹</el-button>
      </div>
    </div>

    <UploadFile
      v-if="showUpload"
      @success="loadList"
      @close="showUpload = false"
    />

    <el-table :data="list" border>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="ext" label="类型" />
      <el-table-column prop="size" label="大小" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link @click="handleRename(scope.row)">重命名</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
          <el-button link @click="handleShare(scope.row)">分享</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userFileList, createFolder, deleteFile, updateFileName } from '@/api/file'
import { createShare } from '@/api/share'
import UploadFile from '@/components/UploadFile.vue'
import { ElMessage, ElPrompt } from 'element-plus'

const list = ref([])
const showUpload = ref(false)

const loadList = async () => {
  const res = await userFileList({ id: 0, page: 1, size: 100 })
  list.value = res.list || []
}

const openUpload = () => (showUpload.value = true)

// 重命名方法，避免与接口名冲突
const handleCreateFolder = async () => {
  const name = await ElPrompt('请输入文件夹名称')
  if (!name) return
  await createFolder({ parent_id: 0, name })
  ElMessage.success('创建成功')
  loadList()
}

const handleDelete = async (row) => {
  await deleteFile({ identity: row.identity })
  ElMessage.success('删除成功')
  loadList()
}

const handleShare = async (row) => {
  await createShare({
    user_repository_identity: row.identity,
    expired_time: 86400
  })
  ElMessage.success('分享已创建')
}

const handleRename = async (row) => {
  const name = await ElPrompt('新名称', row.name)
  if (!name) return
  await updateFileName({ identity: row.identity, name })
  loadList()
}

onMounted(loadList)
</script>