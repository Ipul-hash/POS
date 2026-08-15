<script setup lang="ts">
import { computed } from 'vue';
import {
    X,
    Activity,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    RotateCw,
    Package,
    Layers,
} from '@lucide/vue';
import type { ProductStock } from '@/types';

const props = defineProps<{
    open: boolean;
    stock: ProductStock | null;
    isLoading: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'refresh'): void;
}>();

const current = computed(() => props.stock?.current_stock ?? 0);
const min = computed(() => props.stock?.min_stock ?? 0);

const isOutOfStock = computed(() => current.value <= 0);
const isLowStock = computed(() => current.value > 0 && current.value <= min.value);

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
                    class="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <Activity class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Cek Stok Real-Time
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Informasi ketersediaan unit fisik produk
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

                    <!-- Body -->
                    <div class="p-6 space-y-4">
                        <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 space-y-3">
                            <RotateCw class="size-8 animate-spin text-neutral-400" />
                            <p class="text-xs text-neutral-500 font-medium">Memeriksa data stok dari server...</p>
                        </div>

                        <div v-else-if="stock" class="space-y-4">
                            <!-- Product Identification -->
                            <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-950/40">
                                <div class="flex items-center justify-between">
                                    <span class="rounded-md bg-neutral-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                                        ID #{{ stock.product_id }}
                                    </span>
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold"
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
                                        {{ isOutOfStock ? 'Stok Habis' : isLowStock ? 'Stok Kritis' : 'Stok Aman' }}
                                    </span>
                                </div>
                                <h4 class="mt-2 text-base font-bold text-neutral-900 dark:text-neutral-100">
                                    {{ stock.name }}
                                </h4>
                            </div>

                            <!-- Metrics -->
                            <div class="grid grid-cols-2 gap-3">
                                <div class="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span class="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                                        Stok Sekarang
                                    </span>
                                    <div class="mt-1 flex items-baseline gap-1 font-mono">
                                        <span
                                            class="text-3xl font-extrabold"
                                            :class="
                                                isOutOfStock
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : isLowStock
                                                    ? 'text-amber-600 dark:text-amber-400'
                                                    : 'text-emerald-600 dark:text-emerald-400'
                                            "
                                        >
                                            {{ current }}
                                        </span>
                                        <span class="text-xs text-neutral-400">unit</span>
                                    </div>
                                </div>

                                <div class="rounded-xl border border-neutral-200/80 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                                    <span class="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                                        Batas Min. Stok
                                    </span>
                                    <div class="mt-1 flex items-baseline gap-1 font-mono">
                                        <span class="text-3xl font-extrabold text-neutral-700 dark:text-neutral-300">
                                            {{ min }}
                                        </span>
                                        <span class="text-xs text-neutral-400">unit</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Alert Banner if low or out of stock -->
                            <div
                                v-if="isOutOfStock || isLowStock"
                                class="rounded-xl p-3 flex items-start gap-2.5 text-xs"
                                :class="
                                    isOutOfStock
                                        ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-300'
                                        : 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300'
                                "
                            >
                                <AlertTriangle class="size-4 shrink-0 mt-0.5" />
                                <p>
                                    {{
                                        isOutOfStock
                                            ? 'Stok produk ini sudah habis (0 unit). Pelanggan tidak dapat memesan produk ini di kasir POS.'
                                            : `Stok produk (${current} unit) berada di bawah batas minimum (${min} unit). Segera lakukan restok inventori.`
                                    }}
                                </p>
                            </div>
                        </div>

                        <div v-else class="text-center py-6 text-xs text-neutral-500">
                            Data stok tidak dapat ditemukan.
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                        <button
                            type="button"
                            :disabled="isLoading"
                            class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                            @click="emit('refresh')"
                        >
                            <RotateCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
                            <span>Segarkan</span>
                        </button>

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
