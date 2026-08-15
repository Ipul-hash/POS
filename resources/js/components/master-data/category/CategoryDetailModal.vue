<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    X,
    Package,
    Calendar,
    Tag,
    Clock,
    Search,
    TrendingUp,
    BarChart3,
    Layers,
} from '@lucide/vue';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import type { Category } from '@/types';

const props = defineProps<{
    open: boolean;
    category: Category | null;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const productSearch = ref('');

const products = computed(() => props.category?.products ?? []);

const filteredProducts = computed(() => {
    if (!productSearch.value.trim()) return products.value;
    const q = productSearch.value.toLowerCase().trim();
    return products.value.filter(
        (p) =>
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.barcode || '').toLowerCase().includes(q)
    );
});

const totalValuation = computed(() => {
    return products.value.reduce((acc, p) => acc + (parseFloat(String(p.sell_price)) || 0), 0);
});

const activeCount = computed(() => products.value.filter((p) => p.is_active).length);

function calculateMargin(cost: number | string, sell: number | string): string {
    const c = parseFloat(String(cost)) || 0;
    const s = parseFloat(String(sell)) || 0;
    if (s <= 0) return '0%';
    const margin = ((s - c) / s) * 100;
    return `${margin.toFixed(0)}%`;
}

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
                class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
                    @click="closeModal"
                ></div>

                <div
                    class="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <Layers class="size-5" />
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                        {{ category?.name || 'Detail Kategori' }}
                                    </h3>
                                    <span class="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                        ID #{{ category?.id }}
                                    </span>
                                </div>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                    {{ category?.description || 'Tidak ada catatan deskripsi pada kategori ini.' }}
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

                    <div class="grid grid-cols-3 gap-3 border-b border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                        <div class="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-3 dark:border-neutral-800/60 dark:bg-neutral-900">
                            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                <Package class="size-4" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                                    Total Item
                                </p>
                                <p class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                    {{ products.length }} Produk
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-3 dark:border-neutral-800/60 dark:bg-neutral-900">
                            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <TrendingUp class="size-4" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                                    Status Katalog
                                </p>
                                <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    {{ activeCount }} Aktif ({{ products.length - activeCount }} Nonaktif)
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-3 dark:border-neutral-800/60 dark:bg-neutral-900">
                            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                <BarChart3 class="size-4" />
                            </div>
                            <div class="min-w-0">
                                <p class="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
                                    Akumulasi Harga
                                </p>
                                <p class="text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                    {{ formatRupiah(totalValuation) }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="flex-1 overflow-y-auto p-6 space-y-4">
                        <div class="flex items-center justify-between gap-3">
                            <div class="relative w-full max-w-xs">
                                <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                                <input
                                    v-model="productSearch"
                                    type="search"
                                    placeholder="Cari SKU, Barcode, atau Produk..."
                                    class="h-8 w-full rounded-lg border border-neutral-200 bg-neutral-50/50 pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100"
                                />
                            </div>
                            <div class="flex items-center gap-3 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                                <span class="flex items-center gap-1">
                                    <Calendar class="size-3.5" /> {{ formatDateTime(category?.created_at) }}
                                </span>
                                <span>•</span>
                                <span class="flex items-center gap-1">
                                    <Clock class="size-3.5" /> {{ formatDateTime(category?.updated_at) }}
                                </span>
                            </div>
                        </div>

                        <div v-if="filteredProducts.length > 0" class="overflow-hidden rounded-xl border border-neutral-200/80 dark:border-neutral-800">
                            <table class="w-full text-left text-xs">
                                <thead class="border-b border-neutral-200 bg-neutral-50/80 font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950/60 dark:text-neutral-400">
                                    <tr>
                                        <th class="px-3.5 py-2.5">Produk</th>
                                        <th class="px-3.5 py-2.5">Identitas</th>
                                        <th class="px-3.5 py-2.5">Satuan</th>
                                        <th class="px-3.5 py-2.5 text-right">Modal</th>
                                        <th class="px-3.5 py-2.5 text-right">Jual</th>
                                        <th class="px-3.5 py-2.5 text-center">Margin</th>
                                        <th class="px-3.5 py-2.5 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                                    <tr
                                        v-for="product in filteredProducts"
                                        :key="product.id"
                                        class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                                    >
                                        <td class="px-3.5 py-2.5 font-medium text-neutral-900 dark:text-neutral-100">
                                            <div class="flex items-center gap-2.5">
                                                <img
                                                    v-if="product.image_url"
                                                    :src="product.image_url"
                                                    :alt="product.name"
                                                    class="size-8 shrink-0 rounded-lg border border-neutral-200 bg-neutral-100 object-cover dark:border-neutral-800 dark:bg-neutral-800"
                                                    @error="($event.target as HTMLElement).style.display = 'none'"
                                                />
                                                <span class="font-semibold">{{ product.name }}</span>
                                            </div>
                                        </td>
                                        <td class="px-3.5 py-2.5 font-mono text-[11px]">
                                            <div class="font-medium text-neutral-800 dark:text-neutral-200">
                                                {{ product.sku }}
                                            </div>
                                            <div v-if="product.barcode" class="text-[10px] text-neutral-400">
                                                {{ product.barcode }}
                                            </div>
                                        </td>
                                        <td class="px-3.5 py-2.5 capitalize text-neutral-600 dark:text-neutral-400">
                                            {{ product.unit || 'cup' }}
                                        </td>
                                        <td class="px-3.5 py-2.5 text-right font-mono text-neutral-500 dark:text-neutral-400">
                                            {{ formatRupiah(product.cost_price) }}
                                        </td>
                                        <td class="px-3.5 py-2.5 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                            {{ formatRupiah(product.sell_price) }}
                                        </td>
                                        <td class="px-3.5 py-2.5 text-center font-mono">
                                            <span class="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                                {{ calculateMargin(product.cost_price, product.sell_price) }}
                                            </span>
                                        </td>
                                        <td class="px-3.5 py-2.5 text-center">
                                            <span
                                                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                                :class="
                                                    product.is_active
                                                        ? 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'
                                                        : 'bg-neutral-100/60 text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500'
                                                "
                                            >
                                                <span
                                                    class="size-1.5 rounded-full"
                                                    :class="product.is_active ? 'bg-emerald-500' : 'bg-neutral-400'"
                                                ></span>
                                                {{ product.is_active ? 'Aktif' : 'Nonaktif' }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div
                            v-else
                            class="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 p-8 text-center dark:border-neutral-800"
                        >
                            <Package class="size-8 text-neutral-300 dark:text-neutral-700 mb-2" />
                            <p class="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                {{ productSearch ? 'Tidak Ada Hasil' : 'Belum Ada Produk Terkait' }}
                            </p>
                            <p class="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs mt-0.5">
                                {{
                                    productSearch
                                        ? 'Coba gunakan kata kunci SKU atau nama produk lainnya.'
                                        : 'Kategori ini belum terhubung dengan produk mana pun di sistem POS.'
                                }}
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-3 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                        <span class="text-xs text-neutral-500">
                            Menampilkan {{ filteredProducts.length }} dari {{ products.length }} item
                        </span>
                        <button
                            type="button"
                            class="h-8 rounded-lg border border-neutral-200 px-3.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
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
