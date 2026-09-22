import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import AboutView from './views/AboutView.vue'
import TeamView from './views/TeamView.vue'
import LeagueView from './views/LeagueView.vue'
import StatsView from './views/StatsView.vue'
import NotFoundView from './views/NotFoundView.vue'
import { checkSession } from './services/api.js'

export const routes = [
  {
    path: '/',
    alias: '/index.html',
    name: 'home',
    component: HomeView,
    meta: { page: 'home' },
  },
  {
    path: '/about',
    alias: '/about.html',
    name: 'about',
    component: AboutView,
    meta: { page: 'about' },
  },
  {
    path: '/team',
    alias: '/team.html',
    name: 'team',
    component: TeamView,
    meta: { page: 'team' },
  },
  {
    path: '/league',
    alias: ['/info', '/info.html'],
    name: 'league',
    component: LeagueView,
    meta: { page: 'league' },
  },
  {
    path: '/stats',
    alias: '/stats.html',
    name: 'stats',
    component: StatsView,
    meta: { page: 'stats' },
  },
  {
    path: '/admin-login',
    name: 'admin-login',
    component: () => import('./views/AdminLoginView.vue'),
    meta: { admin: true, title: 'Admin Sign In - ABPL' },
  },
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: () => import('./views/AdminDashboardView.vue'),
    meta: { admin: true, requiresAuth: true, title: 'Content Dashboard - ABPL' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: { page: 'notFound' },
  },
]

export function createAppRouter(history = createWebHistory(import.meta.env.BASE_URL)) {
  const router = createRouter({
    history,
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) return savedPosition
      if (to.hash) return { el: to.hash, top: 96 }
      return { left: 0, top: 0, behavior: 'instant' }
    },
  })

  router.beforeEach(async (to) => {
    if (!to.meta.requiresAuth) return true
    try {
      return await checkSession() ? true : { name: 'admin-login' }
    } catch {
      return { name: 'admin-login', query: { reason: 'unavailable' } }
    }
  })

  return router
}