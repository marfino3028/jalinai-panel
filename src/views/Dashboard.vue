<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, type Tenant } from '../lib/api.js';

const tenants = ref<Tenant[]>([]);
const providers = ref<string[]>([]);
const models = ref<{ id: string; tier: string; providers: string[] }[]>([]);
const loading = ref(true);
const err = ref('');

// Form buat toko baru
const showForm = ref(false);
const newName = ref('');
const newId = ref('');
const creating = ref(false);

async function load() {
  loading.value = true;
  err.value = '';
  try {
    const [t, h, m] = await Promise.all([
      api.listTenants(),
      api.gatewayHealth(),
      api.gatewayModels(),
    ]);
    tenants.value = t;
    providers.value = h.providers;
    models.value = m;
  } catch (e) {
    err.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function createTenant() {
  if (!newName.value.trim()) return;
  creating.value = true;
  try {
    await api.createTenant(newName.value.trim(), newId.value.trim() || undefined);
    newName.value = '';
    newId.value = '';
    showForm.value = false;
    await load();
  } catch (e) {
    err.value = (e as Error).message;
  } finally {
    creating.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Super Admin: status sistem -->
    <section class="grid sm:grid-cols-3 gap-4 mb-8">
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div class="text-3xl font-bold text-brand-600">{{ tenants.length }}</div>
        <div class="text-sm text-slate-500 mt-1">Toko terdaftar</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div class="text-3xl font-bold text-emerald-600">{{ providers.length }}</div>
        <div class="text-sm text-slate-500 mt-1">Provider AI aktif</div>
        <div class="text-xs text-slate-400 mt-1 truncate">{{ providers.join(', ') || '—' }}</div>
      </div>
      <div class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <div class="text-3xl font-bold text-indigo-600">{{ models.length }}</div>
        <div class="text-sm text-slate-500 mt-1">Model tersedia</div>
      </div>
    </section>

    <!-- Daftar toko -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-slate-800">Toko / Tenant</h2>
      <button
        class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2"
        @click="showForm = !showForm"
      >
        + Toko Baru
      </button>
    </div>

    <div v-if="showForm" class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row gap-3 sm:items-end">
      <div class="flex-1">
        <label class="block text-xs font-medium text-slate-500 mb-1">Nama toko</label>
        <input v-model="newName" placeholder="Toko Budi Elektronik" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div class="flex-1">
        <label class="block text-xs font-medium text-slate-500 mb-1">ID (opsional)</label>
        <input v-model="newId" placeholder="toko-budi" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <button
        class="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60"
        :disabled="creating"
        @click="createTenant"
      >
        {{ creating ? 'Membuat…' : 'Simpan' }}
      </button>
    </div>

    <p v-if="err" class="text-sm text-red-600 mb-4">{{ err }}</p>
    <p v-if="loading" class="text-slate-400">Memuat…</p>

    <div v-else-if="tenants.length === 0" class="text-center py-12 text-slate-400">
      Belum ada toko. Klik "+ Toko Baru" untuk mulai.
    </div>

    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="t in tenants"
        :key="t.id"
        :to="{ name: 'toko', params: { id: t.id } }"
        class="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:border-brand-500 hover:shadow-md transition"
      >
        <div class="flex items-center gap-3">
          <span
            class="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
            :style="{ background: t.widget.primaryColor }"
          >
            {{ t.name.charAt(0).toUpperCase() }}
          </span>
          <div class="min-w-0">
            <div class="font-medium text-slate-800 truncate">{{ t.name }}</div>
            <div class="text-xs text-slate-400 truncate">{{ t.id }}</div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
