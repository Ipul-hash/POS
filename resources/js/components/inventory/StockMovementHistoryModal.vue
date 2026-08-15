<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    X,
    History,
    RefreshCw,
    ArrowDownLeft,
    ArrowUpRight,
    SlidersHorizontal,
    Search,
    Package,
    User,
    Calendar,
} from '@lucide/vue';
import { formatDateTime } from '@/lib/formatters';
import type { StockMovement } from '@/types';

const props = defineProps<{
    open: boolean;
    movements: StockMovement[];
    isLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'refresh'): void;
}>();

const searchQuery = ref('');
const selectedType = ref<'all' | 'in' | 'out' | 'adjustment'>('all');

const filteredMovements = computed(() => {
    let list = [...props.movements];

    if (selectedType.value !== 'all') {
        list = list.filter((m) => m.type === selectedType.value);
    }

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(
            (m) =>
                (m.product?.name || '').toLowerCase().includes(q) ||
                (m.product?.sku || '').toLowerCase().includes(q) ||
                (m.note || '').toLowerCase().includes(q)
        );
    }

    return list;
});

function closeModal() {
    emit('update:open', false);
}
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="open"
                class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            >
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
                    @click="closeModal"
                ></div>

                <div
                    class="relative my-auto flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <History class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Riwayat Mutasi Stok (Audit Trail)
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Log kronologis seluruh pergerakan barang masuk, barang keluar, dan penyesuaian opname
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            @click="closeModal"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <!-- Toolbar -->
                    <div class="flex flex-col gap-3 border-b border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800/80 dark:bg-neutral-950/30 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-wrap items-center gap-2">
                            <!-- Search -->
                            <div class="relative w-full sm:w-64">
                                <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                                <input
                                    v-model="searchQuery"
                                    type="search"
                                    placeholder="Cari produk, SKU, catatan..."
                                    class="h-8 w-full rounded-lg border border-neutral-200 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                />
                            </div>

                            <!-- Filter Types -->
                            <div class="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-950">
                                <button
                                    type="button"
                                    class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all"
                                    :class="selectedType === 'all' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'"
                                    @click="selectedType = 'all'"
                                >
                                    Semua
                                </button>
                                <button
                                    type="button"
                                    class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all"
                                    :class="selectedType === 'in' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400'"
                                    @click="selectedType = 'in'"
                                >
                                    Masuk (+ In)
                                </button>
                                <button
                                    type="button"
                                    class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all"
                                    :class="selectedType === 'out' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50 dark:text-rose-400'"
                                    @click="selectedType = 'out'"
                                >
                                    Keluar (- Out)
                                </button>
                                <button
                                    type="button"
                                    class="rounded-md px-2.5 py-1 text-xs font-semibold transition-all"
                                    :class="selectedType === 'adjustment' ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50 dark:text-blue-400'"
                                    @click="selectedType = 'adjustment'"
                                >
                                    Opname
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            :disabled="isLoading"
                            class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                            @click="emit('refresh')"
                        >
                            <RefreshCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
                            <span>Sinkronkan Log</span>
                        </button>
                    </div>

                    <!-- Body / List -->
                    <div class="flex-1 overflow-y-auto">
                        <div v-if="isLoading" class="p-6 space-y-3">
                            <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
                        </div>

                        <div v-else-if="filteredMovements.length > 0">
                            <table class="w-full text-left text-xs">
                                <thead class="border-b border-neutral-200 bg-neutral-50/80 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-400">
                                    <tr>
                                        <th class="px-4 py-3">Waktu</th>
                                        <th class="px-4 py-3">Produk</th>
                                        <th class="px-4 py-3 text-center">Tipe</th>
                                        <th class="px-4 py-3 text-center">Kuantitas</th>
                                        <th class="px-4 py-3">Catatan / Alasan</th>
                                        <th class="px-4 py-3 text-right">Oleh</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                                    <tr
                                        v-for="item in filteredMovements"
                                        :key="item.id"
                                        class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                                    >
                                        <td class="px-4 py-3.5 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                                            {{ formatDateTime(item.created_at) }}
                                        </td>

                                        <td class="px-4 py-3.5">
                                            <div class="font-bold text-neutral-900 dark:text-neutral-100">
                                                {{ item.product?.name || 'Produk ID #' + item.product_id }}
                                            </div>
                                            <div class="font-mono text-[10px] text-neutral-400">
                                                {{ item.product?.sku }}
                                            </div>
                                        </td>

                                        <td class="px-4 py-3.5 text-center">
                                            <span
                                                class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                                :class="
                                                    item.type === 'in'
                                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                        : item.type === 'out'
                                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                                "
                                            >
                                                <ArrowDownLeft v-if="item.type === 'in'" class="size-3" />
                                                <ArrowUpRight v-else-if="item.type === 'out'" class="size-3" />
                                                <SlidersHorizontal v-else class="size-3" />
                                                {{ item.type === 'in' ? 'Masuk' : item.type === 'out' ? 'Keluar' : 'Opname' }}
                                            </span>
                                        </td>

                                        <td class="px-4 py-3.5 text-center font-mono font-bold">
                                            <span
                                                :class="
                                                    item.type === 'in'
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : item.type === 'out'
                                                        ? 'text-rose-600 dark:text-rose-400'
                                                        : 'text-blue-600 dark:text-blue-400'
                                                "
                                            >
                                                {{ item.type === 'in' ? `+${item.quantity}` : item.type === 'out' ? `-${item.quantity}` : item.quantity }}
                                            </span>
                                            <span class="text-[10px] text-neutral-400 font-normal ml-0.5 capitalize">
                                                {{ item.product?.unit || 'pcs' }}
                                            </span>
                                        </td>

                                        <td class="px-4 py-3.5 text-neutral-600 dark:text-neutral-400 max-w-xs text-xs">
                                            {{ item.note || '-' }}
                                        </td>

                                        <td class="px-4 py-3.5 text-right font-mono text-[11px] text-neutral-500">
                                            {{ item.creator?.name || 'Sistem' }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div v-else class="p-12 text-center text-xs text-neutral-500">
                            <History class="mx-auto size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                            <p class="font-bold text-neutral-800 dark:text-neutral-200">Belum Ada Riwayat Mutasi</p>
                            <p class="mt-0.5 text-neutral-400">Seluruh pergerakan stok manual dan transaksi kasir akan tercatat di sini.</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-3 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                        <span class="text-xs text-neutral-500">
                            Total {{ filteredMovements.length }} log pergerakan stok
                        </span>
                        <button
                            type="button"
                            class="h-8 rounded-lg border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                            @click="closeModal"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
