<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Head } from '@inertiajs/vue3';
import {
    Boxes,
    Search,
    RefreshCw,
    SlidersHorizontal,
    History,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    List,
    TrendingUp,
    ChevronRight,
    Store,
    Barcode,
    Package,
    ArrowDownLeft,
    ArrowUpRight,
    DollarSign,
    Box,
    Sparkles,
} from '@lucide/vue';
import MinStockModal from '@/components/inventory/MinStockModal.vue';
import StockAdjustmentModal from '@/components/inventory/StockAdjustmentModal.vue';
import StockMovementHistoryModal from '@/components/inventory/StockMovementHistoryModal.vue';
import { useInventory } from '@/composables/useInventory';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import type {
    BreadcrumbItem,
    InventoryFilterStatus,
    InventoryItem,
    StockAdjustmentPayload,
} from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: '/dashboard',
            },
            {
                title: 'Master Data',
                href: '#',
            },
            {
                title: 'Inventori & Stok',
                href: '/inventory',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    inventories,
    categories,
    stockMovements,
    selectedInventory,
    isLoading,
    isSubmitting,
    isMovementsLoading,
    searchQuery,
    selectedCategoryId,
    statusFilter,
    sortBy,
    sortDirection,
    errors,
    filteredInventories,
    totalItems,
    safeStockCount,
    lowStockCount,
    outOfStockCount,
    totalStockUnits,
    totalInventoryCostValuation,
    totalInventorySellValuation,
    setSelectedInventory,
    fetchCategories,
    fetchInventories,
    fetchStockMovements,
    adjustStock,
    updateMinStock,
} = useInventory();

const isAdjustModalOpen = ref(false);
const isMinStockModalOpen = ref(false);
const isHistoryModalOpen = ref(false);
const targetInventoryForAdjust = ref<InventoryItem | null>(null);
const targetInventoryForMinStock = ref<InventoryItem | null>(null);

const viewMode = ref<'table' | 'grid'>('table');

onMounted(() => {
    fetchCategories();
    fetchInventories();
});

function handleOpenAdjust(item?: InventoryItem) {
    targetInventoryForAdjust.value = item || null;
    isAdjustModalOpen.value = true;
}

function handleOpenMinStock(item: InventoryItem) {
    targetInventoryForMinStock.value = item;
    isMinStockModalOpen.value = true;
}

async function handleOpenHistory() {
    isHistoryModalOpen.value = true;
    await fetchStockMovements();
}

async function handleAdjustSubmit(payload: StockAdjustmentPayload) {
    const success = await adjustStock(payload);
    if (success) {
        isAdjustModalOpen.value = false;
        targetInventoryForAdjust.value = null;
    }
}

async function handleMinStockSubmit(min_stock: number) {
    if (!targetInventoryForMinStock.value?.id) return;
    const success = await updateMinStock(targetInventoryForMinStock.value.id, min_stock);
    if (success) {
        isMinStockModalOpen.value = false;
        targetInventoryForMinStock.value = null;
    }
}

function getStockHealthPercent(qty: number, min: number): number {
    if (min <= 0) return 100;
    const ratio = (qty / (min * 2)) * 100;
    return Math.min(100, Math.max(0, Math.round(ratio)));
}
</script>

<template>
    <Head title="Manajemen Inventori & Stok" />

    <div class="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Store class="size-3.5" />
                    <span>POS Master Data</span>
                    <ChevronRight class="size-3 text-neutral-400" />
                    <span class="text-neutral-900 dark:text-neutral-100">Gudang & Stok Outlet</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Manajemen Stok & Inventori
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Kontrol ketersediaan unit barang fisik, batas minimum restok, dan mutasi keluar/masuk barang.
                </p>
            </div>

            <div class="flex items-center gap-2.5">
                <button
                    type="button"
                    :disabled="isLoading"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    @click="fetchInventories"
                >
                    <RefreshCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
                    <span class="hidden sm:inline">Sinkronkan</span>
                </button>

                <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    @click="handleOpenHistory"
                >
                    <History class="size-3.5 text-neutral-500" />
                    <span>Riwayat Mutasi</span>
                </button>

                <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                    @click="handleOpenAdjust()"
                >
                    <SlidersHorizontal class="size-3.5" />
                    <span>Penyesuaian Stok</span>
                </button>
            </div>
        </div>

        <!-- 4 KPI Metrics Grid -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Card 1: Total SKU Inventori -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Total SKU Inventori
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Boxes class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalItems }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">SKU terdata</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-emerald-500"></span>
                    <span>Total {{ totalStockUnits }} unit barang fisik tersedia</span>
                </div>
            </div>

            <!-- Card 2: Low / Critical Stock -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Stok Kritis / Menipis
                    </span>
                    <div
                        class="flex size-7 items-center justify-center rounded-lg"
                        :class="lowStockCount > 0 ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'"
                    >
                        <AlertTriangle class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span
                        class="text-2xl font-bold tracking-tight font-mono"
                        :class="lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-neutral-900 dark:text-neutral-100'"
                    >
                        {{ lowStockCount }}
                    </span>
                    <span
                        v-if="lowStockCount > 0"
                        class="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 font-mono"
                    >
                        Peringatan Restok
                    </span>
                    <span v-else class="text-[11px] text-emerald-600 font-medium">
                        Kuantitas aman
                    </span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full" :class="lowStockCount > 0 ? 'bg-amber-500' : 'bg-neutral-400'"></span>
                    <span>Kuantitas &le; batas minimum stok</span>
                </div>
            </div>

            <!-- Card 3: Out of Stock -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Stok Habis (Kosong)
                    </span>
                    <div
                        class="flex size-7 items-center justify-center rounded-lg"
                        :class="outOfStockCount > 0 ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'"
                    >
                        <XCircle class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span
                        class="text-2xl font-bold tracking-tight font-mono"
                        :class="outOfStockCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-100'"
                    >
                        {{ outOfStockCount }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">SKU tidak tersedia</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full" :class="outOfStockCount > 0 ? 'bg-rose-500' : 'bg-neutral-400'"></span>
                    <span>Tidak dapat dijual di kasir POS</span>
                </div>
            </div>

            <!-- Card 4: Inventory Valuation -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Valuasi Nilai Stok
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <TrendingUp class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono truncate">
                        {{ formatRupiah(totalInventorySellValuation) }}
                    </span>
                </div>
                <div class="mt-3 flex items-center justify-between text-[11px] text-neutral-500">
                    <span>Modal: {{ formatRupiah(totalInventoryCostValuation) }}</span>
                </div>
            </div>
        </div>

        <!-- Filter & Table Toolbar -->
        <div class="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <div class="flex flex-col gap-3.5 p-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-950/20">
                <!-- Top Row: Search & Category Filter -->
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Search Bar -->
                        <div class="relative w-full sm:w-72">
                            <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                            <input
                                v-model="searchQuery"
                                type="search"
                                placeholder="Cari nama produk, SKU, barcode..."
                                class="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10"
                            />
                        </div>

                        <!-- Category Selector -->
                        <select
                            v-model="selectedCategoryId"
                            class="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        >
                            <option value="all">Semua Kategori ({{ totalItems }})</option>
                            <option
                                v-for="cat in categories"
                                :key="cat.id"
                                :value="cat.id"
                            >
                                {{ cat.name }}
                            </option>
                        </select>
                    </div>

                    <!-- Right Controls: Sort & Mode Switcher -->
                    <div class="flex items-center justify-between lg:justify-end gap-2.5">
                        <!-- Sort Selector -->
                        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span>Urutkan:</span>
                            <select
                                v-model="sortBy"
                                class="h-8 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                            >
                                <option value="quantity">Sisa Stok Fisik</option>
                                <option value="min_stock">Batas Minimum</option>
                                <option value="name">Nama Produk</option>
                                <option value="valuation">Nilai Valuasi</option>
                            </select>
                        </div>

                        <!-- Table vs Grid Toggle -->
                        <div class="inline-flex rounded-xl border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-950">
                            <button
                                type="button"
                                class="rounded-lg p-1.5 transition-colors"
                                :class="
                                    viewMode === 'table'
                                        ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                                "
                                title="Tampilan Tabel"
                                @click="viewMode = 'table'"
                            >
                                <List class="size-4" />
                            </button>
                            <button
                                type="button"
                                class="rounded-lg p-1.5 transition-colors"
                                :class="
                                    viewMode === 'grid'
                                        ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                                "
                                title="Tampilan Grid Kartu"
                                @click="viewMode = 'grid'"
                            >
                                <LayoutGrid class="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Bottom Filter Tabs -->
                <div class="flex flex-wrap items-center gap-1.5">
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'all'
                                ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                        "
                        @click="statusFilter = 'all'"
                    >
                        Semua Stok ({{ totalItems }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'safe'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-neutral-950 dark:text-emerald-400 dark:hover:bg-neutral-800 border border-emerald-200 dark:border-emerald-900/60'
                        "
                        @click="statusFilter = 'safe'"
                    >
                        Stok Aman ({{ safeStockCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'low_stock'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-neutral-950 dark:text-amber-400 dark:hover:bg-neutral-800 border border-amber-200 dark:border-amber-900/60'
                        "
                        @click="statusFilter = 'low_stock'"
                    >
                        Stok Kritis ({{ lowStockCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'out_of_stock'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white text-rose-700 hover:bg-rose-50 dark:bg-neutral-950 dark:text-rose-400 dark:hover:bg-neutral-800 border border-rose-200 dark:border-rose-900/60'
                        "
                        @click="statusFilter = 'out_of_stock'"
                    >
                        Stok Habis ({{ outOfStockCount }})
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="p-6 space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
            </div>

            <!-- Table View -->
            <div v-else-if="filteredInventories.length > 0">
                <div v-if="viewMode === 'table'" class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="border-b border-neutral-200/80 bg-neutral-50/60 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                            <tr>
                                <th class="px-4 py-3 w-14">ID</th>
                                <th class="px-4 py-3">Produk</th>
                                <th class="px-4 py-3">SKU & Barcode</th>
                                <th class="px-4 py-3">Kategori</th>
                                <th class="px-4 py-3 text-center">Stok Fisik</th>
                                <th class="px-4 py-3 text-center">Batas Minimum</th>
                                <th class="px-4 py-3 text-right">Valuasi Jual</th>
                                <th class="px-4 py-3 text-center">Status</th>
                                <th class="px-4 py-3 text-right">Aksi Penyesuaian</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                            <tr
                                v-for="item in filteredInventories"
                                :key="item.id"
                                class="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors group"
                            >
                                <!-- ID -->
                                <td class="px-4 py-3.5 font-mono text-[11px] text-neutral-500 font-semibold">
                                    #{{ item.id }}
                                </td>

                                <!-- Product Info & Image -->
                                <td class="px-4 py-3.5">
                                    <div class="flex items-center gap-3">
                                        <div class="size-10 shrink-0 rounded-xl border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-800 shadow-2xs">
                                            <img
                                                v-if="item.product?.image_url"
                                                :src="item.product.image_url"
                                                :alt="item.product?.name"
                                                class="size-full object-cover"
                                                @error="($event.target as HTMLElement).style.display = 'none'"
                                            />
                                            <Package v-else class="size-4 text-neutral-400" />
                                        </div>
                                        <div>
                                            <div class="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                                                {{ item.product?.name }}
                                            </div>
                                            <div class="text-[11px] text-neutral-500 capitalize">
                                                Harga: {{ formatRupiah(item.product?.sell_price) }} / {{ item.product?.unit || 'pcs' }}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <!-- SKU & Barcode -->
                                <td class="px-4 py-3.5 font-mono text-[11px]">
                                    <div class="font-bold text-neutral-800 dark:text-neutral-200">
                                        {{ item.product?.sku }}
                                    </div>
                                    <div v-if="item.product?.barcode" class="flex items-center gap-1 text-[10px] text-neutral-400">
                                        <Barcode class="size-3" />
                                        {{ item.product.barcode }}
                                    </div>
                                </td>

                                <!-- Category -->
                                <td class="px-4 py-3.5">
                                    <span class="inline-flex rounded-lg bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 text-xs">
                                        {{ item.product?.category?.name || 'Tanpa Kategori' }}
                                    </span>
                                </td>

                                <!-- Current Stock & Visual Health Bar -->
                                <td class="px-4 py-3.5 text-center font-mono">
                                    <div class="font-bold text-sm" :class="item.quantity <= 0 ? 'text-rose-600' : item.quantity <= item.min_stock ? 'text-amber-600' : 'text-neutral-900 dark:text-neutral-100'">
                                        {{ item.quantity }} <span class="text-xs font-normal text-neutral-400 capitalize">{{ item.product?.unit || 'pcs' }}</span>
                                    </div>
                                    <div class="mx-auto mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                                        <div
                                            class="h-full rounded-full transition-all"
                                            :class="item.quantity <= 0 ? 'bg-rose-500' : item.quantity <= item.min_stock ? 'bg-amber-500' : 'bg-emerald-500'"
                                            :style="{ width: `${getStockHealthPercent(item.quantity, item.min_stock)}%` }"
                                        ></div>
                                    </div>
                                </td>

                                <!-- Min Stock (Editable) -->
                                <td class="px-4 py-3.5 text-center font-mono">
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
                                        title="Klik untuk ubah batas minimum"
                                        @click="handleOpenMinStock(item)"
                                    >
                                        <span>{{ item.min_stock }} {{ item.product?.unit || 'pcs' }}</span>
                                        <ShieldAlert class="size-3 text-neutral-400" />
                                    </button>
                                </td>

                                <!-- Valuation -->
                                <td class="px-4 py-3.5 text-right font-mono text-neutral-800 dark:text-neutral-200">
                                    {{ formatRupiah((parseFloat(String(item.product?.sell_price)) || 0) * item.quantity) }}
                                </td>

                                <!-- Status Badge -->
                                <td class="px-4 py-3.5 text-center">
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                        :class="
                                            item.quantity <= 0
                                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                                : item.quantity <= item.min_stock
                                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                        "
                                    >
                                        <XCircle v-if="item.quantity <= 0" class="size-3" />
                                        <AlertTriangle v-else-if="item.quantity <= item.min_stock" class="size-3" />
                                        <CheckCircle2 v-else class="size-3" />
                                        {{ item.quantity <= 0 ? 'Habis' : item.quantity <= item.min_stock ? 'Kritis' : 'Aman' }}
                                    </span>
                                </td>

                                <!-- Action Buttons -->
                                <td class="px-4 py-3.5 text-right">
                                    <div class="inline-flex items-center gap-1">
                                        <button
                                            type="button"
                                            class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                            @click="handleOpenAdjust(item)"
                                        >
                                            <SlidersHorizontal class="size-3 text-neutral-500" />
                                            <span>Sesuaikan</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Grid Card View -->
                <div v-else class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div
                        v-for="item in filteredInventories"
                        :key="item.id"
                        class="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-all group"
                    >
                        <div>
                            <!-- Header with Image & Badges -->
                            <div class="relative aspect-4/3 w-full rounded-xl border border-neutral-100 bg-neutral-100 overflow-hidden flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-800 mb-3 shadow-2xs">
                                <img
                                    v-if="item.product?.image_url"
                                    :src="item.product.image_url"
                                    :alt="item.product?.name"
                                    class="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    @error="($event.target as HTMLElement).style.display = 'none'"
                                />
                                <Package v-else class="size-10 text-neutral-400" />

                                <div class="absolute top-2 left-2">
                                    <span class="rounded-md bg-neutral-900/85 backdrop-blur-xs px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                                        {{ item.product?.sku }}
                                    </span>
                                </div>

                                <div class="absolute top-2 right-2">
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono shadow-xs backdrop-blur-xs"
                                        :class="
                                            item.quantity <= 0
                                                ? 'bg-rose-600/90 text-white'
                                                : item.quantity <= item.min_stock
                                                ? 'bg-amber-600/90 text-white'
                                                : 'bg-emerald-600/90 text-white'
                                        "
                                    >
                                        {{ item.quantity <= 0 ? 'Stok Habis' : item.quantity <= item.min_stock ? 'Stok Kritis' : 'Stok Aman' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Name & Category -->
                            <div class="text-[11px] text-neutral-500 font-medium">
                                {{ item.product?.category?.name || 'Tanpa Kategori' }}
                            </div>
                            <h4 class="mt-0.5 text-base font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                {{ item.product?.name }}
                            </h4>

                            <!-- Stock Progress Meter -->
                            <div class="mt-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-950/40 space-y-1.5">
                                <div class="flex items-center justify-between text-xs font-mono">
                                    <span class="text-neutral-500">Sisa Stok:</span>
                                    <span class="font-bold text-neutral-900 dark:text-neutral-100">
                                        {{ item.quantity }} {{ item.product?.unit || 'pcs' }}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                                    <span>Batas Minimum:</span>
                                    <span>{{ item.min_stock }} {{ item.product?.unit || 'pcs' }}</span>
                                </div>
                                <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-200/80 dark:bg-neutral-800 mt-1">
                                    <div
                                        class="h-full rounded-full transition-all duration-300"
                                        :class="item.quantity <= 0 ? 'bg-rose-500' : item.quantity <= item.min_stock ? 'bg-amber-500' : 'bg-emerald-500'"
                                        :style="{ width: `${getStockHealthPercent(item.quantity, item.min_stock)}%` }"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <!-- Card Footer Action -->
                        <div class="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                            <span class="font-mono text-xs text-neutral-500">
                                Valuasi: {{ formatRupiah((parseFloat(String(item.product?.sell_price)) || 0) * item.quantity) }}
                            </span>
                            <button
                                type="button"
                                class="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                                @click="handleOpenAdjust(item)"
                            >
                                <SlidersHorizontal class="size-3" />
                                <span>Adjust</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center p-12 text-center">
                <div class="flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
                    <Boxes class="size-6" />
                </div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {{ searchQuery || selectedCategoryId !== 'all' || statusFilter !== 'all' ? 'Data Inventori Tidak Ditemukan' : 'Belum Ada Data Inventori' }}
                </h3>
                <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                    {{
                        searchQuery || selectedCategoryId !== 'all' || statusFilter !== 'all'
                            ? 'Tidak ada stok produk yang sesuai dengan pencarian Anda. Coba sesuaikan kata kunci atau filter status.'
                            : 'Tambahkan produk baru pada katalog untuk mengaktifkan pemantauan inventori dan kartu stok otomatis.'
                    }}
                </p>
                <div class="mt-4 flex items-center gap-2">
                    <button
                        v-if="searchQuery || selectedCategoryId !== 'all' || statusFilter !== 'all'"
                        type="button"
                        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                        @click="searchQuery = ''; selectedCategoryId = 'all'; statusFilter = 'all'"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <StockAdjustmentModal
        v-model:open="isAdjustModalOpen"
        :inventory-item="targetInventoryForAdjust"
        :inventories="inventories"
        :is-submitting="isSubmitting"
        :errors="errors"
        @submit="handleAdjustSubmit"
    />

    <MinStockModal
        v-model:open="isMinStockModalOpen"
        :inventory-item="targetInventoryForMinStock"
        :is-submitting="isSubmitting"
        @submit="handleMinStockSubmit"
    />

    <StockMovementHistoryModal
        v-model:open="isHistoryModalOpen"
        :movements="stockMovements"
        :is-loading="isMovementsLoading"
        @refresh="fetchStockMovements"
    />
</template>
