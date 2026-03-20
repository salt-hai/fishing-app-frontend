import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/venues',
    name: 'venues',
    component: () => import('../views/Venues.vue')
  },
  {
    path: '/venues/:id',
    name: 'venue-detail',
    component: () => import('../views/VenueDetail.vue')
  },
  {
    path: '/venues/:id/chatroom',
    name: 'venue-chatroom',
    component: () => import('../views/VenueChatroom.vue')
  },
  {
    path: '/mall',
    name: 'mall',
    component: () => import('../views/Mall.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
