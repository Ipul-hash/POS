<script setup lang="ts">
import { AlertTriangle, Loader2, X } from '@lucide/vue';
import type { Discount } from '@/types';

const props = defineProps<{
    open: boolean;
    discount: Discount | null;
    isDeleting: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'confirm'): void;
}>();

function closeModal() {
    if (props.isDeleting) return;
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
                    class="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div class="flex items-start gap-4">
                        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                            <AlertTriangle class="size-5" />
                        </div>
                        <div class="flex-1">
                            <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-100">
                                Nonaktifkan Diskon?
                            </h3>
                            <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                Apakah Anda yakin ingin menonaktifkan aturan promo
                                <strong class="text-neutral-900 dark:text-neutral-100">"{{ discount?.name }}"</strong>?
                                Diskon ini tidak akan lagi otomatis terpotong saat transaksi kasir.
                            </p>
                        </div>
                    </div>

                    <div class="mt-6 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            :disabled="isDeleting"
                            class="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                            @click="closeModal"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            :disabled="isDeleting"
                            class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 transition-all"
                            @click="emit('confirm')"
                        >
                            <Loader2 v-if="isDeleting" class="size-3.5 animate-spin" />
                            <span>Nonaktifkan Diskon</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
