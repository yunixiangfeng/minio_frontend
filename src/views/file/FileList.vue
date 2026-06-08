<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" style="margin-bottom: 12px">
      <el-breadcrumb-item @click="goToRoot" style="cursor: pointer">
        <el-icon><HomeFilled /></el-icon> 根目录
      </el-breadcrumb-item>
      <el-breadcrumb-item
        v-for="(crumb, idx) in breadcrumbs"
        :key="crumb.identity"
        @click="goToCrumb(idx)"
        style="cursor: pointer"
      >
        {{ crumb.name }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 工具栏 -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; align-items: center">
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <el-button type="primary" :icon="Upload" @click="openUpload">上传文件</el-button>
        <el-button :icon="FolderAdd" @click="handleCreateFolder">新建文件夹</el-button>
        <el-button type="success" :icon="Download" @click="handleBatchDownload"
          :disabled="selectedRows.length === 0">
          批量下载 ({{ selectedRows.length }})
        </el-button>
      </div>
      <div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索文件名"
          clearable
          style="width: 200px"
          :prefix-icon="Search"
        />
      </div>
    </div>

    <!-- 上传弹窗 -->
    <UploadFile
      v-if="showUpload"
      :parent-id="currentFolderId"
      @success="loadList"
      @close="showUpload = false"
    />

    <!-- 文件表格 -->
    <el-table
      ref="tableRef"
      :data="filteredList"
      border
      v-loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column prop="name" label="名称" min-width="220" show-overflow-tooltip>
        <template #default="scope">
          <div style="display: flex; align-items: center; gap: 6px; cursor: pointer" @click="handleOpen(scope.row)">
            <el-icon v-if="scope.row.ext === ''" color="#e6a23c"><Folder /></el-icon>
            <el-icon v-else color="#409eff"><Document /></el-icon>
            <span>{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="ext" label="类型" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.ext" size="small">{{ scope.row.ext }}</el-tag>
          <el-tag v-else size="small" type="warning">文件夹</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="120">
        <template #default="scope">
          {{ scope.row.ext ? formatSize(scope.row.size) : '--' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320">
        <template #default="scope">
          <el-button v-if="scope.row.ext" link @click="handleDownload(scope.row)">下载</el-button>
          <el-button v-if="scope.row.ext === ''" link type="success" @click="handleFolderDownload(scope.row)">
            打包下载
          </el-button>
          <el-button link @click="handleRename(scope.row)">重命名</el-button>
          <el-button v-if="scope.row.ext" link @click="handleShare(scope.row)">分享</el-button>
          <el-button v-if="scope.row.ext" link @click="handleMove(scope.row)">移动</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 移动文件对话框 -->
    <el-dialog v-model="showMoveDialog" title="移动文件" width="400px">
      <p style="margin-bottom: 10px">选择目标文件夹：</p>
      <el-tree
        :data="folderTree"
        :props="{ label: 'name', children: 'children' }"
        node-key="identity"
        @node-click="selectMoveTarget"
        highlight-current
      />
      <template #footer>
        <el-button @click="showMoveDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmMove">确认移动</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import {
  userFileList,
  userFolderList,
  createFolder,
  deleteFile,
  updateFileName,
  moveFile,
  fileDownload,
  fileDownloadBatch,
  fileDownloadFolder
} from '@/api/file'
import { createShare } from '@/api/share'
import UploadFile from '@/components/UploadFile.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Upload,
  FolderAdd,
  Search,
  Folder,
  Document,
  HomeFilled,
  Download
} from '@element-plus/icons-vue'

const list = ref([])
const showUpload = ref(false)
const loading = ref(false)
const searchKeyword = ref('')
const breadcrumbs = ref([])           // { identity, name, id }
const currentFolderId = ref(0)        // 当前目录的 user_repository id（用于 parent_id）
const currentFolderIdentity = ref('') // 当前目录的 identity（用于 API 查询）
const tableRef = ref(null)
const selectedRows = ref([])          // 多选行数据

// 移动文件相关
const showMoveDialog = ref(false)
const folderTree = ref([])
const movingRow = ref(null)
const moveTargetIdentity = ref('')

// 搜索过滤
const filteredList = computed(() => {
  if (!searchKeyword.value) return list.value
  return list.value.filter(item =>
    item.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const loadList = async () => {
  loading.value = true
  try {
    const res = await userFileList({
      identity: currentFolderIdentity.value,
      page: 1,
      size: 200
    })
    list.value = res.list || []
  } finally {
    loading.value = false
  }
}

const openUpload = () => (showUpload.value = true)

// 多选变化
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// ========== 文件下载功能 ==========

// 单文件下载
const handleDownload = async (row) => {
  try {
    const res = await fileDownload(row.identity)
    // 从 Content-Disposition 提取文件名或使用原始名称
    let filename = row.name
    if (row.ext && !row.name.endsWith(row.ext)) {
      filename = row.name + '.' + row.ext
    }
    triggerBlobDownload(res, filename)
  } catch (err) {
    // 如果 blob 请求失败（如非 JSON 响应），尝试用 window.open 方式
    if (err.response?.type === '' || !err.response?.data) {
      // 直接打开 URL，让浏览器处理下载
      const token = localStorage.getItem('token')
      const url = `/user/file/download?identity=${row.identity}&token=${token}`
      window.open(url, '_blank')
    } else {
      ElMessage.error('下载失败：' + (err.message || '未知错误'))
    }
  }
}

// 批量下载（选中项）
const handleBatchDownload = async () => {
  const files = selectedRows.value.filter(r => r.ext !== '') // 只取文件，排除文件夹
  if (files.length === 0) {
    ElMessage.warning('请选择要下载的文件（不支持批量下载文件夹）')
    return
  }

  try {
    ElMessage.info(`正在打包 ${files.length} 个文件，请稍候...`)
    const identities = files.map(f => f.identity)
    const res = await fileDownloadBatch(identities)
    triggerBlobDownload(res, 'download.zip')
    ElMessage.success('批量下载完成')
  } catch (err) {
    ElMessage.error('批量下载失败：' + (err.message || '未知错误'))
  }
}

// 文件夹打包下载
const handleFolderDownload = async (row) => {
  try {
    ElMessage.info(`正在打包文件夹「${row.name}」，请稍候...`)
    const res = await fileDownloadFolder(row.identity)
    triggerBlobDownload(res, row.name + '.zip')
    ElMessage.success('文件夹打包下载完成')
  } catch (err) {
    ElMessage.error('文件夹打包失败：' + (err.message || '未知错误'))
  }
}

// 通用的 Blob 触发下载方法
const triggerBlobDownload = (blobData, filename) => {
  const blob = new Blob([blobData])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ========== 文件操作 ==========

// 打开文件夹
const handleOpen = (row) => {
  if (row.ext !== '') return // 文件不可打开
  breadcrumbs.value.push({ identity: row.identity, name: row.name, id: row.id })
  currentFolderIdentity.value = row.identity
  currentFolderId.value = row.id
  loadList()
}

// 面包屑导航：返回根目录
const goToRoot = () => {
  breadcrumbs.value = []
  currentFolderIdentity.value = ''
  currentFolderId.value = 0
  loadList()
}

// 面包屑导航：返回某一层
const goToCrumb = (idx) => {
  const crumb = breadcrumbs.value[idx]
  breadcrumbs.value = breadcrumbs.value.slice(0, idx + 1)
  currentFolderIdentity.value = crumb.identity
  currentFolderId.value = crumb.id
  loadList()
}

// 新建文件夹
const handleCreateFolder = async () => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入文件夹名称', '新建文件夹', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空'
    })
    await createFolder({ parent_id: currentFolderId.value, name })
    ElMessage.success('创建成功')
    loadList()
  } catch {
    // 用户取消，不处理
  }
}

// 删除文件
const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).catch(() => null)
  await deleteFile({ identity: row.identity })
  ElMessage.success('删除成功')
  loadList()
}

// 分享文件
const handleShare = async (row) => {
  try {
    const res = await createShare({
      user_repository_identity: row.identity,
      expired_time: 86400
    })
    const shareUrl = `${location.origin}/s/${res.identity}`
    // 记录到 localStorage，供"我的分享"页面展示
    const STORAGE_KEY = 'minio_share_history'
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    history.unshift({
      identity: res.identity,
      name: row.name,
      url: shareUrl,
      createdAt: new Date().toLocaleString(),
      expiredAt: new Date(Date.now() + 86400 * 1000).toISOString()
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50)))
    await navigator.clipboard.writeText(shareUrl)
    ElMessage.success('分享链接已复制到剪贴板')
  } catch {
    ElMessage.error('创建分享失败')
  }
}

// 重命名
const handleRename = async (row) => {
  try {
    const { value: name } = await ElMessageBox.prompt('请输入新名称', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: row.name,
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空'
    })
    await updateFileName({ identity: row.identity, name })
    ElMessage.success('重命名成功')
    loadList()
  } catch {
    // 用户取消
  }
}

// 移动文件
const handleMove = async (row) => {
  movingRow.value = row
  moveTargetIdentity.value = ''
  // 加载文件夹树
  const res = await userFolderList({ identity: '' })
  folderTree.value = buildFolderTree(res.list || [])
  showMoveDialog.value = true
}

const selectMoveTarget = (node) => {
  moveTargetIdentity.value = node.identity
}

const confirmMove = async () => {
  if (!moveTargetIdentity.value) {
    ElMessage.warning('请选择目标文件夹')
    return
  }
  await moveFile({
    identity: movingRow.value.identity,
    parent_identity: moveTargetIdentity.value
  })
  ElMessage.success('移动成功')
  showMoveDialog.value = false
  loadList()
}

// 将扁平列表构建为树结构（文件夹选择用）
const buildFolderTree = (folders) => {
  return folders.map(f => ({ identity: f.identity, name: f.name }))
}

// 文件大小格式化
const formatSize = (size) => {
  if (!size) return '--'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / 1024 / 1024).toFixed(1) + ' MB'
  return (size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
}

onMounted(loadList)
</script>
