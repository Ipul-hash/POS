<script setup lang="ts">
import { computed } from 'vue';
import {
    X,
    Printer,
    CheckCircle2,
    Plus,
    Receipt,
    Store,
    Clock,
    User,
} from '@lucide/vue';
import { formatDate, formatDateTime, formatRupiah } from '@/lib/formatters';
import type { ReceiptData } from '@/types';

const props = defineProps<{
    open: boolean;
    receiptData: ReceiptData | null;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'newTransaction'): void;
}>();

const store = computed(() => props.receiptData?.store);
const transaction = computed(() => props.receiptData?.transaction);

function handlePrint() {
    window.print();
}

function handleNewTransaction() {
    emit('update:open', false);
    emit('newTransaction');
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
                v-if="open && receiptData"
                class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white"
            >
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity print:hidden"
                    @click="handleNewTransaction"
                ></div>

                <div
                    class="relative my-auto flex max-h-[92vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900 print:max-w-none print:shadow-none print:border-none print:rounded-none"
                >
                    <!-- Header Action Bar (Hidden on print) -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-4 py-3 dark:border-neutral-800/80 print:hidden">
                        <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <CheckCircle2 class="size-4" />
                            <span>Transaksi Selesai</span>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 transition-colors"
                            @click="handleNewTransaction"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <!-- Thermal Receipt Paper Container -->
                    <div class="flex-1 overflow-y-auto p-6 font-mono text-xs text-neutral-900 dark:text-neutral-100 print:p-2">
                        <div id="thermal-receipt" class="space-y-3">
                            <!-- Store Brand Header -->
                            <div class="text-center space-y-1">
                                <h2 class="text-base font-black uppercase tracking-wider">
                                    {{ store?.name || 'POS NUSANTARA OUTLET' }}
                                </h2>
                                <p class="text-[10px] text-neutral-500">
                                    {{ store?.address || 'Jl. Sudirman No. 88, Jakarta Pusat' }}
                                </p>
                                <p class="text-[10px] text-neutral-500">
                                    Telp: {{ store?.phone || '0812-3456-7890' }}
                                </p>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Invoice & Cashier Meta -->
                            <div class="text-[11px] space-y-0.5">
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">No. Nota:</span>
                                    <span class="font-bold">{{ transaction?.invoice_number }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Waktu:</span>
                                    <span>{{ formatDateTime(transaction?.created_at) }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Kasir:</span>
                                    <span>{{ transaction?.cashier?.name || 'Kasir #1' }}</span>
                                </div>
                                <div v-if="transaction?.customer" class="flex justify-between">
                                    <span class="text-neutral-500">Pelanggan:</span>
                                    <span>{{ transaction.customer.name }}</span>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Line Items -->
                            <div class="space-y-2">
                                <div
                                    v-for="item in transaction?.items"
                                    :key="item.id"
                                    class="text-[11px]"
                                >
                                    <div class="font-bold">
                                        {{ item.product?.name || 'Produk' }}
                                    </div>
                                    <div class="flex justify-between text-neutral-600 dark:text-neutral-400">
                                        <span>
                                            {{ item.quantity }} x {{ formatRupiah(item.price) }}
                                            <span v-if="Number(item.discount) > 0" class="text-rose-500">
                                                (-{{ formatRupiah(item.discount) }})
                                            </span>
                                        </span>
                                        <span class="font-bold text-neutral-900 dark:text-neutral-100">
                                            {{ formatRupiah(item.subtotal) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Totals Breakdown -->
                            <div class="text-[11px] space-y-1">
                                <div class="flex justify-between">
                                    <span class="text-neutral-500">Subtotal:</span>
                                    <span>{{ formatRupiah(transaction?.subtotal) }}</span>
                                </div>
                                <div
                                    v-if="Number(transaction?.discount_total) > 0"
                                    class="flex justify-between text-rose-600 dark:text-rose-400"
                                >
                                    <span>Diskon Transaksi:</span>
                                    <span>-{{ formatRupiah(transaction?.discount_total) }}</span>
                                </div>
                                <div
                                    v-if="Number(transaction?.tax_total) > 0"
                                    class="flex justify-between"
                                >
                                    <span class="text-neutral-500">Pajak (PPN):</span>
                                    <span>+{{ formatRupiah(transaction?.tax_total) }}</span>
                                </div>
                                <div class="flex justify-between text-xs font-black pt-1 border-t border-neutral-200 dark:border-neutral-800">
                                    <span>TOTAL:</span>
                                    <span>{{ formatRupiah(transaction?.grand_total) }}</span>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Payment Breakdown -->
                            <div class="text-[11px] space-y-1">
                                <div
                                    v-for="p in transaction?.payments"
                                    :key="p.id"
                                    class="flex justify-between capitalize"
                                >
                                    <span class="text-neutral-500">Metode ({{ p.method }}):</span>
                                    <span>{{ formatRupiah(p.amount) }}</span>
                                </div>
                            </div>

                            <!-- Divider -->
                            <div class="border-t border-dashed border-neutral-300 dark:border-neutral-700 my-2"></div>

                            <!-- Footer Thank You -->
                            <div class="text-center pt-2 space-y-1 text-[10px] text-neutral-500">
                                <p class="font-bold uppercase tracking-wider">
                                    *** TERIMA KASIH ***
                                </p>
                                <p>Silakan Berkunjung Kembali</p>
                                <p class="text-[9px]">Sistem Kasir Modern POS Nusantara</p>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Action Buttons (Hidden on print) -->
                    <div class="flex shrink-0 items-center justify-between gap-2 border-t border-neutral-100 bg-neutral-50/80 p-4 dark:border-neutral-800/80 dark:bg-neutral-950/40 print:hidden">
                        <button
                            type="button"
                            class="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-700 hover:bg-neutral-100 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                            @click="handlePrint"
                        >
                            <Printer class="size-3.5" />
                            <span>Cetak Struk</span>
                        </button>
                        <button
                            type="button"
                            class="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            @click="handleNewTransaction"
                        >
                            <Plus class="size-3.5" />
                            <span>Transaksi Baru</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
