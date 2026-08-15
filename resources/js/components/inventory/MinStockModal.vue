<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { X, Check, Loader2, ShieldAlert, Package } from '@lucide/vue';
import type { InventoryItem } from '@/types';

const props = defineProps<{
    open: boolean;
    inventoryItem: InventoryItem | null;
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', min_stock: number): void;
}>();

const minStockValue = ref<number>(5);

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen && props.inventoryItem) {
            minStockValue.value = props.inventoryItem.min_stock ?? 5;
        }
    }
);

const currentStock = computed(() => props.inventoryItem?.quantity ?? 0);
const unit = computed(() => props.inventoryItem?.product?.unit || 'pcs');

const isCurrentlyLow = computed(() => currentStock.value <= minStockValue.value);

function closeModal() {
    if (props.isSubmitting) return;
    emit('update:open', false);
}

function handleSubmit() {
    if (minStockValue.value < 0 || props.isSubmitting) return;
    emit('submit', minStockValue.value);
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
                                <ShieldAlert class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Batas Minimum Stok
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Atur ambang batas peringatan restok produk
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            :disabled="isSubmitting"
                            @click="closeModal"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <!-- Body -->
                    <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                        <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-950/40">
                            <span class="rounded-md bg-neutral-900 px-2 py-0.5 font-mono text-[10px] font-bold text-white dark:bg-neutral-100 dark:text-neutral-900">
                                {{ inventoryItem?.product?.sku }}
                            </span>
                            <h4 class="mt-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                                {{ inventoryItem?.product?.name }}
                            </h4>
                            <div class="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                                <span>Stok Fisik Saat Ini:</span>
                                <span class="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                                    {{ currentStock }} {{ unit }}
                                </span>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                Ambang Batas Min. Stok (Alert Threshold) <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <input
                                    v-model.number="minStockValue"
                                    type="number"
                                    min="0"
                                    :disabled="isSubmitting"
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 font-mono text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                />
                                <span class="absolute right-3.5 top-2.5 text-xs text-neutral-400 font-medium capitalize">
                                    {{ unit }}
                                </span>
                            </div>
                            <p class="text-[11px] text-neutral-500">
                                Sistem POS akan menandai produk berstatus <strong>Stok Kritis</strong> bila kuantitas fisik &le; nilai ini.
                            </p>
                        </div>

                        <div
                            v-if="isCurrentlyLow"
                            class="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
                        >
                            Dengan batas minimum ini ({{ minStockValue }} {{ unit }}), stok saat ini ({{ currentStock }} {{ unit }}) akan langsung memicu peringatan restok.
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
                            <button
                                type="button"
                                :disabled="isSubmitting"
                                class="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                @click="closeModal"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                :disabled="isSubmitting || minStockValue < 0"
                                class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            >
                                <Loader2 v-if="isSubmitting" class="size-3.5 animate-spin" />
                                <Check v-else class="size-3.5" />
                                <span>Simpan Batas</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
