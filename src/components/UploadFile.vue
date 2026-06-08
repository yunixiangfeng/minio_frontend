<template>
  <el-dialog v-model="visible" title="文件上传" @close="$emit('close')">
    <el-upload
      drag
      :auto-upload="false"
      :on-change="handleFile"
      show-file-list
    >
      <i class="el-icon-upload"></i>
      <div>点击或拖拽文件到此处上传</div>
    </el-upload>
    <div style="margin-top: 10px">
      <el-button type="primary" @click="startUpload">开始上传</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { fileUpload, userRepositorySave } from '@/api/file'
import SparkMD5 from 'spark-md5'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['success', 'close'])
const visible = ref(true)
const currentFile = ref(null)

const handleFile = (file) => {
  currentFile.value = file.raw
}

const startUpload = async () => {
  const fd = new FormData()
  fd.append('file', currentFile.value)

  const res = await fileUpload(fd)

  await userRepositorySave({
    parentId: 0,
    repositoryIdentity: res.identity,
    ext: res.ext,
    name: res.name
  })

  ElMessage.success('上传成功')
  emit('success')
  emit('close')
}
</script>