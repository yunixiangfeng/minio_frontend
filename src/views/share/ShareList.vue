<template>
  <div>
    <h3>我的分享</h3>
    <el-table border :data="list">
      <el-table-column prop="name" label="文件" />
      <el-table-column prop="url" label="分享链接" />
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const list = ref([])
</script>