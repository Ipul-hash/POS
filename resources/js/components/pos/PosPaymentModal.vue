<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
    X,
    Check,
    Loader2,
    Banknote,
    QrCode,
    CreditCard,
    Smartphone,
    ArrowRight,
    Calculator,
    AlertCircle,
    Receipt,
} from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { PaymentMethod, PaymentPayload } from '@/types';

const props = defineProps<{
    open: boolean;
    grandTotal: number;
    isProcessing: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', payments: PaymentPayload[]): void;
}>();

const selectedMethod = ref<PaymentMethod>('cash');
const cashReceived = ref<number>(0);
const referenceNo = ref<string>('');

// Presets for quick cash buttons
const quickCashPresets = computed(() => {
    const total = props.grandTotal;
    const presets: { label: string; value: number }[] = [
        { label: 'Uang Pas', value: total },
    ];

    const standardDenominations = [20000, 50000, 100000, 200000, 500000];
    standardDenominations.forEach((d) => {
        if (d > total && !presets.some((p) => p.value === d)) {
            presets.push({ label: formatRupiah(d), value: d });
        }
    });

    // If total rounded up to next 10k/50k
    const nextTenK = Math.ceil(total / 10000) * 10000;
    if (nextTenK > total && !presets.some((p) => p.value === nextTenK)) {
        presets.push({ label: formatRupiah(nextTenK), value: nextTenK });
    }

    return presets.slice(0, 5);
});

const changeAmount = computed(() => {
    if (selectedMethod.value !== 'cash') return 0;
    return Math.max(0, cashReceived.value - props.grandTotal);
});

const isCashInsufficient = computed(() => {
    if (selectedMethod.value !== 'cash') return false;
    return cashReceived.value < props.grandTotal;
});

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            selectedMethod.value = 'cash';
            cashReceived.value = props.grandTotal;
            referenceNo.value = '';
        }
    }
);

function setCashAmount(val: number) {
    cashReceived.value = val;
}

function closeModal() {
    if (props.isProcessing) return;
    emit('update:open', false);
}

function handleProcessPayment() {
    if (props.isProcessing) return;

    if (selectedMethod.value === 'cash' && isCashInsufficient.value) {
        return;
    }

    const amount = selectedMethod.value === 'cash' ? cashReceived.value : props.grandTotal;

    emit('submit', [
        {
            method: selectedMethod.value,
            amount: props.grandTotal, // We record grand_total for the payment row, change is handled by cashier
            reference_no: referenceNo.value.trim() || null,
        },
    ]);
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
                                <CreditCard class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Pembayaran Kasir POS
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Pilih metode pembayaran pelanggan
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

                    <!-- Grand Total Banner -->
                    <div class="border-b border-neutral-100 bg-neutral-900 p-5 text-white dark:border-neutral-800 dark:bg-neutral-950">
                        <div class="flex items-center justify-between font-mono">
                            <span class="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                                Total Tagihan
                            </span>
                            <span class="text-2xl font-extrabold text-white">
                                {{ formatRupiah(grandTotal) }}
                            </span>
                        </div>
                    </div>

                    <!-- Body -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-5">
                        <!-- Payment Method Tabs (4 options) -->
                        <div class="space-y-2">
                            <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                Metode Pembayaran
                            </label>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <button
                                    type="button"
                                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                                    :class="
                                        selectedMethod === 'cash'
                                            ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/80 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-2xs'
                                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                    "
                                    @click="selectedMethod = 'cash'"
                                >
                                    <Banknote class="size-4.5" />
                                    <span class="text-xs">Tunai (Cash)</span>
                                </button>

                                <button
                                    type="button"
                                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                                    :class="
                                        selectedMethod === 'qris'
                                            ? 'border-indigo-500 bg-indigo-50/80 text-indigo-900 dark:border-indigo-500/80 dark:bg-indigo-950/50 dark:text-indigo-300 font-bold shadow-2xs'
                                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                    "
                                    @click="selectedMethod = 'qris'"
                                >
                                    <QrCode class="size-4.5" />
                                    <span class="text-xs">QRIS</span>
                                </button>

                                <button
                                    type="button"
                                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                                    :class="
                                        selectedMethod === 'debit'
                                            ? 'border-blue-500 bg-blue-50/80 text-blue-900 dark:border-blue-500/80 dark:bg-blue-950/50 dark:text-blue-300 font-bold shadow-2xs'
                                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                    "
                                    @click="selectedMethod = 'debit'"
                                >
                                    <CreditCard class="size-4.5" />
                                    <span class="text-xs">Kartu Debit</span>
                                </button>

                                <button
                                    type="button"
                                    class="flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all"
                                    :class="
                                        selectedMethod === 'ewallet'
                                            ? 'border-amber-500 bg-amber-50/80 text-amber-900 dark:border-amber-500/80 dark:bg-amber-950/50 dark:text-amber-300 font-bold shadow-2xs'
                                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                    "
                                    @click="selectedMethod = 'ewallet'"
                                >
                                    <Smartphone class="size-4.5" />
                                    <span class="text-xs">E-Wallet</span>
                                </button>
                            </div>
                        </div>

                        <!-- CASH METHOD SECTION -->
                        <div v-if="selectedMethod === 'cash'" class="space-y-4">
                            <!-- Quick Cash Shortcuts -->
                            <div class="space-y-1.5">
                                <span class="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                                    Pilihan Cepat Nominal Uang Diterima
                                </span>
                                <div class="flex flex-wrap gap-1.5">
                                    <button
                                        v-for="preset in quickCashPresets"
                                        :key="preset.value"
                                        type="button"
                                        class="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-xs font-bold text-neutral-800 hover:bg-neutral-100 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 transition-all"
                                        :class="{ 'border-neutral-900 bg-white dark:border-neutral-100': cashReceived === preset.value }"
                                        @click="setCashAmount(preset.value)"
                                    >
                                        {{ preset.label }}
                                    </button>
                                </div>
                            </div>

                            <!-- Cash Received Input -->
                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Jumlah Uang Diterima (Cash In)
                                </label>
                                <div class="relative">
                                    <span class="absolute left-3.5 top-2.5 font-mono text-sm font-bold text-neutral-400">
                                        Rp
                                    </span>
                                    <input
                                        v-model.number="cashReceived"
                                        type="number"
                                        :min="0"
                                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-3.5 py-2 font-mono text-lg font-extrabold text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                        :class="{ '!border-rose-500': isCashInsufficient }"
                                    />
                                </div>
                                <p v-if="isCashInsufficient" class="text-xs text-rose-500 font-medium">
                                    Jumlah uang tunai kurang {{ formatRupiah(grandTotal - cashReceived) }}.
                                </p>
                            </div>

                            <!-- Live Change Box -->
                            <div class="rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                                <div class="flex items-center justify-between font-mono">
                                    <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                                        Uang Kembalian (Change)
                                    </span>
                                    <span class="text-xl font-black text-emerald-700 dark:text-emerald-300">
                                        {{ formatRupiah(changeAmount) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- QRIS / NON-CASH SECTION -->
                        <div v-else-if="selectedMethod === 'qris'" class="space-y-4 text-center">
                            <div class="mx-auto flex size-44 items-center justify-center rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-950">
                                <QrCode class="size-36 text-neutral-900 dark:text-neutral-100" />
                            </div>
                            <p class="text-xs text-neutral-500">
                                Scan kode QRIS statis outlet dengan aplikasi BCA, GoPay, OVO, Dana, atau ShopeePay.
                            </p>
                            <div>
                                <input
                                    v-model="referenceNo"
                                    type="text"
                                    placeholder="No. Referensi / ID Transaksi QRIS (Opsional)"
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                />
                            </div>
                        </div>

                        <!-- CARD / EWALLET SECTION -->
                        <div v-else class="space-y-3">
                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Nomor Referensi EDC / Approval Code
                                </label>
                                <input
                                    v-model="referenceNo"
                                    type="text"
                                    placeholder="Misal: TRACE-889123 / APPROV-OK"
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-4 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                        <button
                            type="button"
                            :disabled="isProcessing"
                            class="h-10 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                            @click="closeModal"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            :disabled="isProcessing || isCashInsufficient"
                            class="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-xs font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            @click="handleProcessPayment"
                        >
                            <Loader2 v-if="isProcessing" class="size-4 animate-spin" />
                            <Check v-else class="size-4" />
                            <span>Selesaikan Transaksi</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
