<script setup lang="ts">
import { AlertTriangle, Trash2, Loader2, X } from '@lucide/vue';
import type { Product } from '@/types';

const props = defineProps<{
    open: boolean;
    product: Product | null;
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'confirm'): void;
}>();

function closeModal() {
    if (props.isSubmitting) return;
    emit('update:open', false);
}

function handleConfirm() {
    emit('confirm');
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
                    class="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div class="flex items-start gap-4">
                        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                            <Trash2 class="size-5" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Hapus Master Produk
                            </h3>
                            <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Konfirmasi penghapusan produk
                                <span class="font-bold text-neutral-900 dark:text-neutral-100">
                                    "{{ product?.name }}" ({{ product?.sku }})
                                </span>
                            </p>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800"
                            :disabled="isSubmitting"
                            @click="closeModal"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <div
                        class="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3.5 text-xs text-neutral-600 dark:border-neutral-800/80 dark:bg-neutral-950/50 dark:text-neutral-400 space-y-1.5"
                    >
                        <div class="flex items-center gap-1.5 font-bold text-neutral-800 dark:text-neutral-200">
                            <AlertTriangle class="size-3.5 text-amber-500" />
                            <span>Proteksi Integritas Transaksi</span>
                        </div>
                        <p class="text-[11px] leading-relaxed">
                            Jika produk belum pernah digunakan dalam transaksi kasir, produk akan dihapus permanen. Jika sudah tercatat dalam riwayat penjualan, statusnya akan dialihkan menjadi <strong>Nonaktif</strong> secara otomatis demi menjaga keaslian laporan.
                        </p>
                    </div>

                    <div class="mt-6 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            :disabled="isSubmitting"
                            class="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                            @click="closeModal"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            :disabled="isSubmitting"
                            class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 transition-all"
                            @click="handleConfirm"
                        >
                            <Loader2 v-if="isSubmitting" class="size-3.5 animate-spin" />
                            <span>Hapus Produk</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
