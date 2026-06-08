<template>
  <el-dialog v-model="visible" title="上传文件" width="500px" @close="$emit('close')" :close-on-click-modal="false">
    <el-upload
      drag
      :auto-upload="false"
      :on-change="handleFile"
      :show-file-list="false"
      accept="*"
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处，或 <em>点击选择文件</em>
      </div>
    </el-upload>

    <!-- 已选文件信息 -->
    <div v-if="currentFile" style="margin-top: 12px; padding: 10px; background: #f5f7fa; border-radius: 4px">
      <div style="display: flex; justify-content: space-between; align-items: center">
        <span style="word-break: break-all">{{ currentFile.name }}</span>
        <span style="color: #999; font-size: 12px; margin-left: 8px; white-space: nowrap">{{ formatSize(currentFile.size) }}</span>
      </div>
      <el-tag size="small" style="margin-top: 6px" :type="useChunk ? 'warning' : 'success'">
        {{ useChunk ? '分片上传 (大文件)' : '普通上传' }}
      </el-tag>
    </div>

    <!-- 上传进度 -->
    <div v-if="uploading" style="margin-top: 12px">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px">
        <span>{{ progressText }}</span>
        <span>{{ progress }}%</span>
      </div>
      <el-progress :percentage="progress" :status="progress === 100 ? 'success' : undefined" />
    </div>

    <template #footer>
      <el-button @click="$emit('close')" :disabled="uploading">取消</el-button>
      <el-button
        type="primary"
        @click="startUpload"
        :loading="uploading"
        :disabled="!currentFile"
      >
        {{ uploading ? '上传中...' : '开始上传' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import SparkMD5 from 'spark-md5'
import { ElMessage } from 'element-plus'
import {
  fileUpload,
  fileUploadPrepare,
  fileUploadChunk,
  fileUploadChunkComplete,
  userRepositorySave
} from '@/api/file'

const props = defineProps({
  parentId: { type: Number, default: 0 }
})
const emit = defineEmits(['success', 'close'])

const visible = ref(true)
const currentFile = ref(null)
const uploading = ref(false)
const progress = ref(0)
const progressText = ref('')

// 大文件阈值：超过 10MB 使用分片上传
const CHUNK_SIZE = 5 * 1024 * 1024         // 每片 5MB
const CHUNK_THRESHOLD = 10 * 1024 * 1024   // 超过 10MB 走分片

const useChunk = computed(() => currentFile.value && currentFile.value.size > CHUNK_THRESHOLD)

const handleFile = (file) => {
  currentFile.value = file.raw
  progress.value = 0
  progressText.value = ''
}

// 计算文件 MD5
const calcMd5 = (file) => {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const chunkSize = 2 * 1024 * 1024
    let cursor = 0

    const loadNext = () => {
      const blob = file.slice(cursor, cursor + chunkSize)
      reader.readAsArrayBuffer(blob)
    }

    reader.onload = (e) => {
      spark.append(e.target.result)
      cursor += chunkSize
      if (cursor < file.size) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }
    reader.onerror = reject
    loadNext()
  })
}

// 普通上传（小文件）
const normalUpload = async () => {
  progressText.value = '正在上传...'
  progress.value = 20
  const fd = new FormData()
  fd.append('file', currentFile.value)
  const res = await fileUpload(fd)
  progress.value = 80
  progressText.value = '正在保存到网盘...'
  // 注意：后端 UserRepositorySaveRequest 使用驼峰 json tag
  await userRepositorySave({
    parentId: props.parentId,
    repositoryIdentity: res.identity,
    ext: res.ext,
    name: res.name
  })
  progress.value = 100
}

// 分片上传（大文件）
const chunkUpload = async () => {
  const file = currentFile.value
  progressText.value = '计算文件特征...'
  progress.value = 2

  const md5 = await calcMd5(file)
  const dotIdx = file.name.lastIndexOf('.')
  const ext = dotIdx >= 0 ? file.name.substring(dotIdx) : ''
  const name = file.name

  progressText.value = '初始化分片上传...'
  progress.value = 5

  // 1. 准备分片上传
  const prepRes = await fileUploadPrepare({ md5, name, ext })
  const { identity, upload_id, key } = prepRes

  // 2. 逐片上传
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const etags = []

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const blob = file.slice(start, end)

    const fd = new FormData()
    fd.append('key', key)
    fd.append('upload_id', upload_id)
    fd.append('part_number', i + 1)
    fd.append('file', blob)

    progressText.value = `上传分片 ${i + 1}/${totalChunks}...`
    const chunkRes = await fileUploadChunk(fd)
    etags.push({ part_number: i + 1, etag: chunkRes.etag })

    progress.value = Math.round(5 + ((i + 1) / totalChunks) * 80)
  }

  // 3. 完成分片上传
  progressText.value = '合并分片...'
  const completeRes = await fileUploadChunkComplete({
    md5,
    name,
    ext,
    size: file.size,
    upload_id,
    key,
    Minio_objects: etags
  })
  progress.value = 92

  // 4. 关联到用户网盘（驼峰字段名）
  progressText.value = '保存到网盘...'
  await userRepositorySave({
    parentId: props.parentId,
    repositoryIdentity: completeRes.identity,
    ext,
    name
  })
  progress.value = 100
}

const startUpload = async () => {
  if (!currentFile.value) return
  uploading.value = true
  progress.value = 0
  try {
    if (useChunk.value) {
      await chunkUpload()
    } else {
      await normalUpload()
    }
    progressText.value = '上传完成！'
    ElMessage.success('上传成功')
    emit('success')
    emit('close')
  } catch (err) {
    console.error('上传失败', err)
    const msg = err?.response?.data?.message || err?.message || '请检查后端服务是否正常'
    ElMessage.error('上传失败：' + msg)
    progress.value = 0
    progressText.value = ''
  } finally {
    uploading.value = false
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
