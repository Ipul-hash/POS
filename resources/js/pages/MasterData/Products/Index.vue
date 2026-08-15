<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Head } from '@inertiajs/vue3';
import {
    Plus,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Activity,
    LayoutGrid,
    List,
    TrendingUp,
    ChevronRight,
    Store,
    Barcode,
    Layers,
    DollarSign,
    Box,
    Sparkles,
} from '@lucide/vue';
import ProductDeleteDialog from '@/components/master-data/product/ProductDeleteDialog.vue';
import ProductDetailModal from '@/components/master-data/product/ProductDetailModal.vue';
import ProductFormModal from '@/components/master-data/product/ProductFormModal.vue';
import ProductStockModal from '@/components/master-data/product/ProductStockModal.vue';
import { useProduct } from '@/composables/useProduct';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import type { BreadcrumbItem, Product, ProductPayload, ProductStockStatusFilter } from '@/types';

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
                title: 'Produk',
                href: '/master-data/products',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    categories,
    selectedProduct,
    selectedProductStock,
    isLoading,
    isSubmitting,
    isStockLoading,
    searchQuery,
    selectedCategoryId,
    stockStatusFilter,
    sortBy,
    sortDirection,
    errors,
    filteredProducts,
    totalProducts,
    activeProductsCount,
    inactiveProductsCount,
    lowStockCount,
    outOfStockCount,
    totalStockUnits,
    totalInventoryCostValuation,
    totalInventorySellValuation,
    setSelectedProduct,
    fetchCategories,
    fetchProducts,
    fetchProductDetail,
    fetchProductStock,
    createProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
} = useProduct();

const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isStockModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const productToEdit = ref<Product | null>(null);
const productToDelete = ref<Product | null>(null);

const viewMode = ref<'table' | 'grid'>('table');

onMounted(() => {
    fetchCategories();
    fetchProducts();
});

function handleOpenCreate() {
    productToEdit.value = null;
    isFormModalOpen.value = true;
}

function handleOpenEdit(product: Product) {
    productToEdit.value = { ...product };
    isFormModalOpen.value = true;
}

async function handleOpenDetail(product: Product) {
    setSelectedProduct(product);
    isDetailModalOpen.value = true;
    if (product.id) {
        await fetchProductDetail(product.id);
    }
}

async function handleOpenStockModal(product: Product) {
    setSelectedProduct(product);
    isStockModalOpen.value = true;
    if (product.id) {
        await fetchProductStock(product.id);
    }
}

async function handleRefreshStock() {
    if (selectedProduct.value?.id) {
        await fetchProductStock(selectedProduct.value.id);
    }
}

function handleOpenDelete(product: Product) {
    productToDelete.value = product;
    isDeleteDialogOpen.value = true;
}

async function handleFormSubmit(payload: ProductPayload) {
    if (productToEdit.value?.id) {
        const success = await updateProduct(productToEdit.value.id, payload);
        if (success) {
            isFormModalOpen.value = false;
            productToEdit.value = null;
        }
    } else {
        const success = await createProduct(payload);
        if (success) {
            isFormModalOpen.value = false;
        }
    }
}

async function handleDeleteConfirm() {
    if (!productToDelete.value?.id) return;
    const success = await deleteProduct(productToDelete.value.id);
    if (success) {
        isDeleteDialogOpen.value = false;
        productToDelete.value = null;
    }
}

function calculateMargin(cost: number | string, sell: number | string): string {
    const c = parseFloat(String(cost)) || 0;
    const s = parseFloat(String(sell)) || 0;
    if (s <= 0) return '0%';
    const margin = ((s - c) / s) * 100;
    return `${margin.toFixed(0)}%`;
}
</script>

<template>
    <Head title="Master Data Produk" />

    <div class="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Store class="size-3.5" />
                    <span>POS Master Data</span>
                    <ChevronRight class="size-3 text-neutral-400" />
                    <span class="text-neutral-900 dark:text-neutral-100">Katalog Produk</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Manajemen Master Produk
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Kelola seluruh data SKU, barcode, harga beli/jual, margin laba, dan stok real-time kasir POS.
                </p>
            </div>

            <div class="flex items-center gap-2.5">
                <button
                    type="button"
                    :disabled="isLoading"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    @click="fetchProducts"
                >
                    <RefreshCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
                    <span class="hidden sm:inline">Sinkronisasi</span>
                </button>

                <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                    @click="handleOpenCreate"
                >
                    <Plus class="size-4" />
                    <span>Tambah Produk</span>
                </button>
            </div>
        </div>

        <!-- 4 KPI Metrics Grid -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Card 1: Total SKU -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Total SKU Produk
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Package class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalProducts }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">item terdaftar</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-emerald-500"></span>
                    <span>{{ activeProductsCount }} produk aktif di katalog kasir</span>
                </div>
            </div>

            <!-- Card 2: Low / Critical Stock -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Stok Menipis / Kritis
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
                        Perlu Restok
                    </span>
                    <span v-else class="text-[11px] text-emerald-600 font-medium">
                        Stok optimal
                    </span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full" :class="outOfStockCount > 0 ? 'bg-rose-500' : 'bg-neutral-400'"></span>
                    <span>{{ outOfStockCount }} produk stok habis (0 unit)</span>
                </div>
            </div>

            <!-- Card 3: Total Stock Units -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Total Unit Fisik
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Box class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalStockUnits }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">unit inventori</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Activity class="size-3 text-neutral-400" />
                    <span>Rata-rata {{ totalProducts ? Math.round(totalStockUnits / totalProducts) : 0 }} unit / produk</span>
                </div>
            </div>

            <!-- Card 4: Inventory Valuation -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Nilai Jual Inventori
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
                <!-- Top Row: Search & Category & Quick Filter -->
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Search Bar -->
                        <div class="relative w-full sm:w-72">
                            <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                            <input
                                v-model="searchQuery"
                                type="search"
                                placeholder="Cari nama, SKU, barcode..."
                                class="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10"
                            />
                        </div>

                        <!-- Category Selector -->
                        <select
                            v-model="selectedCategoryId"
                            class="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        >
                            <option value="all">Semua Kategori ({{ totalProducts }})</option>
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
                                <option value="created_at">Terbaru</option>
                                <option value="name">Nama Produk</option>
                                <option value="sell_price">Harga Jual</option>
                                <option value="quantity">Sisa Stok</option>
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
                            stockStatusFilter === 'all'
                                ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                        "
                        @click="stockStatusFilter = 'all'"
                    >
                        Semua ({{ totalProducts }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            stockStatusFilter === 'active'
                                ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                        "
                        @click="stockStatusFilter = 'active'"
                    >
                        Aktif ({{ activeProductsCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            stockStatusFilter === 'low_stock'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-neutral-950 dark:text-amber-400 dark:hover:bg-neutral-800 border border-amber-200 dark:border-amber-900/60'
                        "
                        @click="stockStatusFilter = 'low_stock'"
                    >
                        Stok Kritis ({{ lowStockCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            stockStatusFilter === 'out_of_stock'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white text-rose-700 hover:bg-rose-50 dark:bg-neutral-950 dark:text-rose-400 dark:hover:bg-neutral-800 border border-rose-200 dark:border-rose-900/60'
                        "
                        @click="stockStatusFilter = 'out_of_stock'"
                    >
                        Stok Habis ({{ outOfStockCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            stockStatusFilter === 'inactive'
                                ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                        "
                        @click="stockStatusFilter = 'inactive'"
                    >
                        Nonaktif ({{ inactiveProductsCount }})
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="p-6 space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
            </div>

            <!-- Table View -->
            <div v-else-if="filteredProducts.length > 0">
                <div v-if="viewMode === 'table'" class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="border-b border-neutral-200/80 bg-neutral-50/60 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                            <tr>
                                <th class="px-4 py-3 w-14">ID</th>
                                <th class="px-4 py-3">Produk</th>
                                <th class="px-4 py-3">SKU & Barcode</th>
                                <th class="px-4 py-3">Kategori</th>
                                <th class="px-4 py-3 text-right">Modal</th>
                                <th class="px-4 py-3 text-right">Harga Jual</th>
                                <th class="px-4 py-3 text-center">Margin</th>
                                <th class="px-4 py-3 text-center">Stok Fisik</th>
                                <th class="px-4 py-3 text-center">Status</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                            <tr
                                v-for="product in filteredProducts"
                                :key="product.id"
                                class="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors group"
                            >
                                <!-- ID -->
                                <td class="px-4 py-3.5 font-mono text-[11px] text-neutral-500 font-semibold">
                                    #{{ product.id }}
                                </td>

                                <!-- Product Name & Image -->
                                <td class="px-4 py-3.5">
                                    <div class="flex items-center gap-3">
                                        <div class="size-10 shrink-0 rounded-xl border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-800 shadow-2xs">
                                            <img
                                                v-if="product.image_url"
                                                :src="product.image_url"
                                                :alt="product.name"
                                                class="size-full object-cover"
                                                @error="($event.target as HTMLElement).style.display = 'none'"
                                            />
                                            <Package v-else class="size-4 text-neutral-400" />
                                        </div>
                                        <div>
                                            <div class="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                                                {{ product.name }}
                                            </div>
                                            <div class="text-[11px] text-neutral-500 capitalize">
                                                Satuan: {{ product.unit || 'pcs' }}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <!-- SKU & Barcode -->
                                <td class="px-4 py-3.5 font-mono text-[11px]">
                                    <div class="font-bold text-neutral-800 dark:text-neutral-200">
                                        {{ product.sku }}
                                    </div>
                                    <div v-if="product.barcode" class="flex items-center gap-1 text-[10px] text-neutral-400">
                                        <Barcode class="size-3" />
                                        {{ product.barcode }}
                                    </div>
                                </td>

                                <!-- Category -->
                                <td class="px-4 py-3.5">
                                    <span class="inline-flex rounded-lg bg-neutral-100 px-2.5 py-1 font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 text-xs">
                                        {{ product.category?.name || 'Tanpa Kategori' }}
                                    </span>
                                </td>

                                <!-- Cost Price -->
                                <td class="px-4 py-3.5 text-right font-mono text-neutral-500 dark:text-neutral-400">
                                    {{ formatRupiah(product.cost_price) }}
                                </td>

                                <!-- Sell Price -->
                                <td class="px-4 py-3.5 text-right font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                    {{ formatRupiah(product.sell_price) }}
                                </td>

                                <!-- Margin -->
                                <td class="px-4 py-3.5 text-center font-mono">
                                    <span class="inline-flex rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                                        {{ calculateMargin(product.cost_price, product.sell_price) }}
                                    </span>
                                </td>

                                <!-- Stock Status -->
                                <td class="px-4 py-3.5 text-center">
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all"
                                        :class="
                                            (product.inventory?.quantity ?? 0) <= 0
                                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400'
                                                : (product.inventory?.quantity ?? 0) <= (product.inventory?.min_stock ?? 0)
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400'
                                                : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200'
                                        "
                                        title="Klik untuk cek detail stok"
                                        @click="handleOpenStockModal(product)"
                                    >
                                        <Activity class="size-3" />
                                        <span>{{ product.inventory?.quantity ?? 0 }} {{ product.unit || 'pcs' }}</span>
                                    </button>
                                </td>

                                <!-- Active Status Toggle -->
                                <td class="px-4 py-3.5 text-center">
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors"
                                        :class="
                                            product.is_active
                                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400'
                                                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400'
                                        "
                                        @click="toggleProductStatus(product)"
                                    >
                                        <span
                                            class="size-1.5 rounded-full"
                                            :class="product.is_active ? 'bg-emerald-500' : 'bg-neutral-400'"
                                        ></span>
                                        {{ product.is_active ? 'Aktif' : 'Nonaktif' }}
                                    </button>
                                </td>

                                <!-- Actions -->
                                <td class="px-4 py-3.5 text-right">
                                    <div class="inline-flex items-center gap-1">
                                        <button
                                            type="button"
                                            title="Cek Stok Cepat"
                                            class="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                                            @click="handleOpenStockModal(product)"
                                        >
                                            <Activity class="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Lihat Detail Produk"
                                            class="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                                            @click="handleOpenDetail(product)"
                                        >
                                            <Eye class="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Edit Produk"
                                            class="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                                            @click="handleOpenEdit(product)"
                                        >
                                            <Pencil class="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Hapus Produk"
                                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                                            @click="handleOpenDelete(product)"
                                        >
                                            <Trash2 class="size-4" />
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
                        v-for="product in filteredProducts"
                        :key="product.id"
                        class="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-all group"
                    >
                        <div>
                            <!-- Card Header: Image & Badges -->
                            <div class="relative aspect-4/3 w-full rounded-xl border border-neutral-100 bg-neutral-100 overflow-hidden flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-800 mb-3 shadow-2xs">
                                <img
                                    v-if="product.image_url"
                                    :src="product.image_url"
                                    :alt="product.name"
                                    class="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    @error="($event.target as HTMLElement).style.display = 'none'"
                                />
                                <Package v-else class="size-10 text-neutral-400" />

                                <div class="absolute top-2 left-2 flex items-center gap-1.5">
                                    <span class="rounded-md bg-neutral-900/85 backdrop-blur-xs px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                                        {{ product.sku }}
                                    </span>
                                </div>

                                <div class="absolute top-2 right-2">
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono shadow-xs backdrop-blur-xs"
                                        :class="
                                            (product.inventory?.quantity ?? 0) <= 0
                                                ? 'bg-rose-600/90 text-white'
                                                : (product.inventory?.quantity ?? 0) <= (product.inventory?.min_stock ?? 0)
                                                ? 'bg-amber-600/90 text-white'
                                                : 'bg-emerald-600/90 text-white'
                                        "
                                    >
                                        {{ product.inventory?.quantity ?? 0 }} {{ product.unit || 'pcs' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Category & Name -->
                            <div class="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                                <span>{{ product.category?.name || 'Tanpa Kategori' }}</span>
                                <span class="font-mono text-[10px]">Margin {{ calculateMargin(product.cost_price, product.sell_price) }}</span>
                            </div>

                            <h4 class="mt-1 text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {{ product.name }}
                            </h4>

                            <!-- Price -->
                            <div class="mt-2.5 flex items-baseline justify-between border-t border-neutral-100 dark:border-neutral-800/80 pt-2.5">
                                <div>
                                    <span class="text-[10px] text-neutral-400">Harga Jual POS</span>
                                    <p class="font-mono text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                                        {{ formatRupiah(product.sell_price) }}
                                    </p>
                                </div>
                                <div class="text-right">
                                    <span class="text-[10px] text-neutral-400">Modal</span>
                                    <p class="font-mono text-xs text-neutral-500">
                                        {{ formatRupiah(product.cost_price) }}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Card Footer Actions -->
                        <div class="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                            <button
                                type="button"
                                class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                                :class="
                                    product.is_active
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                                "
                                @click="toggleProductStatus(product)"
                            >
                                <span
                                    class="size-1.5 rounded-full"
                                    :class="product.is_active ? 'bg-emerald-500' : 'bg-neutral-400'"
                                ></span>
                                {{ product.is_active ? 'Aktif' : 'Nonaktif' }}
                            </button>

                            <div class="flex items-center gap-1">
                                <button
                                    type="button"
                                    title="Cek Stok"
                                    class="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    @click="handleOpenStockModal(product)"
                                >
                                    <Activity class="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    title="Lihat Detail"
                                    class="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    @click="handleOpenDetail(product)"
                                >
                                    <Eye class="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    title="Edit Produk"
                                    class="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    @click="handleOpenEdit(product)"
                                >
                                    <Pencil class="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    title="Hapus Produk"
                                    class="rounded-lg p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                                    @click="handleOpenDelete(product)"
                                >
                                    <Trash2 class="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center p-12 text-center">
                <div class="flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
                    <Package class="size-6" />
                </div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {{ searchQuery || selectedCategoryId !== 'all' || stockStatusFilter !== 'all' ? 'Produk Tidak Ditemukan' : 'Belum Ada Master Data Produk' }}
                </h3>
                <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                    {{
                        searchQuery || selectedCategoryId !== 'all' || stockStatusFilter !== 'all'
                            ? 'Tidak ada produk yang cocok dengan kriteria pencarian atau filter yang dipilih. Coba sesuaikan kata kunci Anda.'
                            : 'Mulai daftarkan SKU barang/menu untuk dihubungkan ke kasir POS dan sistem pencatatan stok otomatis.'
                    }}
                </p>
                <div class="mt-4 flex items-center gap-2">
                    <button
                        v-if="searchQuery || selectedCategoryId !== 'all' || stockStatusFilter !== 'all'"
                        type="button"
                        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                        @click="searchQuery = ''; selectedCategoryId = 'all'; stockStatusFilter = 'all'"
                    >
                        Reset Filter
                    </button>
                    <button
                        type="button"
                        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                        @click="handleOpenCreate"
                    >
                        <Plus class="size-4" />
                        <span>Tambah Produk Sekarang</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <ProductFormModal
        v-model:open="isFormModalOpen"
        :product="productToEdit"
        :categories="categories"
        :is-submitting="isSubmitting"
        :errors="errors"
        @submit="handleFormSubmit"
    />

    <ProductDetailModal
        v-model:open="isDetailModalOpen"
        :product="selectedProduct"
        @edit="handleOpenEdit"
        @check-stock="handleOpenStockModal"
    />

    <ProductStockModal
        v-model:open="isStockModalOpen"
        :stock="selectedProductStock"
        :is-loading="isStockLoading"
        @refresh="handleRefreshStock"
    />

    <ProductDeleteDialog
        v-model:open="isDeleteDialogOpen"
        :product="productToDelete"
        :is-submitting="isSubmitting"
        @confirm="handleDeleteConfirm"
    />
</template>
