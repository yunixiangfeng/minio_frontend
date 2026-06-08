import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('@/views/user/Login.vue') },
  { path: '/register', component: () => import('@/views/user/Register.vue') },
  {
    path: '/',
    component: () => import('@/layout/Layout.vue'),
    redirect: '/file',
    children: [
      { path: '/file', component: () => import('@/views/file/FileList.vue') },
      { path: '/share', component: () => import('@/views/share/ShareList.vue') },
      { path: '/user', component: () => import('@/views/user/UserDetail.vue') }
    ]
  },
  { path: '/s/:id', component: () => import('@/views/share/SharePage.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (!token && !['/login', '/register'].includes(to.path)) {
    next('/login')
  } else {
    next()
  }
})

export default router