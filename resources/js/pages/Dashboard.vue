<script setup lang="ts">
import { onMounted } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import {
    Activity,
    AlertTriangle,
    Coins,
    DollarSign,
    Download,
    Layers,
    LayoutGrid,
    Package,
    RefreshCw,
    ShoppingBag,
    ShoppingCart,
    Store,
    TrendingUp,
    Users,
    Wallet,
} from '@lucide/vue';
import DashboardBestSellers from '@/components/dashboard/DashboardBestSellers.vue';
import DashboardCashierLeaderboard from '@/components/dashboard/DashboardCashierLeaderboard.vue';
import DashboardKpiCard from '@/components/dashboard/DashboardKpiCard.vue';
import DashboardLowStockAlert from '@/components/dashboard/DashboardLowStockAlert.vue';
import DashboardPaymentBreakdown from '@/components/dashboard/DashboardPaymentBreakdown.vue';
import DashboardSalesChart from '@/components/dashboard/DashboardSalesChart.vue';
import { useDashboard } from '@/composables/useDashboard';
import { formatRupiah } from '@/lib/formatters';
import type { BreadcrumbItem, DashboardPeriodFilter } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: '/dashboard',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    periodFilter,
    summary,
    salesReport,
    bestSellers,
    inventoryReport,
    cashierPerformance,
    isLoading,
    isRefreshing,
    grossProfitMargin,
    timeSeriesData,
    paymentDistributionData,
    fetchDashboardData,
    setPeriod,
    handleExport,
} = useDashboard();

onMounted(() => {
    fetchDashboardData();
});

const periodButtons: { label: string; value: DashboardPeriodFilter }[] = [
    { label: 'Hari Ini', value: 'today' },
    { label: '7 Hari Terakhir', value: 'week' },
    { label: 'Bulan Ini', value: 'month' },
    { label: 'Semua Waktu', value: 'all' },
];
</script>

<template>
    <Head title="Dashboard Analitik & Penjualan" />

    <div class="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <!-- Top Header & Filter Controls -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Store class="size-3.5" />
                    <span>POS Nusantara</span>
                    <span class="text-neutral-300 dark:text-neutral-700">&bull;</span>
                    <span class="text-neutral-900 dark:text-neutral-100">Executive Summary</span>
                </div>
                <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Dashboard Analitik & Penjualan
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Pantau kinerja penjualan, laba kotor, perputaran stok barang, dan operasional kasir secara realtime.
                </p>
            </div>

            <!-- Right Controls: Period Tabs & Action Shortcuts -->
            <div class="flex flex-wrap items-center gap-2.5">
                <!-- Period Filter Tabs (Soft pills) -->
                <div class="flex items-center rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-1 dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
                    <button
                        v-for="btn in periodButtons"
                        :key="btn.value"
                        type="button"
                        class="rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer"
                        :class="
                            periodFilter === btn.value
                                ? 'bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-neutral-100'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                        "
                        @click="setPeriod(btn.value)"
                    >
                        {{ btn.label }}
                    </button>
                </div>

                <!-- Refresh Button -->
                <button
                    type="button"
                    :disabled="isLoading || isRefreshing"
                    class="inline-flex size-9 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all shadow-2xs"
                    title="Perbarui Data"
                    @click="fetchDashboardData(true)"
                >
                    <RefreshCw class="size-3.5" :class="{ 'animate-spin': isRefreshing || isLoading }" />
                </button>

                <!-- Export Report -->
                <button
                    type="button"
                    class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all shadow-2xs"
                    @click="handleExport"
                >
                    <Download class="size-3.5 text-neutral-500" />
                    <span>Ekspor</span>
                </button>

                <!-- Shortcut to POS Terminal -->
                <Link
                    href="/pos"
                    class="inline-flex h-9 items-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                >
                    <ShoppingCart class="size-3.5" />
                    <span>Terminal Kasir</span>
                </Link>
            </div>
        </div>

        <!-- 4 Primary KPI Summary Cards -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <!-- 1. Total Omzet Penjualan -->
            <DashboardKpiCard
                title="Total Omzet Penjualan"
                :value="formatRupiah(summary?.total_revenue || 0)"
                :trend-percentage="summary?.revenue_growth_percentage"
                trend-label="vs periode lalu"
                :icon="DollarSign"
                variant="indigo"
            />

            <!-- 2. Estimasi Laba Kotor -->
            <DashboardKpiCard
                title="Estimasi Laba Kotor"
                :value="formatRupiah(summary?.gross_profit || 0)"
                :subtitle="`Margin laba: ${grossProfitMargin}% dari omzet`"
                :icon="TrendingUp"
                variant="emerald"
            />

            <!-- 3. Total Item Terjual -->
            <DashboardKpiCard
                title="Total Item Terjual"
                :value="`${(summary?.total_items_sold || 0).toLocaleString('id-ID')} unit`"
                :subtitle="`${summary?.total_transactions || 0} nota selesai (Rata-rata: ${formatRupiah(summary?.average_order_value || 0)})`"
                :icon="ShoppingBag"
                variant="amber"
            />

            <!-- 4. Status Kasir & Shift -->
            <DashboardKpiCard
                title="Status Shift & Stok"
                :value="`${summary?.active_shifts_count || 0} Kasir Buka`"
                :subtitle="`${summary?.low_stock_products_count || 0} produk menipis &bull; ${summary?.total_active_products || 0} menu aktif`"
                :icon="Coins"
                variant="violet"
            />
        </div>

        <!-- Row 2: Sales Chart & Payment Distribution -->
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <!-- Sales Chart (2 cols) -->
            <div class="lg:col-span-2">
                <DashboardSalesChart
                    :data="timeSeriesData"
                    :total-revenue="salesReport?.total_revenue || summary?.total_revenue || 0"
                    :total-transactions="salesReport?.total_transactions || summary?.total_transactions || 0"
                />
            </div>

            <!-- Payment Methods Distribution (1 col) -->
            <div class="lg:col-span-1">
                <DashboardPaymentBreakdown
                    :data="paymentDistributionData"
                />
            </div>
        </div>

        <!-- Row 3: Best Sellers & Low Stock Alerts & Cashier Leaderboard -->
        <div class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <!-- Best Seller Top 5 Menu -->
            <DashboardBestSellers
                :items="bestSellers"
            />

            <!-- Low Stock Inventory Alerts -->
            <DashboardLowStockAlert
                :items="inventoryReport?.low_stock_items || []"
                :low-stock-count="inventoryReport?.low_stock_count || 0"
            />

            <!-- Cashier Shift Leaderboard -->
            <DashboardCashierLeaderboard
                :items="cashierPerformance"
            />
        </div>
    </div>
</template>
