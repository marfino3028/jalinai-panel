<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { api, type Tenant, type DocInfo } from '../lib/api.js';
import WidgetPreview from '../components/WidgetPreview.vue';

const route = useRoute();
const id = route.params.id as string;

const tenant = ref<Tenant | null>(null);
const docs = ref<DocInfo[]>([]);
const err = ref('');
const loading = ref(true);

// Widget editor
const wTitle = ref('');
const wColor = ref('#2563eb');
const wWelcome = ref('');
const savingWidget = ref(false);
const widgetSaved = ref(false);

// Upload
const uploading = ref(false);
const uploadMsg = ref('');

// Chat tester
const chatInput = ref('');
const chatBusy = ref(false);
const chatLog = ref<{ role: 'user' | 'bot'; text: string; sources?: string[] }[]>([]);

const embedSnippet = computed(
  () =>
    `<script src="${api.ragUrl}/public/widget.js" data-tenant="${id}" data-api="${api.ragUrl}"><\/script>`,
);

async function load() {
  loading.value = true;
  err.value = '';
  try {
    const list = await api.listTenants();
    tenant.value = list.find((t) => t.id === id) ?? null;
    if (tenant.value) {
      wTitle.value = tenant.value.widget.title;
      wColor.value = tenant.value.widget.primaryColor;
      wWelcome.value = tenant.value.widget.welcome;
    }
    docs.value = await api.listDocs(id);
  } catch (e) {
    err.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

async function onUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  uploading.value = true;
  uploadMsg.value = '';
  try {
    const r = await api.uploadDoc(id, file);
    uploadMsg.value = `✓ ${file.name} — ${r.chunks} chunk terindeks`;
    docs.value = await api.listDocs(id);
  } catch (e) {
    uploadMsg.value = `✗ ${(e as Error).message}`;
  } finally {
    uploading.value = false;
    (e.target as HTMLInputElement).value = '';
  }
}

async function removeDoc(docId: string) {
  await api.deleteDoc(id, docId);
  docs.value = await api.listDocs(id);
}

async function saveWidget() {
  savingWidget.value = true;
  widgetSaved.value = false;
  try {
    await api.updateWidget(id, {
      title: wTitle.value,
      primaryColor: wColor.value,
      welcome: wWelcome.value,
    });
    widgetSaved.value = true;
    setTimeout(() => (widgetSaved.value = false), 2000);
  } catch (e) {
    err.value = (e as Error).message;
  } finally {
    savingWidget.value = false;
  }
}

async function sendChat() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  chatInput.value = '';
  chatLog.value.push({ role: 'user', text: msg });
  chatBusy.value = true;
  try {
    const r = await api.testChat(id, msg);
    chatLog.value.push({
      role: 'bot',
      text: r.answer ?? r.error ?? 'Tidak ada jawaban.',
      sources: r.sources?.map((s) => s.docName),
    });
  } catch (e) {
    chatLog.value.push({ role: 'bot', text: `Error: ${(e as Error).message}` });
  } finally {
    chatBusy.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <router-link to="/" class="text-sm text-slate-500 hover:text-slate-800">← Kembali</router-link>

    <p v-if="loading" class="text-slate-400 mt-4">Memuat…</p>
    <p v-else-if="!tenant" class="text-red-600 mt-4">Toko tidak ditemukan.</p>

    <div v-else class="mt-3">
      <h1 class="text-2xl font-bold text-slate-800">{{ tenant.name }}</h1>
      <p class="text-sm text-slate-400 mb-6">{{ tenant.id }}</p>
      <p v-if="err" class="text-sm text-red-600 mb-4">{{ err }}</p>

      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Dokumen -->
        <section class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 class="font-semibold text-slate-800 mb-3">📄 Dokumen FAQ</h2>
          <label
            class="block border-2 border-dashed border-slate-300 rounded-lg p-4 text-center text-sm text-slate-500 cursor-pointer hover:border-brand-500"
          >
            <input type="file" accept="application/pdf" class="hidden" @change="onUpload" />
            {{ uploading ? 'Mengunggah & memproses…' : 'Klik untuk upload PDF (katalog / FAQ)' }}
          </label>
          <p v-if="uploadMsg" class="text-xs mt-2" :class="uploadMsg.startsWith('✓') ? 'text-emerald-600' : 'text-red-600'">
            {{ uploadMsg }}
          </p>

          <ul class="mt-4 divide-y divide-slate-100">
            <li v-for="d in docs" :key="d.docId" class="flex items-center justify-between py-2 text-sm">
              <span class="text-slate-700 truncate">{{ d.docName }}</span>
              <span class="flex items-center gap-3 shrink-0">
                <span class="text-xs text-slate-400">{{ d.chunks }} chunk</span>
                <button class="text-red-500 hover:text-red-700 text-xs" @click="removeDoc(d.docId)">Hapus</button>
              </span>
            </li>
            <li v-if="docs.length === 0" class="py-3 text-sm text-slate-400">Belum ada dokumen.</li>
          </ul>
        </section>

        <!-- Widget editor + preview -->
        <section class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 class="font-semibold text-slate-800 mb-3">🎨 Tampilan Widget</h2>
          <div class="flex gap-6">
            <div class="flex-1 space-y-3">
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Judul</label>
                <input v-model="wTitle" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Warna</label>
                <input v-model="wColor" type="color" class="h-9 w-16 rounded border border-slate-300" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-500 mb-1">Sapaan</label>
                <textarea v-model="wWelcome" rows="2" class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"></textarea>
              </div>
              <button
                class="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2 disabled:opacity-60"
                :disabled="savingWidget"
                @click="saveWidget"
              >
                {{ savingWidget ? 'Menyimpan…' : widgetSaved ? '✓ Tersimpan' : 'Simpan' }}
              </button>
            </div>
            <WidgetPreview :title="wTitle" :primary-color="wColor" :welcome="wWelcome" />
          </div>
        </section>

        <!-- Chat tester -->
        <section class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 class="font-semibold text-slate-800 mb-3">💬 Uji Chatbot</h2>
          <div class="h-48 overflow-y-auto bg-slate-50 rounded-lg p-3 flex flex-col gap-2 mb-3">
            <div v-if="chatLog.length === 0" class="text-sm text-slate-400 m-auto">
              Coba tanya sesuatu dari isi PDF…
            </div>
            <template v-for="(m, i) in chatLog" :key="i">
              <div
                class="max-w-[85%] px-3 py-2 rounded-xl text-sm"
                :class="m.role === 'user'
                  ? 'self-end bg-brand-600 text-white rounded-br-sm'
                  : 'self-start bg-white border border-slate-200 text-slate-700 rounded-bl-sm'"
              >
                {{ m.text }}
                <div v-if="m.sources?.length" class="text-[10px] opacity-70 mt-1">📎 {{ m.sources.join(', ') }}</div>
              </div>
            </template>
            <div v-if="chatBusy" class="self-start text-sm text-slate-400">mengetik…</div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="chatInput"
              placeholder="Jam buka toko berapa?"
              class="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              @keydown.enter="sendChat"
            />
            <button class="bg-brand-600 text-white text-sm rounded-lg px-4" @click="sendChat">Kirim</button>
          </div>
        </section>

        <!-- Embed snippet -->
        <section class="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
          <h2 class="font-semibold text-slate-800 mb-3">🔌 Pasang di Website</h2>
          <p class="text-sm text-slate-500 mb-2">Tempel kode ini sebelum <code>&lt;/body&gt;</code>:</p>
          <pre class="bg-slate-900 text-slate-100 text-xs rounded-lg p-3 overflow-x-auto"><code>{{ embedSnippet }}</code></pre>
        </section>
      </div>
    </div>
  </div>
</template>
