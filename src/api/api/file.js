import request from '@/utils/request'

export const fileUpload = (formData) => request.post('/file/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const fileUploadPrepare = (data) => request.post('/file/upload/prepare', data)
export const fileUploadChunk = (formData) => request.post('/file/upload/chunk', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const fileUploadChunkComplete = (data) => request.post('/file/upload/chunk/complete', data)
export const userFileList = (data) => request.post('/user/file/list', data)
export const userFolderList = (data) => request.post('/user/folder/list', data)
export const createFolder = (data) => request.post('/user/folder/create', data)
export const updateFileName = (data) => request.post('/user/file/name/update', data)
export const deleteFile = (data) => request.delete('/user/file/delete', { data })
export const moveFile = (data) => request.put('/user/file/move', data)
export const userRepositorySave = (data) => request.post('/user/repository/save', data)