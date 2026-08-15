<script setup lang="ts">
import { computed } from 'vue';
import {
    X,
    Package,
    Barcode,
    Tag,
    Calendar,
    Clock,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Activity,
    Layers,
    DollarSign,
    Pencil,
    ShieldAlert,
} from '@lucide/vue';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import type { Product } from '@/types';

const props = defineProps<{
    open: boolean;
    product: Product | null;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'edit', product: Product): void;
    (e: 'checkStock', product: Product): void;
}>();

const currentStock = computed(() => props.product?.inventory?.quantity ?? 0);
const minStock = computed(() => props.product?.inventory?.min_stock ?? 0);

const isOutOfStock = computed(() => currentStock.value <= 0);
const isLowStock = computed(() => currentStock.value > 0 && currentStock.value <= minStock.value);

const profit = computed(() => {
    if (!props.product) return 0;
    const sell = parseFloat(String(props.product.sell_price)) || 0;
    const cost = parseFloat(String(props.product.cost_price)) || 0;
    return sell - cost;
});

const profitMargin = computed(() => {
    if (!props.product) return 0;
    const sell = parseFloat(String(props.product.sell_price)) || 0;
    const cost = parseFloat(String(props.product.cost_price)) || 0;
    if (sell <= 0) return 0;
    return Math.round(((sell - cost) / sell) * 100);
});

const stockHealthPercent = computed(() => {
    if (minStock.value <= 0) return 100;
    const ratio = (currentStock.value / (minStock.value * 2)) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio)));
});

function closeModal() {
    emit('update:open', false);
}

function handleEdit() {
    if (props.product) {
        emit('edit', props.product);
        closeModal();
    }
}

function handleCheckStock() {
    if (props.product) {
        emit('checkStock', props.product);
    }
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
                    class="relative my-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <Package class="size-5" />
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                        {{ product?.name || 'Detail Produk' }}
                                    </h3>
                                    <span
                                        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                        :class="
                                            product?.is_active
                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                                        "
                                    >
                                        <span
                                            class="size-1.5 rounded-full"
                                            :class="product?.is_active ? 'bg-emerald-500' : 'bg-neutral-400'"
                                        ></span>
                                        {{ product?.is_active ? 'Aktif' : 'Nonaktif' }}
                                    </span>
                                </div>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Kategori: <span class="font-semibold text-neutral-700 dark:text-neutral-300">{{ product?.category?.name || 'Tanpa Kategori' }}</span>
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

                    <!-- Modal Body -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-5">
                        <!-- Product Overview Card -->
                        <div class="flex flex-col sm:flex-row gap-5 items-start rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                            <!-- Image -->
                            <div class="size-24 shrink-0 rounded-xl border border-neutral-200 bg-white overflow-hidden flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
                                <img
                                    v-if="product?.image_url"
                                    :src="product.image_url"
                                    :alt="product.name"
                                    class="size-full object-cover"
                                    @error="($event.target as HTMLElement).style.display = 'none'"
                                />
                                <Package v-else class="size-8 text-neutral-400" />
                            </div>

                            <!-- Basic Info -->
                            <div class="flex-1 space-y-2">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="rounded-md bg-neutral-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                                        {{ product?.sku }}
                                    </span>
                                    <span v-if="product?.barcode" class="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-mono text-[11px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                                        <Barcode class="size-3" />
                                        {{ product.barcode }}
                                    </span>
                                    <span class="rounded-md bg-neutral-200/70 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 capitalize">
                                        Satuan: {{ product?.unit || 'pcs' }}
                                    </span>
                                </div>

                                <h4 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                    {{ product?.name }}
                                </h4>

                                <p v-if="product?.category?.description" class="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2">
                                    {{ product.category.description }}
                                </p>
                            </div>
                        </div>

                        <!-- Financial & Margin Metric Grid -->
                        <div>
                            <h5 class="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2.5">
                                Analisis Harga & Margin
                            </h5>
                            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div class="rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Harga Beli (Modal)
                                    </span>
                                    <p class="mt-1 font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300 truncate">
                                        {{ formatRupiah(product?.cost_price) }}
                                    </p>
                                </div>

                                <div class="rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Harga Jual POS
                                    </span>
                                    <p class="mt-1 font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                        {{ formatRupiah(product?.sell_price) }}
                                    </p>
                                </div>

                                <div class="rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Laba Kotor / Unit
                                    </span>
                                    <p class="mt-1 font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                                        +{{ formatRupiah(profit) }}
                                    </p>
                                </div>

                                <div class="rounded-xl border border-neutral-200/80 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                        Margin Persentase
                                    </span>
                                    <div class="mt-1 flex items-baseline gap-1">
                                        <span class="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                                            {{ profitMargin }}%
                                        </span>
                                        <span class="text-[10px] text-neutral-400">gross</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Realtime Inventory Status Card -->
                        <div class="rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 space-y-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <Activity class="size-4 text-neutral-700 dark:text-neutral-300" />
                                    <span class="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                                        Status Stok & Inventori
                                    </span>
                                </div>

                                <span
                                    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                    :class="
                                        isOutOfStock
                                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                            : isLowStock
                                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                    "
                                >
                                    <XCircle v-if="isOutOfStock" class="size-3" />
                                    <AlertTriangle v-else-if="isLowStock" class="size-3" />
                                    <CheckCircle2 v-else class="size-3" />
                                    {{ isOutOfStock ? 'Stok Habis' : isLowStock ? 'Stok Kritis' : 'Stok Tersedia' }}
                                </span>
                            </div>

                            <div class="grid grid-cols-2 gap-4 pt-1">
                                <div>
                                    <span class="text-[11px] text-neutral-500">Stok Fisik Saat Ini</span>
                                    <div class="mt-0.5 flex items-baseline gap-1.5 font-mono">
                                        <span class="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                            {{ currentStock }}
                                        </span>
                                        <span class="text-xs text-neutral-500 capitalize">{{ product?.unit || 'pcs' }}</span>
                                    </div>
                                </div>

                                <div>
                                    <span class="text-[11px] text-neutral-500">Ambang Batas Minimum</span>
                                    <div class="mt-0.5 flex items-baseline gap-1.5 font-mono">
                                        <span class="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                                            {{ minStock }}
                                        </span>
                                        <span class="text-xs text-neutral-500 capitalize">{{ product?.unit || 'pcs' }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Progress Bar -->
                            <div class="space-y-1 pt-1">
                                <div class="flex items-center justify-between text-[10px] text-neutral-400">
                                    <span>Tingkat Ketersediaan Stok</span>
                                    <span>{{ currentStock }} / {{ minStock * 2 || 10 }}</span>
                                </div>
                                <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    <div
                                        class="h-full rounded-full transition-all duration-300"
                                        :class="
                                            isOutOfStock
                                                ? 'bg-rose-500'
                                                : isLowStock
                                                ? 'bg-amber-500'
                                                : 'bg-emerald-500'
                                        "
                                        :style="{ width: `${stockHealthPercent}%` }"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <!-- Metadata Timestamps -->
                        <div class="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            <span class="flex items-center gap-1">
                                <Calendar class="size-3.5" /> Dibuat: {{ formatDateTime(product?.created_at) }}
                            </span>
                            <span class="flex items-center gap-1">
                                <Clock class="size-3.5" /> Diperbarui: {{ formatDateTime(product?.updated_at) }}
                            </span>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                        <button
                            type="button"
                            class="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                            @click="handleCheckStock"
                        >
                            <Activity class="size-3.5 text-neutral-500" />
                            <span>Cek Stok API</span>
                        </button>

                        <div class="flex items-center gap-2">
                            <button
                                type="button"
                                class="h-8 rounded-lg border border-neutral-200 px-3.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                @click="closeModal"
                            >
                                Tutup
                            </button>
                            <button
                                type="button"
                                class="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 text-xs font-semibold text-white hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                                @click="handleEdit"
                            >
                                <Pencil class="size-3.5" />
                                <span>Edit Produk</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
