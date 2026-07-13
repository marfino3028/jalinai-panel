<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '../lib/auth.js';
import { api } from '../lib/api.js';

const router = useRouter();
const token = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  if (!token.value.trim()) {
    error.value = 'Masukkan admin token.';
    return;
  }
  loading.value = true;
  auth.login(token.value.trim());
  try {
    // Verifikasi token dengan panggil endpoint admin.
    await api.listTenants();
    router.push({ name: 'dashboard' });
  } catch (e) {
    auth.logout();
    error.value = `Login gagal: ${(e as Error).message}. Cek token & pastikan RAG service jalan.`;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-6">
        <div class="text-4xl mb-2">🔗</div>
        <h1 class="text-2xl font-bold text-slate-800">Jalin.AI Panel</h1>
        <p class="text-sm text-slate-500 mt-1">Masuk sebagai admin</p>
      </div>

      <label class="block text-sm font-medium text-slate-600 mb-1">Admin Token</label>
      <input
        v-model="token"
        type="password"
        placeholder="jln-admin-dev"
        class="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
        @keydown.enter="submit"
      />

      <p v-if="error" class="text-sm text-red-600 mt-2">{{ error }}</p>

      <button
        class="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg py-2.5 disabled:opacity-60"
        :disabled="loading"
        @click="submit"
      >
        {{ loading ? 'Memeriksa…' : 'Masuk' }}
      </button>

      <p class="text-xs text-slate-400 mt-4 text-center">
        Terhubung ke: <code>{{ api.ragUrl }}</code>
      </p>
    </div>
  </div>
</template>
