<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import {
    Coins,
    Clock,
    Lock,
    Unlock,
    RefreshCw,
    Search,
    Calendar,
    Printer,
    FileText,
    Receipt,
    Store,
    ShoppingCart,
    ChevronRight,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    XCircle,
    Plus,
    User,
} from '@lucide/vue';
import CloseShiftModal from '@/components/pos/shift/CloseShiftModal.vue';
import OpenShiftModal from '@/components/pos/shift/OpenShiftModal.vue';
import ShiftReportModal from '@/components/pos/shift/ShiftReportModal.vue';
import { useShift } from '@/composables/useShift';
import { formatDate, formatDateTime, formatRupiah } from '@/lib/formatters';
import type { BreadcrumbItem } from '@/types';

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
                title: 'Manajemen Shift',
                href: '/pos/shifts',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    currentShift,
    currentShiftSummary,
    shiftsHistory,
    selectedShiftDetail,
    isLoading,
    isActionLoading,
    isOpenModalOpen,
    isCloseModalOpen,
    isReportModalOpen,
    isShiftActive,
    fetchCurrentShift,
    fetchShiftsHistory,
    openShift,
    closeShift,
    fetchShiftReport,
} = useShift();

const statusFilter = ref<'all' | 'open' | 'closed'>('all');
const startDate = ref('');
const endDate = ref('');

const filteredShifts = computed(() => {
    let list = [...shiftsHistory.value];

    if (statusFilter.value === 'open') {
        list = list.filter((s) => !s.closed_at);
    } else if (statusFilter.value === 'closed') {
        list = list.filter((s) => !!s.closed_at);
    }

    return list;
});

const totalClosedShifts = computed(() => {
    return shiftsHistory.value.filter((s) => !!s.closed_at).length;
});

const totalCumulativeSales = computed(() => {
    return shiftsHistory.value.reduce((acc, s) => acc + (Number(s.total_sales) || 0), 0);
});

const totalVariances = computed(() => {
    return shiftsHistory.value
        .filter((s) => s.cash_variance !== null && s.cash_variance !== undefined)
        .reduce((acc, s) => acc + (Number(s.cash_variance) || 0), 0);
});

onMounted(async () => {
    await Promise.all([fetchCurrentShift(), loadHistory()]);
});

async function loadHistory() {
    await fetchShiftsHistory({
        status: statusFilter.value === 'all' ? '' : statusFilter.value,
        start_date: startDate.value || undefined,
        end_date: endDate.value || undefined,
    });
}

async function handleOpenShiftSubmit(openingBalance: number) {
    const success = await openShift(openingBalance);
    if (success) {
        await loadHistory();
    }
}

async function handleCloseShiftSubmit(closingBalance: number) {
    if (!currentShift.value) return;
    const result = await closeShift(currentShift.value.id, closingBalance);
    if (result) {
        await loadHistory();
    }
}
</script>

<template>
    <Head title="Manajemen Shift Kasir" />

    <div class="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Store class="size-3.5" />
                    <span>POS Kasir</span>
                    <ChevronRight class="size-3 text-neutral-400" />
                    <span class="text-neutral-900 dark:text-neutral-100">Manajemen Shift & Z-Report</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Shift Kasir & Rekap Penjualan
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Kelola sesi buka kasir, pantau ekspektasi uang kas laci, dan tutup shift untuk mengenerate laporan Z-Report.
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

        <!-- ACTIVE SHIFT HERO CARD -->
        <div
            class="overflow-hidden rounded-2xl border transition-all shadow-sm"
            :class="
                isShiftActive
                    ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-50/80 via-white to-white dark:border-emerald-500/20 dark:from-emerald-950/30 dark:via-neutral-900 dark:to-neutral-900'
                    : 'border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900'
            "
        >
            <div class="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                <!-- Left: Status & Info -->
                <div class="space-y-2">
                    <div class="flex items-center gap-2">
                        <span
                            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold font-mono uppercase tracking-wider"
                            :class="
                                isShiftActive
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 animate-pulse'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            "
                        >
                            <span class="size-2 rounded-full" :class="isShiftActive ? 'bg-emerald-500' : 'bg-neutral-400'"></span>
                            {{ isShiftActive ? 'Shift Sedang Aktif Berjalan' : 'Tidak Ada Shift Terbuka' }}
                        </span>
                        <span v-if="currentShift" class="text-xs text-neutral-400 font-mono font-medium">
                            #ID: {{ currentShift.id }}
                        </span>
                    </div>

                    <h3 class="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        {{
                            isShiftActive
                                ? `Kasir Bertugas: ${currentShift?.cashier?.name || 'Kasir'}`
                                : 'Siap Memulai Sesi Kasir Baru'
                        }}
                    </h3>

                    <p class="text-xs text-neutral-500 max-w-xl">
                        {{
                            isShiftActive
                                ? `Shift dibuka sejak ${formatDateTime(currentShift?.opened_at)}. Seluruh transaksi kasir tercatat pada shift ini.`
                                : 'Buka shift kasir dengan memasukkan modal kas awal untuk mulai menerima transaksi pesanan pelanggan.'
                        }}
                    </p>
                </div>

                <!-- Right: Stats & Actions -->
                <div class="flex flex-wrap items-center gap-4 lg:gap-6 shrink-0">
                    <!-- Live Stats when active -->
                    <div v-if="isShiftActive && currentShiftSummary" class="flex items-center gap-4 sm:gap-6 font-mono text-xs">
                        <div class="text-left">
                            <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">Modal Awal</span>
                            <span class="font-bold text-neutral-800 dark:text-neutral-200 text-sm">
                                {{ formatRupiah(currentShiftSummary.opening_balance) }}
                            </span>
                        </div>
                        <div class="text-left">
                            <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">Total Penjualan</span>
                            <span class="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                                {{ formatRupiah(currentShiftSummary.total_sales) }}
                            </span>
                        </div>
                        <div class="text-left">
                            <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">Ekspektasi Kas Laci</span>
                            <span class="font-black text-neutral-900 dark:text-neutral-100 text-base">
                                {{ formatRupiah(currentShiftSummary.expected_cash) }}
                            </span>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex items-center gap-2">
                        <button
                            v-if="isShiftActive"
                            type="button"
                            class="inline-flex h-10 items-center gap-2 rounded-xl bg-rose-600 px-5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-[0.98] transition-all"
                            @click="isCloseModalOpen = true"
                        >
                            <Lock class="size-4" />
                            <span>Tutup Shift & Cetak Rekap</span>
                        </button>
                        <button
                            v-else
                            type="button"
                            class="inline-flex h-10 items-center gap-2 rounded-xl bg-neutral-900 px-5 text-xs font-bold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            @click="isOpenModalOpen = true"
                        >
                            <Coins class="size-4" />
                            <span>Buka Shift Baru</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3 KPI Cards -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Total Shift Kasir Selesai
                </span>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalClosedShifts }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">sesi shift ditutup</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-neutral-400"></span>
                    <span>Histori sesi kasir tercatat</span>
                </div>
            </div>

            <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Akumulasi Omzet Semua Shift
                </span>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ formatRupiah(totalCumulativeSales) }}
                    </span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-emerald-500"></span>
                    <span>Total penerimaan transaksi kasir</span>
                </div>
            </div>

            <div class="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                    Total Selisih Kas Bersih (Net Variance)
                </span>
                <div class="mt-2 flex items-baseline gap-2">
                    <span
                        class="text-2xl font-bold tracking-tight font-mono"
                        :class="
                            totalVariances === 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : totalVariances > 0
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-rose-600 dark:text-rose-400'
                        "
                    >
                        {{
                            totalVariances === 0
                                ? 'Rp 0'
                                : totalVariances > 0
                                ? `+${formatRupiah(totalVariances)}`
                                : `-${formatRupiah(Math.abs(totalVariances))}`
                        }}
                    </span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span
                        class="size-1.5 rounded-full"
                        :class="totalVariances === 0 ? 'bg-emerald-500' : 'bg-amber-500'"
                    ></span>
                    <span>Rekonsiliasi kas aktual vs ekspektasi</span>
                </div>
            </div>
        </div>

        <!-- Shift History Card & Table -->
        <div class="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <!-- Toolbar -->
            <div class="flex flex-col gap-3.5 p-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-950/20">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Date Filters -->
                        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
                            <input
                                v-model="startDate"
                                type="date"
                                class="h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                @change="loadHistory"
                            />
                            <span>s/d</span>
                            <input
                                v-model="endDate"
                                type="date"
                                class="h-9 rounded-xl border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                @change="loadHistory"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        :disabled="isLoading"
                        class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                        @click="loadHistory"
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
                        Semua Shift ({{ shiftsHistory.length }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'closed'
                                ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-800'
                        "
                        @click="statusFilter = 'closed'"
                    >
                        Ditutup ({{ totalClosedShifts }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'open'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-neutral-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60'
                        "
                        @click="statusFilter = 'open'"
                    >
                        Aktif / Buka
                    </button>
                </div>
            </div>

            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="p-6 space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
            </div>

            <!-- Table View -->
            <div v-else-if="filteredShifts.length > 0" class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="border-b border-neutral-200/80 bg-neutral-50/60 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                        <tr>
                            <th class="px-4 py-3">ID & Kasir</th>
                            <th class="px-4 py-3">Waktu Buka / Tutup</th>
                            <th class="px-4 py-3 text-right">Modal Awal</th>
                            <th class="px-4 py-3 text-right">Total Penjualan</th>
                            <th class="px-4 py-3 text-right">Kas Akhir & Selisih</th>
                            <th class="px-4 py-3 text-center">Status</th>
                            <th class="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                        <tr
                            v-for="s in filteredShifts"
                            :key="s.id"
                            class="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors group"
                        >
                            <!-- ID & Cashier -->
                            <td class="px-4 py-3.5 font-mono">
                                <div class="font-bold text-neutral-900 dark:text-neutral-100">
                                    Shift #{{ s.id }}
                                </div>
                                <div class="text-[11px] text-neutral-400">
                                    {{ s.cashier?.name || 'Kasir' }}
                                </div>
                            </td>

                            <!-- Times -->
                            <td class="px-4 py-3.5 text-neutral-600 dark:text-neutral-400 text-xs">
                                <div><span class="text-neutral-400">Buka:</span> {{ formatDateTime(s.opened_at) }}</div>
                                <div v-if="s.closed_at">
                                    <span class="text-neutral-400">Tutup:</span> {{ formatDateTime(s.closed_at) }}
                                </div>
                                <div v-else class="text-emerald-600 font-semibold">Sedang Berjalan</div>
                            </td>

                            <!-- Opening Balance -->
                            <td class="px-4 py-3.5 text-right font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                                {{ formatRupiah(s.opening_balance) }}
                            </td>

                            <!-- Total Sales -->
                            <td class="px-4 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {{ formatRupiah(s.total_sales || 0) }}
                                <div class="text-[10px] text-neutral-400 font-normal">
                                    {{ s.total_transactions_count || 0 }} nota
                                </div>
                            </td>

                            <!-- Closing & Variance -->
                            <td class="px-4 py-3.5 text-right font-mono">
                                <div v-if="s.closing_balance !== null" class="font-bold text-neutral-900 dark:text-neutral-100">
                                    {{ formatRupiah(s.closing_balance) }}
                                </div>
                                <div v-else class="text-neutral-400">-</div>

                                <!-- Variance Badge -->
                                <div v-if="s.cash_variance !== null && s.cash_variance !== undefined" class="text-[10px] font-bold">
                                    <span
                                        :class="
                                            s.cash_variance === 0
                                                ? 'text-emerald-600'
                                                : s.cash_variance > 0
                                                ? 'text-blue-600'
                                                : 'text-rose-600'
                                        "
                                    >
                                        {{
                                            s.cash_variance === 0
                                                ? 'Pas (0)'
                                                : s.cash_variance > 0
                                                ? `+${formatRupiah(s.cash_variance)}`
                                                : `-${formatRupiah(Math.abs(s.cash_variance))}`
                                        }}
                                    </span>
                                </div>
                            </td>

                            <!-- Status -->
                            <td class="px-4 py-3.5 text-center">
                                <span
                                    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                    :class="
                                        s.closed_at
                                            ? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                    "
                                >
                                    <CheckCircle2 v-if="s.closed_at" class="size-3" />
                                    <Clock v-else class="size-3" />
                                    {{ s.closed_at ? 'Ditutup' : 'Aktif' }}
                                </span>
                            </td>

                            <!-- Actions -->
                            <td class="px-4 py-3.5 text-right">
                                <button
                                    type="button"
                                    class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors shadow-2xs"
                                    @click="fetchShiftReport(s.id)"
                                >
                                    <Printer class="size-3 text-neutral-400" />
                                    <span>Z-Report</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center p-12 text-center">
                <Coins class="size-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                <h4 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    Belum Ada Histori Shift
                </h4>
                <p class="text-xs text-neutral-400 mt-0.5">
                    Data sesi buka dan tutup shift kasir akan tercatat di tabel ini.
                </p>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <OpenShiftModal
        v-model:open="isOpenModalOpen"
        :is-processing="isActionLoading"
        @submit="handleOpenShiftSubmit"
    />

    <CloseShiftModal
        v-model:open="isCloseModalOpen"
        :shift="currentShift"
        :summary="currentShiftSummary"
        :is-processing="isActionLoading"
        @submit="handleCloseShiftSubmit"
    />

    <ShiftReportModal
        v-model:open="isReportModalOpen"
        :report-data="selectedShiftDetail"
    />
</template>
