<script setup lang="ts">
import { computed } from 'vue';
import {
    X,
    Printer,
    CheckCircle2,
    Coins,
    Receipt,
    Store,
    Clock,
    User,
    AlertCircle,
    Calendar,
    FileText,
} from '@lucide/vue';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import type { ShiftDetailResponse } from '@/types';

const props = defineProps<{
    open: boolean;
    reportData: ShiftDetailResponse | null;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const shift = computed(() => props.reportData?.shift);
const summary = computed(() => props.reportData?.summary);
const store = computed(() => props.reportData?.store);

function handlePrint() {
    window.print();
}

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
                v-if="open && reportData && shift && summary"
                class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white"
            >
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity print:hidden"
                    @click="closeModal"
                ></div>

                <div
                    class="relative my-auto flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900 print:max-w-none print:shadow-none print:border-none print:rounded-none"
                >
                    <!-- Header Bar (Hidden on print) -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800/80 print:hidden">
                        <div class="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs">
                            <FileText class="size-4 text-neutral-500" />
                            <span>Laporan Penutupan Shift (Z-Report)</span>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 transition-colors"
                            @click="closeModal"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <!-- Printable Z-Report Sheet Container -->
                    <div class="flex-1 overflow-y-auto p-6 font-mono text-xs text-neutral-900 dark:text-neutral-100 print:p-2">
                        <div id="shift-z-report" class="space-y-3">
                            <!-- Store Brand Header -->
                            <div class="text-center space-y-1">
                                <h2 class="text-base font-black uppercase tracking-wider">
                                    {{ store?.name || 'POS NUSANTARA OUTLET' }}
                                </h2>
                                <p class="text-[10px] text-neutral-500">
                                    {{ store?.address || 'Jl. Sudirman No. 88, Jakarta Pusat' }}
                                </p>
                                <div class="inline-block mt-1 border-y border-neutral-300 dark:border-neutral-700 py-1 px-3">
                                    <h3 class="text-xs font-black uppercase tracking-widest">
                                        LAPORAN PENUTUPAN SHIFT (Z-REPORT)
                                    </h3>
                                </div>
                            </div>

                            <!-- Shift Meta Info -->
                            <div class="text-[11px] space-y-1 pt-1">
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">ID Shift:</span>
                                    <span class="font-bold">#{{ shift.id }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Kasir Bertugas:</span>
                                    <span class="font-bold">{{ shift.cashier?.name || 'Kasir #1' }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Waktu Buka:</span>
                                    <span>{{ formatDateTime(shift.opened_at) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Waktu Tutup:</span>
                                    <span>{{ formatDateTime(shift.closed_at) }}</span>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Ringkasan Penjualan -->
                            <div class="text-[11px] space-y-1">
                                <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                    [ RINGKASAN PENJUALAN ]
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Total Transaksi Berhasil:</span>
                                    <span class="font-bold">{{ summary.total_transactions_count }} Nota</span>
                                </div>
                                <div v-if="summary.void_transactions_count" class="flex justify-between text-rose-600">
                                    <span>Transaksi Dibatalkan (Void):</span>
                                    <span>{{ summary.void_transactions_count }} Nota</span>
                                </div>
                                <div class="flex justify-between font-bold text-xs pt-1 border-t border-neutral-200 dark:border-neutral-800">
                                    <span>TOTAL OMZET PENJUALAN:</span>
                                    <span>{{ formatRupiah(summary.total_sales) }}</span>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Rincian Pembayaran Per Metode -->
                            <div class="text-[11px] space-y-1">
                                <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                    [ RINCIAN METODE PEMBAYARAN ]
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">1. Tunai (Cash):</span>
                                    <span class="font-bold">{{ formatRupiah(summary.payments_by_method?.cash || 0) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">2. QRIS:</span>
                                    <span>{{ formatRupiah(summary.payments_by_method?.qris || 0) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">3. Kartu Debit:</span>
                                    <span>{{ formatRupiah(summary.payments_by_method?.debit || 0) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">4. E-Wallet:</span>
                                    <span>{{ formatRupiah(summary.payments_by_method?.ewallet || 0) }}</span>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Rekonsiliasi Kas Fisik Laci -->
                            <div class="text-[11px] space-y-1">
                                <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                                    [ REKONSILIASI KAS LACI FISIK ]
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Modal Kas Awal:</span>
                                    <span>{{ formatRupiah(summary.opening_balance) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Total Kas Masuk (Tunai):</span>
                                    <span>+{{ formatRupiah(summary.total_cash_payments) }}</span>
                                </div>
                                <div class="flex justify-between font-bold pt-1 border-t border-neutral-200 dark:border-neutral-800">
                                    <span>Ekspektasi Kas Laci:</span>
                                    <span>{{ formatRupiah(summary.expected_cash) }}</span>
                                </div>
                                <div class="flex justify-between font-bold">
                                    <span>Kas Akhir Aktual (Dihitung):</span>
                                    <span>{{ formatRupiah(summary.closing_balance || 0) }}</span>
                                </div>
                                <div
                                    class="flex justify-between font-bold pt-1 border-t border-dashed"
                                    :class="
                                        summary.cash_variance === 0
                                            ? 'text-emerald-600'
                                            : (summary.cash_variance ?? 0) > 0
                                            ? 'text-blue-600'
                                            : 'text-rose-600'
                                    "
                                >
                                    <span>SELISIH KAS (VARIANCE):</span>
                                    <span>
                                        {{
                                            summary.cash_variance === 0
                                                ? 'Rp 0 (Pas)'
                                                : (summary.cash_variance ?? 0) > 0
                                                ? `+${formatRupiah(summary.cash_variance)} (Surplus)`
                                                : `-${formatRupiah(Math.abs(summary.cash_variance ?? 0))} (Shortage)`
                                        }}
                                    </span>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-4"></div>

                            <!-- Signatures Block -->
                            <div class="grid grid-cols-2 gap-4 text-center pt-2 text-[10px]">
                                <div class="space-y-8">
                                    <p class="text-neutral-500">Kasir Bertugas</p>
                                    <p class="font-bold underline">({{ shift.cashier?.name || 'Kasir' }})</p>
                                </div>
                                <div class="space-y-8">
                                    <p class="text-neutral-500">Supervisor / Owner</p>
                                    <p class="font-bold underline">(.........................)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Action Buttons (Hidden on print) -->
                    <div class="flex shrink-0 items-center justify-between gap-2 border-t border-neutral-100 bg-neutral-50/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-950/40 print:hidden">
                        <button
                            type="button"
                            class="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all shadow-2xs"
                            @click="handlePrint"
                        >
                            <Printer class="size-3.5" />
                            <span>Cetak Laporan (Z-Report)</span>
                        </button>
                        <button
                            type="button"
                            class="inline-flex h-9 items-center justify-center rounded-xl bg-neutral-900 px-5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            @click="closeModal"
                        >
                            <span>Tutup</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
