<script setup lang="ts">
import { computed } from 'vue';
import { AlertCircle, Trash2, Loader2, X } from '@lucide/vue';
import type { Category } from '@/types';

const props = defineProps<{
    open: boolean;
    category: Category | null;
    isSubmitting: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'confirm'): void;
}>();

const productCount = computed(() => props.category?.products?.length ?? 0);
const hasProducts = computed(() => productCount.value > 0);

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
                                Hapus Kategori Produk
                            </h3>
                            <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                Konfirmasi penghapusan data kategori
                                <span class="font-bold text-neutral-900 dark:text-neutral-100">
                                    "{{ category?.name }}"
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
                        v-if="hasProducts"
                        class="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 space-y-1"
                    >
                        <div class="flex items-center gap-1.5 font-bold">
                            <AlertCircle class="size-3.5" />
                            <span>Peringatan Relasi Data</span>
                        </div>
                        <p class="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400">
                            Kategori ini masih menampung {{ productCount }} produk. Sistem database POS memblokir penghapusan kategori yang masih memiliki produk aktif.
                        </p>
                    </div>

                    <div
                        v-else
                        class="mt-4 rounded-xl border border-neutral-100 bg-neutral-50 p-3 text-[11px] text-neutral-500 dark:border-neutral-800/80 dark:bg-neutral-950/50 dark:text-neutral-400"
                    >
                        Tindakan ini permanen. Data kategori akan dihapus dari seluruh filter pencarian kasir.
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
                            <span>Hapus Kategori</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
