<script setup lang="ts">
defineProps<{
  title: string;
  primaryColor: string;
  welcome: string;
}>();
</script>

<template>
  <div class="w-[300px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
    <div class="px-4 py-3 font-semibold text-white text-sm" :style="{ background: primaryColor }">
      {{ title || 'Tanya Kami' }}
    </div>
    <div class="p-3 bg-slate-50 h-40 flex flex-col gap-2">
      <div class="self-start max-w-[85%] bg-white border border-slate-200 rounded-xl rounded-bl-sm px-3 py-2 text-xs text-slate-700">
        {{ welcome || 'Halo! Ada yang bisa dibantu?' }}
      </div>
      <div
        class="self-end max-w-[85%] rounded-xl rounded-br-sm px-3 py-2 text-xs text-white"
        :style="{ background: primaryColor }"
      >
        Jam buka toko berapa?
      </div>
    </div>
    <div class="flex gap-2 p-2 border-t border-slate-100">
      <div class="flex-1 border border-slate-200 rounded-full px-3 py-1.5 text-xs text-slate-400">
        Ketik pertanyaan…
      </div>
      <div class="rounded-full px-3 py-1.5 text-xs text-white" :style="{ background: primaryColor }">
        Kirim
      </div>
    </div>
  </div>
</template>
