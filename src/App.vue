<script setup lang="ts">
import { useRouter } from 'vue-router';
import { auth } from './lib/auth.js';

const router = useRouter();
function logout() {
  auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="min-h-full flex flex-col">
    <header
      v-if="auth.isLoggedIn"
      class="bg-white border-b border-slate-200 sticky top-0 z-10"
    >
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div class="flex items-center gap-5">
          <router-link to="/" class="flex items-center gap-2 font-bold text-brand-600">
            <span class="text-xl">🔗</span> Jalin.AI
            <span class="text-slate-400 font-normal text-sm">Panel</span>
          </router-link>
          <router-link to="/" class="text-sm text-slate-500 hover:text-brand-600" active-class="text-brand-600">Toko</router-link>
          <router-link to="/system" class="text-sm text-slate-500 hover:text-brand-600" active-class="text-brand-600">Super Admin</router-link>
        </div>
        <button
          class="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
          @click="logout"
        >
          Keluar
        </button>
      </div>
    </header>

    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>
