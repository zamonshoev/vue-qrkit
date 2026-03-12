import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkExactActiveClass: 'active',
  routes: [
    {
      component: () => import('@/views/HomeView.vue'),
      name: 'home',
      path: '/',
    },
    {
      component: () => import('@/views/GeneratorView.vue'),
      name: 'generator',
      path: '/generator',
    },
    {
      component: () => import('@/views/ScannerView.vue'),
      name: 'scanner',
      path: '/scanner',
    },
  ],
})

export default router
