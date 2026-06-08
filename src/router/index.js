import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/views/user/Login.vue') },
  { path: '/register', component: () => import('@/views/user/Register.vue') },
  // 分享公开访问页，无需登录
  { path: '/s/:id', component: () => import('@/views/share/SharePage.vue') },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/file',
    children: [
      { path: '/file', component: () => import('@/views/file/FileList.vue') },
      { path: '/share', component: () => import('@/views/share/ShareList.vue') },
      { path: '/user', component: () => import('@/views/user/UserDetail.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 不需要登录即可访问的路由前缀
const PUBLIC_PATHS = ['/login', '/register', '/s/']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isPublic = PUBLIC_PATHS.some(prefix => to.path.startsWith(prefix))
  if (!token && !isPublic) {
    next('/login')
  } else {
    next()
  }
})

export default router
