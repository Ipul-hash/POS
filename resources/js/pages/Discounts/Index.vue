<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Head } from '@inertiajs/vue3';
import {
    Tag,
    Percent,
    Banknote,
    Receipt,
    ShoppingBag,
    Calendar,
    Search,
    RefreshCw,
    Plus,
    SlidersHorizontal,
    Sparkles,
    CheckCircle2,
    Clock,
    XCircle,
    Power,
    Pencil,
    Trash2,

    Eye,
    LayoutGrid,
    List,
    ChevronRight,
    Store,
    Calculator,
    AlertCircle,
} from '@lucide/vue';
import DiscountDeleteDialog from '@/components/discount/DiscountDeleteDialog.vue';
import DiscountDetailModal from '@/components/discount/DiscountDetailModal.vue';
import DiscountFormModal from '@/components/discount/DiscountFormModal.vue';
import { getDiscountRealStatus, useDiscount } from '@/composables/useDiscount';
import { formatDate, formatRupiah } from '@/lib/formatters';
import type {
    BreadcrumbItem,
    Discount,
    DiscountPayload,
    DiscountStatusFilter,
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
                title: 'Diskon & Promosi',
                href: '/discounts',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    discounts,
    selectedDiscount,
    isLoading,
    isSubmitting,
    searchQuery,
    selectedType,
    selectedAppliesTo,
    statusFilter,
    sortBy,
    sortDirection,
    errors,
    filteredDiscounts,
    totalDiscounts,
    activeDiscountsCount,
    productDiscountsCount,
    transactionDiscountsCount,
    expiredDiscountsCount,
    calculateDiscountAmount,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    toggleDiscountStatus,
    deleteDiscount,
} = useDiscount();

const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const editingDiscount = ref<Discount | null>(null);
const inspectingDiscount = ref<Discount | null>(null);
const targetDiscountToDelete = ref<Discount | null>(null);

const viewMode = ref<'table' | 'grid'>('table');

onMounted(() => {
    fetchDiscounts();
});

function handleOpenCreate() {
    editingDiscount.value = null;
    isFormModalOpen.value = true;
}

function handleOpenEdit(discount: Discount) {
    editingDiscount.value = discount;
    isFormModalOpen.value = true;
    if (isDetailModalOpen.value) {
        isDetailModalOpen.value = false;
    }
}

function handleOpenDetail(discount: Discount) {
    inspectingDiscount.value = discount;
    isDetailModalOpen.value = true;
}

function handleOpenDelete(discount: Discount) {
    targetDiscountToDelete.value = discount;
    isDeleteDialogOpen.value = true;
    if (isDetailModalOpen.value) {
        isDetailModalOpen.value = false;
    }
}

async function handleFormSubmit(payload: DiscountPayload) {
    let success = false;
    if (editingDiscount.value) {
        success = await updateDiscount(editingDiscount.value.id, payload);
    } else {
        success = await createDiscount(payload);
    }
    if (success) {
        isFormModalOpen.value = false;
        editingDiscount.value = null;
    }
}

async function handleDeleteConfirm() {
    if (!targetDiscountToDelete.value) return;
    const success = await deleteDiscount(targetDiscountToDelete.value.id);
    if (success) {
        isDeleteDialogOpen.value = false;
        targetDiscountToDelete.value = null;
    }
}

function getStatusBadge(discount: Discount) {
    const s = getDiscountRealStatus(discount);
    if (s === 'active') {
        return {
            label: 'Aktif Berjalan',
            class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
            icon: CheckCircle2,
        };
    } else if (s === 'scheduled') {
        return {
            label: 'Akan Datang',
            class: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900',
            icon: Clock,
        };
    } else if (s === 'expired') {
        return {
            label: 'Kadaluarsa',
            class: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-900',
            icon: XCircle,
        };
    } else {
        return {
            label: 'Nonaktif',
            class: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700',
            icon: XCircle,
        };
    }
}
</script>

<template>
    <Head title="Manajemen Diskon & Promosi" />

    <div class="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <!-- Page Header -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Store class="size-3.5" />
                    <span>POS Master Data</span>
                    <ChevronRight class="size-3 text-neutral-400" />
                    <span class="text-neutral-900 dark:text-neutral-100">Diskon & Promo Kasir</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Manajemen Diskon & Promosi
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Atur potongan harga otomatis per transaksi atau per produk yang berlaku pada modul kasir POS.
                </p>
            </div>

            <div class="flex items-center gap-2.5">
                <button
                    type="button"
                    :disabled="isLoading"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    @click="fetchDiscounts"
                >
                    <RefreshCw class="size-3.5" :class="{ 'animate-spin': isLoading }" />
                    <span class="hidden sm:inline">Sinkronkan</span>
                </button>

                <button
                    type="button"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                    @click="handleOpenCreate"
                >
                    <Plus class="size-3.5" />
                    <span>Tambah Diskon</span>
                </button>
            </div>
        </div>

        <!-- 4 KPI Metrics Grid -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <!-- Card 1: Total Aturan Diskon -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Total Aturan Promo
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Tag class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalDiscounts }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">skema terdaftar</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-neutral-400"></span>
                    <span>Tersedia untuk kasir POS</span>
                </div>
            </div>

            <!-- Card 2: Active Discounts -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Diskon Aktif Berjalan
                    </span>
                    <div
                        class="flex size-7 items-center justify-center rounded-lg"
                        :class="activeDiscountsCount > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-400'"
                    >
                        <CheckCircle2 class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span
                        class="text-2xl font-bold tracking-tight font-mono"
                        :class="activeDiscountsCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-neutral-100'"
                    >
                        {{ activeDiscountsCount }}
                    </span>
                    <span
                        v-if="activeDiscountsCount > 0"
                        class="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 font-mono"
                    >
                        Live di Kasir
                    </span>
                    <span v-else class="text-[11px] text-neutral-400 font-medium">
                        Tidak ada promo aktif
                    </span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full" :class="activeDiscountsCount > 0 ? 'bg-emerald-500' : 'bg-neutral-400'"></span>
                    <span>Dalam rentang masa aktif</span>
                </div>
            </div>

            <!-- Card 3: Transaction Discounts -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Diskon Per Transaksi
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <Receipt class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ transactionDiscountsCount }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">skema checkout</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-indigo-500"></span>
                    <span>Memotong subtotal keranjang</span>
                </div>
            </div>

            <!-- Card 4: Product Level Discounts -->
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Diskon Per Produk
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                        <ShoppingBag class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ productDiscountsCount }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">skema menu</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-amber-500"></span>
                    <span>Memotong harga satuan barang</span>
                </div>
            </div>
        </div>

        <!-- Filter & Table Toolbar -->
        <div class="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <div class="flex flex-col gap-3.5 p-4 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-950/20">
                <!-- Top Row: Search & Filters -->
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex flex-wrap items-center gap-2">
                        <!-- Search Bar -->
                        <div class="relative w-full sm:w-72">
                            <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                            <input
                                v-model="searchQuery"
                                type="search"
                                placeholder="Cari nama diskon atau promo..."
                                class="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10"
                            />
                        </div>

                        <!-- Type Selector (% vs Rp) -->
                        <select
                            v-model="selectedType"
                            class="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        >
                            <option value="all">Semua Tipe (% & Rp)</option>
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed">Nominal Tetap (Rp)</option>
                        </select>

                        <!-- Scope Selector -->
                        <select
                            v-model="selectedAppliesTo"
                            class="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        >
                            <option value="all">Semua Cakupan</option>
                            <option value="transaction">Per Transaksi</option>
                            <option value="product">Per Produk</option>
                        </select>
                    </div>

                    <!-- Right Controls: Sort & Mode Switcher -->
                    <div class="flex items-center justify-between lg:justify-end gap-2.5">
                        <div class="flex items-center gap-1.5 text-xs text-neutral-500">
                            <span>Urutkan:</span>
                            <select
                                v-model="sortBy"
                                class="h-8 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                            >
                                <option value="id">Terbaru</option>
                                <option value="value">Nilai Diskon</option>
                                <option value="name">Nama Promo</option>
                                <option value="end_date">Tanggal Berakhir</option>
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
                                title="Tampilan Grid Voucher"
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
                        Semua Promo ({{ totalDiscounts }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'active'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-neutral-950 dark:text-emerald-400 dark:hover:bg-neutral-800 border border-emerald-200 dark:border-emerald-900/60'
                        "
                        @click="statusFilter = 'active'"
                    >
                        Aktif Berjalan ({{ activeDiscountsCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'transaction'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-white text-indigo-700 hover:bg-indigo-50 dark:bg-neutral-950 dark:text-indigo-400 dark:hover:bg-neutral-800 border border-indigo-200 dark:border-indigo-900/60'
                        "
                        @click="statusFilter = 'transaction'"
                    >
                        Per Transaksi ({{ transactionDiscountsCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'product'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-white text-amber-700 hover:bg-amber-50 dark:bg-neutral-950 dark:text-amber-400 dark:hover:bg-neutral-800 border border-amber-200 dark:border-amber-900/60'
                        "
                        @click="statusFilter = 'product'"
                    >
                        Per Produk ({{ productDiscountsCount }})
                    </button>
                    <button
                        type="button"
                        class="rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                        :class="
                            statusFilter === 'expired'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-white text-rose-700 hover:bg-rose-50 dark:bg-neutral-950 dark:text-rose-400 dark:hover:bg-neutral-800 border border-rose-200 dark:border-rose-900/60'
                        "
                        @click="statusFilter = 'expired'"
                    >
                        Kadaluarsa ({{ expiredDiscountsCount }})
                    </button>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="p-6 space-y-3">
                <div v-for="i in 5" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
            </div>

            <!-- Content Area -->
            <div v-else-if="filteredDiscounts.length > 0">
                <!-- Table View -->
                <div v-if="viewMode === 'table'" class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="border-b border-neutral-200/80 bg-neutral-50/60 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                            <tr>
                                <th class="px-4 py-3 w-14">ID</th>
                                <th class="px-4 py-3">Nama Diskon & Promo</th>
                                <th class="px-4 py-3 text-center">Tipe & Nilai</th>
                                <th class="px-4 py-3 text-center">Cakupan</th>
                                <th class="px-4 py-3">Periode Berlaku</th>
                                <th class="px-4 py-3 text-center">Status</th>
                                <th class="px-4 py-3 text-center">Sakelar</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                            <tr
                                v-for="item in filteredDiscounts"
                                :key="item.id"
                                class="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors group"
                            >
                                <!-- ID -->
                                <td class="px-4 py-3.5 font-mono text-[11px] text-neutral-500 font-semibold">
                                    #{{ item.id }}
                                </td>

                                <!-- Name & Info -->
                                <td class="px-4 py-3.5">
                                    <div class="flex items-center gap-2.5">
                                        <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                            <Tag class="size-3.5" />
                                        </div>
                                        <div>
                                            <div class="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                                                {{ item.name }}
                                            </div>
                                            <div class="text-[11px] text-neutral-400 font-mono">
                                                Simulasi Rp 50.000 &rarr; Potongan -{{ formatRupiah(calculateDiscountAmount(item, 50000)) }}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <!-- Type & Value -->
                                <td class="px-4 py-3.5 text-center font-mono">
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-black shadow-2xs"
                                        :class="
                                            item.type === 'percentage'
                                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                                                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                                        "
                                    >
                                        <Percent v-if="item.type === 'percentage'" class="size-3" />
                                        <Banknote v-else class="size-3" />
                                        {{ item.type === 'percentage' ? `${item.value}%` : formatRupiah(item.value) }}
                                    </span>
                                </td>

                                <!-- Scope (applies_to) -->
                                <td class="px-4 py-3.5 text-center">
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                        :class="
                                            item.applies_to === 'transaction'
                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                        "
                                    >
                                        <Receipt v-if="item.applies_to === 'transaction'" class="size-3" />
                                        <ShoppingBag v-else class="size-3" />
                                        {{ item.applies_to === 'transaction' ? 'Per Transaksi' : 'Per Produk' }}
                                    </span>
                                </td>

                                <!-- Date Range -->
                                <td class="px-4 py-3.5 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                    <div class="flex items-center gap-1">
                                        <Calendar class="size-3 text-neutral-400" />
                                        <span>{{ formatDate(item.start_date) }} &ndash; {{ formatDate(item.end_date) }}</span>
                                    </div>
                                </td>

                                <!-- Status Badge -->
                                <td class="px-4 py-3.5 text-center">
                                    <span
                                        class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono"
                                        :class="getStatusBadge(item).class"
                                    >
                                        <component :is="getStatusBadge(item).icon" class="size-3" />
                                        {{ getStatusBadge(item).label }}
                                    </span>
                                </td>

                                <!-- Toggle Switch -->
                                <td class="px-4 py-3.5 text-center">
                                    <label class="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            :checked="item.is_active"
                                            class="sr-only peer"
                                            @change="toggleDiscountStatus(item)"
                                        />
                                        <div class="w-8 h-4.5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:bg-neutral-700 peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"></div>
                                    </label>
                                </td>

                                <!-- Actions -->
                                <td class="px-4 py-3.5 text-right">
                                    <div class="inline-flex items-center gap-1">
                                        <button
                                            type="button"
                                            class="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                            title="Lihat Detail & Simulasi"
                                            @click="handleOpenDetail(item)"
                                        >
                                            <Eye class="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            class="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                                            title="Edit Aturan Diskon"
                                            @click="handleOpenEdit(item)"
                                        >
                                            <Edit3 class="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 transition-colors"
                                            title="Nonaktifkan Diskon"
                                            @click="handleOpenDelete(item)"
                                        >
                                            <Trash2 class="size-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Grid Voucher Card View -->
                <div v-else class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div
                        v-for="item in filteredDiscounts"
                        :key="item.id"
                        class="relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-all group overflow-hidden"
                    >
                        <!-- Top Decorative Header with Badges -->
                        <div>
                            <div class="flex items-start justify-between gap-2">
                                <span
                                    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                    :class="
                                        item.applies_to === 'transaction'
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                    "
                                >
                                    <Receipt v-if="item.applies_to === 'transaction'" class="size-3" />
                                    <ShoppingBag v-else class="size-3" />
                                    {{ item.applies_to === 'transaction' ? 'Per Transaksi' : 'Per Produk' }}
                                </span>

                                <span
                                    class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold font-mono"
                                    :class="getStatusBadge(item).class"
                                >
                                    <component :is="getStatusBadge(item).icon" class="size-3" />
                                    {{ getStatusBadge(item).label }}
                                </span>
                            </div>

                            <!-- Name & Big Value Banner -->
                            <div class="mt-3">
                                <h4 class="text-base font-bold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                                    {{ item.name }}
                                </h4>
                                <div class="mt-1 flex items-baseline gap-1 font-mono">
                                    <span class="text-2xl font-black text-rose-600 dark:text-rose-400">
                                        {{ item.type === 'percentage' ? `${item.value}%` : formatRupiah(item.value) }}
                                    </span>
                                    <span class="text-[11px] text-neutral-400">
                                        {{ item.type === 'percentage' ? 'potongan subtotal' : 'potongan langsung' }}
                                    </span>
                                </div>
                            </div>

                            <!-- Validity & Simulation Card -->
                            <div class="mt-3 rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-950/40 space-y-1.5">
                                <div class="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                                    <span>Berlaku s/d:</span>
                                    <span class="font-bold text-neutral-800 dark:text-neutral-200">
                                        {{ formatDate(item.end_date) }}
                                    </span>
                                </div>
                                <div class="flex items-center justify-between text-[11px] font-mono text-neutral-500">
                                    <span>Simulasi Rp 50.000:</span>
                                    <span class="font-bold text-emerald-600 dark:text-emerald-400">
                                        {{ formatRupiah(Math.max(0, 50000 - calculateDiscountAmount(item, 50000))) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Card Footer -->
                        <div class="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    :checked="item.is_active"
                                    class="sr-only peer"
                                    @change="toggleDiscountStatus(item)"
                                />
                                <div class="w-8 h-4.5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:bg-neutral-700 peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"></div>
                            </label>

                            <div class="flex items-center gap-1">
                                <button
                                    type="button"
                                    class="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                    @click="handleOpenDetail(item)"
                                >
                                    <Eye class="size-3 text-neutral-400" />
                                    <span>Detail</span>
                                </button>
                                <button
                                    type="button"
                                    class="inline-flex items-center gap-1 rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                                    @click="handleOpenEdit(item)"
                                >
                                    <Edit3 class="size-3" />
                                    <span>Edit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center p-12 text-center">
                <div class="flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
                    <Tag class="size-6" />
                </div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {{ searchQuery || selectedType !== 'all' || selectedAppliesTo !== 'all' || statusFilter !== 'all' ? 'Data Diskon Tidak Ditemukan' : 'Belum Ada Aturan Diskon' }}
                </h3>
                <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                    {{
                        searchQuery || selectedType !== 'all' || selectedAppliesTo !== 'all' || statusFilter !== 'all'
                            ? 'Tidak ada aturan promo yang sesuai dengan filter Anda. Coba sesuaikan kata kunci pencarian atau tab filter.'
                            : 'Tambahkan diskon baru untuk memberikan potongan harga otomatis bagi pelanggan saat checkout kasir.'
                    }}
                </p>
                <div class="mt-4 flex items-center gap-2">
                    <button
                        v-if="searchQuery || selectedType !== 'all' || selectedAppliesTo !== 'all' || statusFilter !== 'all'"
                        type="button"
                        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                        @click="searchQuery = ''; selectedType = 'all'; selectedAppliesTo = 'all'; statusFilter = 'all'"
                    >
                        Reset Filter
                    </button>
                    <button
                        v-else
                        type="button"
                        class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                        @click="handleOpenCreate"
                    >
                        <Plus class="size-3.5" />
                        <span>Tambah Diskon Pertama</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <DiscountFormModal
        v-model:open="isFormModalOpen"
        :discount="editingDiscount"
        :is-submitting="isSubmitting"
        :errors="errors"
        @submit="handleFormSubmit"
    />

    <DiscountDetailModal
        v-model:open="isDetailModalOpen"
        :discount="inspectingDiscount"
        @edit="handleOpenEdit"
        @toggle="toggleDiscountStatus"
        @delete="handleOpenDelete"
    />

    <DiscountDeleteDialog
        v-model:open="isDeleteDialogOpen"
        :discount="targetDiscountToDelete"
        :is-deleting="isSubmitting"
        @confirm="handleDeleteConfirm"
    />
</template>
