import request from '@/utils/request'

export const userLogin = (data) => request.post('/user/login', data)
export const userRegister = (data) => request.post('/user/register', data)
export const sendMailCode = (data) => request.post('/mail/code/send/register', data)
export const userDetail = (identity) => request.get('/user/detail', { params: { identity } })
export const refreshToken = () => request.post('/refresh/authorization')