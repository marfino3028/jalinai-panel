<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { api, type ApiKey, type Order, type TierInfo, type Tier } from '../lib/api.js';

const tiers = ref<TierInfo[]>([]);
const keys = ref<ApiKey[]>([]);
const orders = ref<Order[]>([]);
const loading = ref(true);
const err = ref('');

const newName = ref('');
const newTier = ref<Tier>('free');
const creating = ref(false);
const createdKey = ref('');

const TIERS: Tier[] = ['free', 'starter', 'pro', 'ultimate'];
const rupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');
const compact = (n: number) => (n >= 1_000_000 ? `${n / 1_000_000}jt` : n.toLocaleString('id-ID'));

async function load() {
  loading.value = true;
  err.value = '';
  try {
    [tiers.value, keys.value, orders.value] = await Promise.all([
      api.listTiers(),
      api.listKeys(),
      api.listOrders(),
    ]);
  } catch (e) {
    err.value = `${(e as Error).message} — pastikan ADMIN_TOKEN gateway sama dengan token login.`;
  } finally {
    loading.value = false;
  }
}

async function createKey() {
  if (!newName.value.trim()) return;
  creating.value = true;
  createdKey.value = '';
  try {
    const rec = await api.createKey(newName.value.trim(), newTier.value);
    createdKey.value = rec.key;
    newName.value = '';
    keys.value = await api.listKeys();
  } catch (e) {
    err.value = (e as Error).message;
  } finally {
    creating.value = false;
  }
}

async function changeTier(k: ApiKey, tier: Tier) {
  await api.setKeyTier(k.key, tier);
  keys.value = await api.listKeys();
}
async function revoke(k: ApiKey) {
  await api.revokeKey(k.key);
  keys.value = await api.listKeys();
}
async function approve(o: Order) {
  await api.approveOrder(o.orderId);
  [orders.value, keys.value] = await Promise.all([api.listOrders(), api.listKeys()]);
}

onMounted(load);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold text-slate-800 mb-1">⚙️ Super Admin</h1>
    <p class="text-sm text-slate-500 mb-6">Kelola API key pelanggan, harga tier, & pembayaran.</p>
    <p v-if="err" class="text-sm text-red-600 mb-4">{{ err }}</p>
    <p v-if="loading" class="text-slate-400">Memuat…</p>

    <template v-else>
      <!-- Pricing -->
      <section class="grid sm:grid-cols-4 gap-3 mb-8">
        <div v-for="t in tiers" :key="t.tier" class="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div class="text-xs uppercase tracking-wide text-slate-400">{{ t.tier }}</div>
          <div class="text-lg font-bold text-slate-800">{{ t.priceIdr === 0 ? 'Gratis' : rupiah(t.priceIdr) }}</div>
          <div class="text-xs text-slate-500 mt-1">{{ compact(t.tokenLimit) }} token / {{ t.window === 'day' ? 'hari' : 'bln' }}</div>
        </div>
      </section>

      <!-- API Keys -->
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold text-slate-800">API Keys</h2>
      </div>
      <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-3 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div class="flex-1">
          <label class="block text-xs font-medium text-slate-500 mb-1">Nama pelanggan</label>
          <input v-model="newName" placeholder="Toko Budi / Dev X" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-slate-500 mb-1">Tier</label>
          <select v-model="newTier" class="border border-slate-300 rounded-lg px-3 py-2 text-sm">
            <option v-for="t in TIERS" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <button class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60" :disabled="creating" @click="createKey">
          {{ creating ? 'Membuat…' : '+ Buat Key' }}
        </button>
      </div>
      <div v-if="createdKey" class="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-sm">
        Key baru (simpan sekarang, cuma tampil sekali): <code class="font-mono text-emerald-700 break-all">{{ createdKey }}</code>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto mb-8">
        <table class="w-full text-sm">
          <thead class="text-left text-slate-400 border-b border-slate-100">
            <tr>
              <th class="p-3 font-medium">Nama</th>
              <th class="p-3 font-medium">Key</th>
              <th class="p-3 font-medium">Tier</th>
              <th class="p-3 font-medium">Pemakaian</th>
              <th class="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="k in keys" :key="k.key" class="border-b border-slate-50" :class="{ 'opacity-40': !k.active }">
              <td class="p-3 text-slate-700">{{ k.name }}</td>
              <td class="p-3"><code class="text-xs text-slate-500">{{ k.key.slice(0, 12) }}…</code></td>
              <td class="p-3">
                <select :value="k.tier" class="border border-slate-200 rounded px-2 py-1 text-xs" @change="changeTier(k, ($event.target as HTMLSelectElement).value as Tier)">
                  <option v-for="t in TIERS" :key="t" :value="t">{{ t }}</option>
                </select>
              </td>
              <td class="p-3 text-xs text-slate-500">{{ compact(k.usage.used) }} / {{ compact(k.usage.limit) }}</td>
              <td class="p-3 text-right">
                <button v-if="k.active" class="text-red-500 hover:text-red-700 text-xs" @click="revoke(k)">Revoke</button>
                <span v-else class="text-xs text-slate-400">revoked</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Orders -->
      <h2 class="text-lg font-semibold text-slate-800 mb-3">Pembayaran / Order</h2>
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-left text-slate-400 border-b border-slate-100">
            <tr>
              <th class="p-3 font-medium">Order</th>
              <th class="p-3 font-medium">Tier</th>
              <th class="p-3 font-medium">Jumlah</th>
              <th class="p-3 font-medium">Status</th>
              <th class="p-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.orderId" class="border-b border-slate-50">
              <td class="p-3"><code class="text-xs text-slate-500">{{ o.orderId }}</code></td>
              <td class="p-3 text-slate-700">{{ o.tier }}</td>
              <td class="p-3 text-slate-700">{{ rupiah(o.amount) }}</td>
              <td class="p-3">
                <span class="text-xs px-2 py-0.5 rounded-full" :class="{
                  'bg-amber-100 text-amber-700': o.status === 'pending',
                  'bg-emerald-100 text-emerald-700': o.status === 'paid',
                  'bg-red-100 text-red-700': o.status === 'failed',
                }">{{ o.status }}</span>
              </td>
              <td class="p-3 text-right">
                <button v-if="o.status === 'pending'" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded px-3 py-1" @click="approve(o)">Approve</button>
              </td>
            </tr>
            <tr v-if="orders.length === 0">
              <td colspan="5" class="p-4 text-center text-slate-400 text-sm">Belum ada order.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
