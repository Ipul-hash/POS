<script setup lang="ts">
import { ref, watch } from 'vue';
import {
    X,
    Coins,
    Banknote,
    Clock,
    User,
    Check,
    Loader2,
    Store,
    Sparkles,
} from '@lucide/vue';
import { formatDateTime, formatRupiah } from '@/lib/formatters';

const props = defineProps<{
    open: boolean;
    isProcessing: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', openingBalance: number): void;
}>();

const openingBalance = ref<number>(100000); // Default Rp 100.000 modal awal laci
const presets = [50000, 100000, 200000, 500000, 1000000];

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            openingBalance.value = 100000;
        }
    }
);

function setPreset(val: number) {
    openingBalance.value = val;
}

function closeModal() {
    if (props.isProcessing) return;
    emit('update:open', false);
}

function handleSubmit() {
    if (openingBalance.value < 0 || props.isProcessing) return;
    emit('submit', openingBalance.value);
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
                    class="relative my-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                                <Coins class="size-4.5" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Buka Shift Kasir Baru
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Mulai sesi operasional kasir harian
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            :disabled="isProcessing"
                            @click="closeModal"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <!-- Form Body -->
                    <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4">
                        <div class="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/40 text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5">
                            <div class="flex items-center justify-between">
                                <span class="text-neutral-500">Waktu Pembukaan:</span>
                                <span class="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                                    {{ formatDateTime(new Date().toISOString()) }}
                                </span>
                            </div>
                            <p class="text-[11px] text-neutral-400 pt-1 border-t border-neutral-200/60 dark:border-neutral-800">
                                Masukkan jumlah uang tunai fisik yang ada di dalam laci kasir (kas awal / uang kembalian).
                            </p>
                        </div>

                        <!-- Opening Balance Input -->
                        <div class="space-y-1.5">
                            <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                Saldo Kas Awal Laci (Opening Cash)
                            </label>
                            <div class="relative">
                                <span class="absolute left-3.5 top-2.5 font-mono text-sm font-bold text-neutral-400">
                                    Rp
                                </span>
                                <input
                                    v-model.number="openingBalance"
                                    type="number"
                                    :min="0"
                                    required
                                    autofocus
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-3.5 py-2.5 font-mono text-lg font-black text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <!-- Presets -->
                        <div class="space-y-1.5">
                            <span class="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                                Pilihan Cepat Nominal Modal Awal
                            </span>
                            <div class="flex flex-wrap gap-1.5">
                                <button
                                    v-for="val in presets"
                                    :key="val"
                                    type="button"
                                    class="rounded-xl border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-mono text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-all"
                                    :class="{ 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-200': openingBalance === val }"
                                    @click="setPreset(val)"
                                >
                                    {{ formatRupiah(val) }}
                                </button>
                            </div>
                        </div>

                        <!-- Submit Footer -->
                        <div class="flex shrink-0 items-center justify-between border-t border-neutral-100 pt-4 mt-6 dark:border-neutral-800/80">
                            <button
                                type="button"
                                :disabled="isProcessing"
                                class="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                                @click="closeModal"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                :disabled="isProcessing || openingBalance < 0"
                                class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-xs font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            >
                                <Loader2 v-if="isProcessing" class="size-3.5 animate-spin" />
                                <Check v-else class="size-3.5" />
                                <span>Buka Shift Sekarang</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
