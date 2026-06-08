import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = token
  return config
})

request.interceptors.response.use(res => {
  return res.data
}, err => {
  if (err.response?.status === 401) {
    localStorage.clear()
    location.href = '/login'
  }
  return Promise.reject(err)
})

export default request