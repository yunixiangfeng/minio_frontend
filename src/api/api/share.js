import request from '@/utils/request'

export const createShare = (data) => request.post('/share/basic/create', data)
export const shareDetail = (params) => request.get('/share/basic/detail', { params })
export const saveShare = (data) => request.post('/share/basic/save', data)