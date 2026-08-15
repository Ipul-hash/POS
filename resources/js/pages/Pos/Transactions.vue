<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import axios from 'axios';
import { toast } from 'vue-sonner';
import {
    History,
    Search,
    RefreshCw,
    Calendar,
    Receipt,
    Printer,
    Ban,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Store,
    ShoppingCart,
    ChevronRight,
    ArrowLeft,
    TrendingUp,
    DollarSign,
    Loader2,
    Lock,
    Coins,
    Clock,
    AlertCircle,
} from '@lucide/vue';
import PosReceiptModal from '@/components/pos/PosReceiptModal.vue';
import OpenShiftModal from '@/components/pos/shift/OpenShiftModal.vue';
import { useShift } from '@/composables/useShift';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import { getReceiptApi, getTransactionsApi, refundTransactionApi, voidTransactionApi } from '@/services/pos.service';
import type { BreadcrumbItem, ReceiptData, Transaction } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: '/dashboard',
            },
            {
                title: 'Kasir POS',
                href: '/pos',
            },
            {
                title: 'Riwayat Transaksi',
                href: '/pos/transactions',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    currentShift,
    isShiftActive,
    isOpenModalOpen,
    isActionLoading: isShiftActionLoading,
    fetchCurrentShift,
    openShift,
} = useShift();

const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const isReversalLoading = ref(false);

const searchQuery = ref('');
const statusFilter = ref<'all' | 'paid' | 'void' | 'refunded'>('all');
const startDate = ref('');
const endDate = ref('');

const isReceiptModalOpen = ref(false);
const activeReceiptData = ref<ReceiptData | null>(null);

const filteredTransactions = computed(() => {
    let list = [...transactions.value];

    if (statusFilter.value !== 'all') {
        list = list.filter((t) => t.status === statusFilter.value);
    }

    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim();
        list = list.filter(
            (t) =>
                t.invoice_number.toLowerCase().includes(q) ||
                (t.cashier?.name || '').toLowerCase().includes(q) ||
                (t.customer?.name || '').toLowerCase().includes(q)
        );
    }

    return list;
});

const totalRevenue = computed(() => {
    return transactions.value
        .filter((t) => t.status === 'paid')
        .reduce((acc, t) => acc + (parseFloat(String(t.grand_total)) || 0), 0);
});

const totalPaidCount = computed(() => {
    return transactions.value.filter((t) => t.status === 'paid').length;
});

const totalVoidRefundCount = computed(() => {
    return transactions.value.filter((t) => t.status === 'void' || t.status === 'refunded').length;
});

onMounted(async () => {
    await Promise.all([fetchCurrentShift(), fetchTransactions()]);
});

async function fetchTransactions() {
    isLoading.value = true;
    try {
        const params: Record<string, string> = {};
        if (startDate.value) params.start_date = startDate.value;
        if (endDate.value) params.end_date = endDate.value;

        const response = await getTransactionsApi(params);
        if (response.success) {
            transactions.value = response.data;
        } else {
            toast.error(response.message || 'Gagal memuat riwayat transaksi');
        }
    } catch {
        toast.error('Terjadi kesalahan saat memuat riwayat transaksi');
    } finally {
        isLoading.value = false;
    }
}

async function handleViewReceipt(transaction: Transaction) {
    try {
        const response = await getReceiptApi(transaction.id);
        if (response.success && response.data) {
            activeReceiptData.value = response.data;
            isReceiptModalOpen.value = true;
        }
    } catch {
        toast.error('Gagal mengambil data struk belanja');
    }
}

async function handleVoid(transaction: Transaction) {
    if (!confirm(`Batalkan transaksi ${transaction.invoice_number} (Void)? Stok barang akan dikembalikan ke inventori.`)) {
        return;
    }

    isReversalLoading.value = true;
    try {
        const response = await voidTransactionApi(transaction.id);
        if (response.success) {
            toast.success(`Transaksi ${transaction.invoice_number} berhasil dibatalkan`);
            await fetchTransactions();
        } else {
            toast.error(response.message || 'Gagal membatalkan transaksi');
        }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            toast.error(error.response?.data?.message || 'Gagal memproses pembatalan');
        }
    } finally {
        isReversalLoading.value = false;
    }
}

async function handleOpenShiftSubmit(openingBalance: number) {
    const success = await openShift(openingBalance);
    if (success) {
        await fetchTransactions();
    }
}
</script>

<template>
    <Head title="Riwayat Transaksi Kasir" />

    <div class="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Store class="size-3.5" />
                    <span>POS Kasir</span>
                    <ChevronRight class="size-3 text-neutral-400" />
                    <span class="text-neutral-900 dark:text-neutral-100">Log Penjualan</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Riwayat Transaksi Penjualan
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Pantau seluruh nota transaksi checkout kasir, cetak ulang struk, dan kelola pembatalan (void).
                </p>
            </div>

            <div class="flex items-center gap-2.5">
                <Link
                    href="/pos"
                    class="inline-flex h-9 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                >
                    <ShoppingCart class="size-3.5" />
                    <span>Buka Terminal Kasir</span>
                </Link>
            </div>
        </div>

        <!-- LOCKED STATE WHEN SHIFT IS NOT ACTIVE -->
        <div v-if="!isShiftActive" class="flex flex-1 flex-col items-center justify-center p-8 text-center my-6">
            <div class="max-w-md w-full rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 shadow-inner">
                    <Lock class="size-10" />
                </div>

                <div class="space-y-2">
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold font-mono text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        <AlertCircle class="size-3.5" />
                        Sesi Kasir Belum Dibuka
                    </span>
                    <h3 class="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        Silahkan Buka Shift Baru
                    </h3>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        Riwayat transaksi penjualan kasir terkunci saat shift belum dibuka. Buka shift kasir baru dengan memasukkan modal awal laci untuk mengaktifkan sesi kasir hari ini.
                    </p>
                </div>

                <div class="pt-2 flex flex-col gap-2.5">
                    <button
                        type="button"
                        class="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all cursor-pointer"
                        @click="isOpenModalOpen = true"
                    >
                        <Coins class="size-4.5" />
                        <span>Buka Shift Kasir Baru</span>
                    </button>

                    <Link
                        href="/pos/shifts"
                        class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    >
                        <Clock class="size-3.5 text-neutral-500" />
                        <span>Buka Menu Shift & Histori</span>
                    </Link>
                </div>
            </div>
        </div>

        <!-- ACTIVE TRANSACTIONS VIEW -->
        <template v-else>
            <!-- 3 KPI Metric Cards -->
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Total Omzet Penjualan (Paid)
                    </span>
                    <div class="mt-2 flex items-baseline gap-2">
                        <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                            {{ formatRupiah(totalRevenue) }}
                        </span>
                    </div>
                    <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span class="size-1.5 rounded-full bg-emerald-500"></span>
                        <span>Total penerimaan kasir berhasil</span>
                    </div>
                </div>

                <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Transaksi Berhasil (Paid)
                    </span>
                    <div class="mt-2 flex items-baseline gap-2">
                        <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                            {{ totalPaidCount }}
                        </span>
                        <span class="text-[11px] text-neutral-400 font-medium">nota selesai</span>
                    </div>
                    <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span class="size-1.5 rounded-full bg-emerald-500"></span>
                        <span>Stok fisik otomatis dipotong</span>
                    </div>
                </div>

                <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Transaksi Batal (Void / Refund)
                    </span>
                    <div class="mt-2 flex items-baseline gap-2">
                        <span
                            class="text-2xl font-bold tracking-tight font-mono"
                            :class="totalVoidRefundCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-100'"
                        >
                            {{ totalVoidRefundCount }}
                        </span>
                        <span class="text-[11px] text-neutral-400 font-medium">nota dibatalkan</span>
                    </div>
                    <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span class="size-1.5 rounded-full" :class="totalVoidRefundCount > 0 ? 'bg-rose-500' : 'bg-neutral-400'"></span>
                        <span>Stok telah dikembalikan</span>
                    </div>
                </div>
            </div>

            <!-- Filter & Table Card -->
            <div class="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
                <!-- Toolbar -->
                <div class="flex flex-col gap-3.5 p-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-950/20">
                    <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex flex-wrap items-center gap-2">
                            <!-- Search Bar -->
                            <div class="relative w-full sm:w-72">
                                <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                                <input
                                    v-model="searchQuery"
                                    type="search"
                                    placeholder="Cari No. Nota, Kasir, Pelanggan..."
                                    class="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                />
                            </div>

                            <!-- Date Filters -->
                            <div class="flex items-center gap-1.5 text-xs text-neutral-500">
                                <input
                                    v-model="startDate"
                                    type="date"
                                    class="h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                    @change="fetchTransactions"
                                />
                                <span>s/d</span>
                                <input
                                    v-model="endDate"
                                    type="date"
                                    class="h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                    @change="fetchTransactions"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            :disabled="isLoading"
                            class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                            @click="fetchTransactions"
                        >
                            <RefreshCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
                            <span>Sinkronkan</span>
                        </button>
                    </div>

                    <!-- Status Filter Tabs -->
                    <div class="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                            :class="
                                statusFilter === 'all'
                                    ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800'
                            "
                            @click="statusFilter = 'all'"
                        >
                            Semua Status ({{ transactions.length }})
                        </button>
                        <button
                            type="button"
                            class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                            :class="
                                statusFilter === 'paid'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-neutral-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                            "
                            @click="statusFilter = 'paid'"
                        >
                            Berhasil / Paid ({{ totalPaidCount }})
                        </button>
                        <button
                            type="button"
                            class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                            :class="
                                statusFilter === 'void'
                                    ? 'bg-neutral-600 text-white shadow-xs'
                                    : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800'
                            "
                            @click="statusFilter = 'void'"
                        >
                            Void / Batal
                        </button>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="p-6 space-y-3">
                    <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
                </div>

                <!-- Table View -->
                <div v-else-if="filteredTransactions.length > 0" class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="border-b border-neutral-200/80 bg-neutral-50/60 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                            <tr>
                                <th class="px-4 py-3">No. Nota & Waktu</th>
                                <th class="px-4 py-3">Kasir & Pelanggan</th>
                                <th class="px-4 py-3">Item Ringkasan</th>
                                <th class="px-4 py-3 text-right">Grand Total</th>
                                <th class="px-4 py-3 text-center">Status</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                            <tr
                                v-for="item in filteredTransactions"
                                :key="item.id"
                                class="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors group"
                            >
                                <!-- Invoice & Time -->
                                <td class="px-4 py-3.5 font-mono text-xs">
                                    <div class="font-bold text-neutral-900 dark:text-neutral-100">
                                        {{ item.invoice_number }}
                                    </div>
                                    <div class="text-[11px] text-neutral-400">
                                        {{ formatDateTime(item.created_at) }}
                                    </div>
                                </td>

                                <!-- Cashier & Customer -->
                                <td class="px-4 py-3.5">
                                    <div class="font-semibold text-neutral-800 dark:text-neutral-200">
                                        {{ item.cashier?.name || 'Kasir' }}
                                    </div>
                                    <div class="text-[11px] text-neutral-400">
                                        {{ item.customer?.name ? `Member: ${item.customer.name}` : 'Non-Member' }}
                                    </div>
                                </td>

                                <!-- Items Summary -->
                                <td class="px-4 py-3.5 text-xs text-neutral-600 dark:text-neutral-400 max-w-xs truncate">
                                    <span v-if="item.items && item.items.length > 0">
                                        {{ item.items.map((i) => `${i.product?.name || 'Produk'} (${i.quantity}x)`).join(', ') }}
                                    </span>
                                    <span v-else class="text-neutral-400">-</span>
                                </td>

                                <!-- Grand Total -->
                                <td class="px-4 py-3.5 text-right font-mono text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                                    {{ formatRupiah(item.grand_total) }}
                                </td>

                                <!-- Status Badge -->
                                <td class="px-4 py-3.5 text-center">
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                        :class="
                                            item.status === 'paid'
                                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                        "
                                    >
                                        <CheckCircle2 v-if="item.status === 'paid'" class="size-3" />
                                        <XCircle v-else class="size-3" />
                                        {{ item.status === 'paid' ? 'Paid' : item.status === 'void' ? 'Void' : 'Refunded' }}
                                    </span>
                                </td>

                                <!-- Actions -->
                                <td class="px-4 py-3.5 text-right">
                                    <div class="inline-flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
                                            @click="handleViewReceipt(item)"
                                        >
                                            <Printer class="size-3 text-neutral-400" />
                                            <span>Struk</span>
                                        </button>

                                        <button
                                            v-if="item.status === 'paid'"
                                            type="button"
                                            :disabled="isReversalLoading"
                                            class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors shadow-2xs"
                                            title="Batalkan Transaksi (Void)"
                                            @click="handleVoid(item)"
                                        >
                                            <Ban class="size-3" />
                                            <span>Void</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Empty State -->
                <div v-else class="flex flex-col items-center justify-center p-12 text-center">
                    <Receipt class="size-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                    <h4 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        Belum Ada Riwayat Transaksi
                    </h4>
                    <p class="text-xs text-neutral-400 mt-0.5">
                        Transaksi checkout kasir yang telah diproses akan muncul di daftar ini.
                    </p>
                </div>
            </div>
        </template>
    </div>

    <!-- Receipt Modal -->
    <PosReceiptModal
        v-model:open="isReceiptModalOpen"
        :receipt-data="activeReceiptData"
        @new-transaction="isReceiptModalOpen = false"
    />

    <!-- Open Shift Modal -->
    <OpenShiftModal
        v-model:open="isOpenModalOpen"
        :is-processing="isShiftActionLoading"
        @submit="handleOpenShiftSubmit"
    />
</template>
