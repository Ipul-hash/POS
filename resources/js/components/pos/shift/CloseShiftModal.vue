<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
    X,
    Lock,
    Coins,
    Banknote,
    Receipt,
    Calculator,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Check,
    Loader2,
    Printer,
} from '@lucide/vue';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import type { Shift, ShiftSummary } from '@/types';

const props = defineProps<{
    open: boolean;
    shift: Shift | null;
    summary: ShiftSummary | null;
    isProcessing: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', closingBalance: number): void;
}>();

const closingBalance = ref<number>(0);

const expectedCash = computed(() => {
    return props.summary?.expected_cash ?? 0;
});

const variance = computed(() => {
    return closingBalance.value - expectedCash.value;
});

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            // Default input to expected cash
            closingBalance.value = expectedCash.value;
        }
    }
);

function closeModal() {
    if (props.isProcessing) return;
    emit('update:open', false);
}

function handleSubmit() {
    if (closingBalance.value < 0 || props.isProcessing) return;
    emit('submit', closingBalance.value);
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
                v-if="open && shift"
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
                            <div class="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                                <Lock class="size-4.5" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Tutup Shift Kasir & Rekonsiliasi
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Hitung kas fisik laci dan selesaikan laporan penjualan
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

                    <!-- Body -->
                    <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-6 space-y-4">
                        <!-- Shift Meta Stats Grid -->
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 dark:border-neutral-800/80 dark:bg-neutral-950/40">
                                <span class="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">
                                    Modal Kas Awal
                                </span>
                                <span class="mt-1 font-mono font-bold text-neutral-800 dark:text-neutral-200 block text-sm">
                                    {{ formatRupiah(shift.opening_balance) }}
                                </span>
                            </div>

                            <div class="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 dark:border-neutral-800/80 dark:bg-neutral-950/40">
                                <span class="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">
                                    Penerimaan Kas Tunai
                                </span>
                                <span class="mt-1 font-mono font-bold text-emerald-600 dark:text-emerald-400 block text-sm">
                                    +{{ formatRupiah(summary?.total_cash_payments || 0) }}
                                </span>
                            </div>
                        </div>

                        <!-- Expected Cash Box -->
                        <div class="rounded-2xl border border-neutral-200/80 bg-neutral-900 p-4 text-white dark:border-neutral-800 dark:bg-neutral-950">
                            <div class="flex items-center justify-between font-mono">
                                <div>
                                    <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">
                                        Ekspektasi Uang Kas di Laci (Expected)
                                    </span>
                                    <span class="text-xs text-neutral-400">Modal Awal + Total Pembayaran Tunai</span>
                                </div>
                                <span class="text-xl font-black text-white">
                                    {{ formatRupiah(expectedCash) }}
                                </span>
                            </div>
                        </div>

                        <!-- Actual Closing Balance Input -->
                        <div class="space-y-1.5 pt-1">
                            <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                Hitungan Fisik Uang Kas Aktual di Laci (Actual Cash)
                            </label>
                            <div class="relative">
                                <span class="absolute left-3.5 top-2.5 font-mono text-sm font-bold text-neutral-400">
                                    Rp
                                </span>
                                <input
                                    v-model.number="closingBalance"
                                    type="number"
                                    :min="0"
                                    required
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-3.5 py-2.5 font-mono text-lg font-black text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <!-- Live Variance Box -->
                        <div
                            class="rounded-xl border p-3.5 transition-all"
                            :class="
                                variance === 0
                                    ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                                    : variance > 0
                                    ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300'
                                    : 'border-rose-200 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300'
                            "
                        >
                            <div class="flex items-center justify-between font-mono">
                                <div class="flex items-center gap-1.5 text-xs font-bold">
                                    <CheckCircle2 v-if="variance === 0" class="size-4 text-emerald-600 dark:text-emerald-400" />
                                    <AlertCircle v-else class="size-4" :class="variance > 0 ? 'text-blue-600' : 'text-rose-600'" />
                                    <span>
                                        {{ variance === 0 ? 'Kas Sesuai (Match)' : variance > 0 ? 'Kas Lebih (Surplus)' : 'Kas Kurang (Shortage)' }}
                                    </span>
                                </div>
                                <span class="text-base font-black">
                                    {{ variance >= 0 ? `+${formatRupiah(variance)}` : `-${formatRupiah(Math.abs(variance))}` }}
                                </span>
                            </div>
                        </div>

                        <p class="text-[11px] text-neutral-400 leading-relaxed">
                            Setelah tombol ditekan, shift akan ditutup secara permanen dan sistem akan meng-generate laporan penutupan shift (Z-Report).
                        </p>

                        <!-- Footer Actions -->
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
                                :disabled="isProcessing || closingBalance < 0"
                                class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 transition-all"
                            >
                                <Loader2 v-if="isProcessing" class="size-3.5 animate-spin" />
                                <Lock v-else class="size-3.5" />
                                <span>Tutup Shift & Rekap Laporan</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
