<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import {
    X,
    Check,
    Loader2,
    ArrowDownLeft,
    ArrowUpRight,
    SlidersHorizontal,
    Package,
    AlertCircle,
    Info,
} from '@lucide/vue';
import type {
    InventoryItem,
    StockAdjustmentPayload,
    StockMovementType,
} from '@/types';

const props = defineProps<{
    open: boolean;
    inventoryItem?: InventoryItem | null;
    inventories: InventoryItem[];
    isSubmitting: boolean;
    errors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', payload: StockAdjustmentPayload): void;
}>();

const form = reactive<{
    product_id: number | string;
    type: StockMovementType;
    quantity: number;
    note: string;
}>({
    product_id: '',
    type: 'in',
    quantity: 1,
    note: '',
});

const currentSelectedProduct = computed(() => {
    if (!form.product_id) return null;
    return props.inventories.find((i) => i.product_id === Number(form.product_id)) || null;
});

const currentStock = computed(() => currentSelectedProduct.value?.quantity ?? 0);
const unit = computed(() => currentSelectedProduct.value?.product?.unit || 'pcs');

const resultingStock = computed(() => {
    const qty = Number(form.quantity) || 0;
    if (form.type === 'in') {
        return currentStock.value + qty;
    } else if (form.type === 'out') {
        return Math.max(0, currentStock.value - qty);
    } else if (form.type === 'adjustment') {
        return qty;
    }
    return currentStock.value;
});

const isOutExceedsStock = computed(() => {
    if (form.type !== 'out') return false;
    return (Number(form.quantity) || 0) > currentStock.value;
});

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            if (props.inventoryItem) {
                form.product_id = props.inventoryItem.product_id;
            } else if (props.inventories.length > 0) {
                form.product_id = props.inventories[0].product_id;
            } else {
                form.product_id = '';
            }
            form.type = 'in';
            form.quantity = 1;
            form.note = '';
        }
    }
);

function closeModal() {
    if (props.isSubmitting) return;
    emit('update:open', false);
}

function handleSubmit() {
    if (!form.product_id || !form.quantity || form.quantity < 1 || isOutExceedsStock.value || props.isSubmitting) {
        return;
    }

    emit('submit', {
        product_id: Number(form.product_id),
        type: form.type,
        quantity: Number(form.quantity),
        note: form.note.trim() || null,
    });
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
                    class="relative my-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <SlidersHorizontal class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Penyesuaian Stok Manual
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Catat barang masuk, barang keluar, atau koreksi stock opname
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

                    <!-- Scrollable Form Body -->
                    <form @submit.prevent="handleSubmit" class="flex flex-1 flex-col overflow-y-auto">
                        <div class="p-6 space-y-5">
                            <!-- Product Selector -->
                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Pilih Produk <span class="text-rose-500">*</span>
                                </label>
                                <select
                                    v-model="form.product_id"
                                    :disabled="isSubmitting || !!props.inventoryItem"
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 disabled:opacity-80"
                                >
                                    <option value="" disabled>Pilih Produk</option>
                                    <option
                                        v-for="item in inventories"
                                        :key="item.product_id"
                                        :value="item.product_id"
                                    >
                                        {{ item.product?.name }} ({{ item.product?.sku }}) — Sisa: {{ item.quantity }} {{ item.product?.unit || 'pcs' }}
                                    </option>
                                </select>
                            </div>

                            <!-- Adjustment Type Selector (3 options) -->
                            <div class="space-y-2">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Tipe Penyesuaian
                                </label>
                                <div class="grid grid-cols-3 gap-2">
                                    <!-- In -->
                                    <button
                                        type="button"
                                        class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                                        :class="
                                            form.type === 'in'
                                                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/80 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-2xs font-semibold'
                                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                        "
                                        @click="form.type = 'in'"
                                    >
                                        <ArrowDownLeft class="size-4 text-emerald-600 dark:text-emerald-400" />
                                        <span class="text-xs">Barang Masuk</span>
                                        <span class="text-[10px] opacity-75 font-mono">+ Stok</span>
                                    </button>

                                    <!-- Out -->
                                    <button
                                        type="button"
                                        class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                                        :class="
                                            form.type === 'out'
                                                ? 'border-rose-500 bg-rose-50/80 text-rose-900 dark:border-rose-500/80 dark:bg-rose-950/50 dark:text-rose-300 shadow-2xs font-semibold'
                                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                        "
                                        @click="form.type = 'out'"
                                    >
                                        <ArrowUpRight class="size-4 text-rose-600 dark:text-rose-400" />
                                        <span class="text-xs">Barang Keluar</span>
                                        <span class="text-[10px] opacity-75 font-mono">- Stok</span>
                                    </button>

                                    <!-- Adjustment / Opname -->
                                    <button
                                        type="button"
                                        class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                                        :class="
                                            form.type === 'adjustment'
                                                ? 'border-blue-500 bg-blue-50/80 text-blue-900 dark:border-blue-500/80 dark:bg-blue-950/50 dark:text-blue-300 shadow-2xs font-semibold'
                                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                        "
                                        @click="form.type = 'adjustment'"
                                    >
                                        <SlidersHorizontal class="size-4 text-blue-600 dark:text-blue-400" />
                                        <span class="text-xs">Koreksi Opname</span>
                                        <span class="text-[10px] opacity-75 font-mono">= Set Total</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Quantity Input -->
                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    {{ form.type === 'adjustment' ? 'Kuantitas Stok Fisik Nyata (Hasil Opname)' : 'Jumlah Unit Perubahan' }}
                                    <span class="text-rose-500">*</span>
                                </label>
                                <div class="relative">
                                    <input
                                        v-model.number="form.quantity"
                                        type="number"
                                        :min="form.type === 'adjustment' ? 0 : 1"
                                        :disabled="isSubmitting"
                                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 font-mono text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                        :class="{ '!border-rose-500': isOutExceedsStock || errors?.quantity }"
                                    />
                                    <span class="absolute right-3.5 top-2.5 text-xs text-neutral-400 font-medium capitalize">
                                        {{ unit }}
                                    </span>
                                </div>
                                <p v-if="isOutExceedsStock" class="text-xs text-rose-500 font-medium">
                                    Jumlah barang keluar melebihi stok yang ada saat ini ({{ currentStock }} {{ unit }}).
                                </p>
                                <p v-else-if="errors?.quantity?.[0]" class="text-xs text-rose-500 font-medium">
                                    {{ errors.quantity[0] }}
                                </p>
                            </div>

                            <!-- Live Calculation Preview Card -->
                            <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                                <div class="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                                    Simulasi Perubahan Inventori
                                </div>
                                <div class="flex items-center justify-between font-mono">
                                    <div class="text-center">
                                        <span class="text-[10px] text-neutral-400">Stok Saat Ini</span>
                                        <p class="text-base font-bold text-neutral-700 dark:text-neutral-300">
                                            {{ currentStock }} <span class="text-[10px]">{{ unit }}</span>
                                        </p>
                                    </div>

                                    <div class="text-center text-xs text-neutral-400 font-bold">
                                        {{ form.type === 'in' ? '+' : form.type === 'out' ? '-' : '=' }}
                                    </div>

                                    <div class="text-center">
                                        <span class="text-[10px] text-neutral-400">Perubahan</span>
                                        <p
                                            class="text-base font-bold"
                                            :class="form.type === 'in' ? 'text-emerald-600' : form.type === 'out' ? 'text-rose-600' : 'text-blue-600'"
                                        >
                                            {{ form.type === 'in' ? `+${form.quantity}` : form.type === 'out' ? `-${form.quantity}` : form.quantity }}
                                            <span class="text-[10px]">{{ unit }}</span>
                                        </p>
                                    </div>

                                    <div class="text-center text-xs text-neutral-400 font-bold">&rarr;</div>

                                    <div class="text-center">
                                        <span class="text-[10px] text-neutral-400 font-semibold">Estimasi Stok Akhir</span>
                                        <p class="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                                            {{ resultingStock }} <span class="text-xs">{{ unit }}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Note Input -->
                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Catatan / Alasan Penyesuaian
                                </label>
                                <textarea
                                    v-model="form.note"
                                    rows="2"
                                    maxlength="255"
                                    placeholder="Misal: Restok supplier mingguan, Rusak saat pengiriman, Stock opname akhir shift"
                                    :disabled="isSubmitting"
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <!-- Footer Actions -->
                        <div class="flex shrink-0 items-center justify-end gap-2.5 border-t border-neutral-100 bg-neutral-50/50 px-6 py-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                            <button
                                type="button"
                                :disabled="isSubmitting"
                                class="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-all"
                                @click="closeModal"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                :disabled="isSubmitting || !form.product_id || !form.quantity || isOutExceedsStock"
                                class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            >
                                <Loader2 v-if="isSubmitting" class="size-3.5 animate-spin" />
                                <Check v-else class="size-3.5" />
                                <span>Simpan Penyesuaian</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
