import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截器：自动注入 token
request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = token
  return config
})

// 刷新 token 的标志，防止并发多次刷新
let isRefreshing = false
let refreshSubscribers = []

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

const addRefreshSubscriber = (cb) => {
  refreshSubscribers.push(cb)
}

// 响应拦截器：401 时自动刷新 token，失败才跳登录
request.interceptors.response.use(
  res => res.data,
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token')

      if (!refreshToken) {
        // 没有 refresh token，直接跳登录
        localStorage.clear()
        location.href = '/login'
        return Promise.reject(err)
      }

      if (isRefreshing) {
        // 已在刷新中，排队等待新 token
        return new Promise(resolve => {
          addRefreshSubscriber(newToken => {
            originalRequest.headers.Authorization = newToken
            resolve(request(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axios.post('/api/refresh/authorization', {}, {
          headers: { Authorization: refreshToken }
        })
        const { token, refresh_token } = res.data
        localStorage.setItem('token', token)
        if (refresh_token) localStorage.setItem('refresh_token', refresh_token)

        isRefreshing = false
        onRefreshed(token)

        originalRequest.headers.Authorization = token
        return request(originalRequest)
      } catch {
        isRefreshing = false
        localStorage.clear()
        location.href = '/login'
        return Promise.reject(err)
      }
    }

    return Promise.reject(err)
  }
)

export default request
