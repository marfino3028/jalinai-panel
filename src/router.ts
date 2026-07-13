import { createRouter, createWebHistory } from 'vue-router';
import { auth } from './lib/auth.js';
import Login from './views/Login.vue';
import Dashboard from './views/Dashboard.vue';
import TokoDetail from './views/TokoDetail.vue';
import SystemAdmin from './views/SystemAdmin.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: Login },
    { path: '/', name: 'dashboard', component: Dashboard, meta: { auth: true } },
    { path: '/toko/:id', name: 'toko', component: TokoDetail, meta: { auth: true } },
    { path: '/system', name: 'system', component: SystemAdmin, meta: { auth: true } },
  ],
});

router.beforeEach((to) => {
  if (to.meta.auth && !auth.isLoggedIn) return { name: 'login' };
  if (to.name === 'login' && auth.isLoggedIn) return { name: 'dashboard' };
});

export default router;
