<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Head } from '@inertiajs/vue3';
import {
    Plus,
    Search,
    RefreshCw,
    Eye,
    Pencil,
    Trash2,
    FolderTree,
    Package,
    Layers,
    Activity,
    LayoutGrid,
    List,
    TrendingUp,
    ChevronRight,
    CircleDot,
    Store,
} from '@lucide/vue';
import CategoryDeleteDialog from '@/components/master-data/category/CategoryDeleteDialog.vue';
import CategoryDetailModal from '@/components/master-data/category/CategoryDetailModal.vue';
import CategoryFormModal from '@/components/master-data/category/CategoryFormModal.vue';
import { useCategory } from '@/composables/useCategory';
import { formatDateTime, formatRupiah } from '@/lib/formatters';
import type { BreadcrumbItem, Category, CategoryPayload } from '@/types';

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
                title: 'Kategori',
                href: '/master-data/categories',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    filteredCategories,
    selectedCategory,
    isLoading,
    isSubmitting,
    searchQuery,
    errors,
    totalCategories,
    totalCategoriesWithProducts,
    totalProductsCount,
    fetchCategories,
    fetchCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory,
    setSelectedCategory,
} = useCategory();

const isFormModalOpen = ref(false);
const isDetailModalOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const categoryToEdit = ref<Category | null>(null);
const categoryToDelete = ref<Category | null>(null);

const activeFilterTab = ref<'all' | 'with_products' | 'empty'>('all');
const viewMode = ref<'table' | 'grid'>('table');

onMounted(() => {
    fetchCategories();
});

const processedCategories = computed(() => {
    let list = filteredCategories.value;
    if (activeFilterTab.value === 'with_products') {
        list = list.filter((c) => (c.products?.length ?? 0) > 0);
    } else if (activeFilterTab.value === 'empty') {
        list = list.filter((c) => (c.products?.length ?? 0) === 0);
    }
    return list;
});

const totalInventoryValuation = computed(() => {
    return filteredCategories.value.reduce((acc, cat) => {
        const catSum = (cat.products || []).reduce(
            (pAcc, p) => pAcc + (parseFloat(String(p.sell_price)) || 0),
            0
        );
        return acc + catSum;
    }, 0);
});

const emptyCategoriesCount = computed(() => {
    return Math.max(0, totalCategories.value - totalCategoriesWithProducts.value);
});

const activePercentage = computed(() => {
    if (totalCategories.value === 0) return 0;
    return Math.round((totalCategoriesWithProducts.value / totalCategories.value) * 100);
});

function handleOpenCreate() {
    categoryToEdit.value = null;
    isFormModalOpen.value = true;
}

function handleOpenEdit(category: Category) {
    categoryToEdit.value = { ...category };
    isFormModalOpen.value = true;
}

async function handleOpenDetail(category: Category) {
    setSelectedCategory(category);
    isDetailModalOpen.value = true;
    if (category.id) {
        await fetchCategoryDetail(category.id);
    }
}

function handleOpenDelete(category: Category) {
    categoryToDelete.value = category;
    isDeleteDialogOpen.value = true;
}

async function handleFormSubmit(payload: CategoryPayload) {
    if (categoryToEdit.value?.id) {
        const success = await updateCategory(categoryToEdit.value.id, payload);
        if (success) {
            isFormModalOpen.value = false;
            categoryToEdit.value = null;
        }
    } else {
        const success = await createCategory(payload);
        if (success) {
            isFormModalOpen.value = false;
        }
    }
}

async function handleDeleteConfirm() {
    if (!categoryToDelete.value?.id) return;
    const success = await deleteCategory(categoryToDelete.value.id);
    if (success) {
        isDeleteDialogOpen.value = false;
        categoryToDelete.value = null;
    }
}
</script>

<template>
    <Head title="Master Data Kategori" />

    <div class="flex flex-1 flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200/80 pb-5 dark:border-neutral-800">
            <div>
                <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    <Store class="size-3.5" />
                    <span>POS Master Data</span>
                    <ChevronRight class="size-3 text-neutral-400" />
                    <span class="text-neutral-900 dark:text-neutral-100">Katalog Toko</span>
                </div>
                <h1 class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
                    Klasifikasi Kategori Produk
                </h1>
                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                    Manajemen kategori untuk pengelompokan produk, alur kasir POS, dan pelaporan penjualan.
                </p>
            </div>

            <div class="flex items-center gap-2.5">
                <button
                    type="button"
                    :disabled="isLoading"
                    class="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs font-semibold text-neutral-700 shadow-2xs hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    @click="fetchCategories"
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
                    <span>Tambah Kategori</span>
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Total Kategori
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <FolderTree class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalCategories }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">klasifikasi</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-neutral-400"></span>
                    <span>{{ emptyCategoriesCount }} kategori belum memiliki produk</span>
                </div>
            </div>

            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Kategori Aktif
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                        <Layers class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalCategoriesWithProducts }}
                    </span>
                    <span class="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 font-mono">
                        {{ activePercentage }}% Aktif
                    </span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <span class="size-1.5 rounded-full bg-emerald-500"></span>
                    <span>Tersedia pada modul kasir POS</span>
                </div>
            </div>

            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Total Produk
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Package class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ totalProductsCount }}
                    </span>
                    <span class="text-[11px] text-neutral-400 font-medium">item SKU</span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Activity class="size-3 text-neutral-400" />
                    <span>Rata-rata {{ totalCategories ? (totalProductsCount / totalCategories).toFixed(1) : 0 }} item / kategori</span>
                </div>
            </div>

            <div class="relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
                <div class="flex items-center justify-between">
                    <span class="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
                        Estimasi Nilai Jual
                    </span>
                    <div class="flex size-7 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <TrendingUp class="size-3.5" />
                    </div>
                </div>
                <div class="mt-2 flex items-baseline gap-2">
                    <span class="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-mono truncate">
                        {{ formatRupiah(totalInventoryValuation) }}
                    </span>
                </div>
                <div class="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <CircleDot class="size-2.5 text-neutral-400" />
                    <span>Akumulasi harga jual katalog</span>
                </div>
            </div>
        </div>

        <div class="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
            <div class="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-950/20">
                <div class="flex flex-wrap items-center gap-2">
                    <div class="relative w-full sm:w-72">
                        <Search class="absolute left-3 top-2.5 size-3.5 text-neutral-400" />
                        <input
                            v-model="searchQuery"
                            type="search"
                            placeholder="Cari nama atau deskripsi..."
                            class="h-9 w-full rounded-xl border border-neutral-200 bg-white pl-8 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10"
                        />
                    </div>

                    <div class="inline-flex rounded-xl border border-neutral-200 bg-white p-0.5 dark:border-neutral-800 dark:bg-neutral-950">
                        <button
                            type="button"
                            class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
                            :class="
                                activeFilterTab === 'all'
                                    ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                            "
                            @click="activeFilterTab = 'all'"
                        >
                            Semua ({{ totalCategories }})
                        </button>
                        <button
                            type="button"
                            class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
                            :class="
                                activeFilterTab === 'with_products'
                                    ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                            "
                            @click="activeFilterTab = 'with_products'"
                        >
                            Berisi Produk ({{ totalCategoriesWithProducts }})
                        </button>
                        <button
                            type="button"
                            class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
                            :class="
                                activeFilterTab === 'empty'
                                    ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                            "
                            @click="activeFilterTab = 'empty'"
                        >
                            Kosong ({{ emptyCategoriesCount }})
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between sm:justify-end gap-3">
                    <span class="text-xs text-neutral-500 font-mono">
                        {{ processedCategories.length }} Kategori
                    </span>

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
                            title="Tampilan Grid"
                            @click="viewMode = 'grid'"
                        >
                            <LayoutGrid class="size-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="isLoading" class="p-6 space-y-3">
                <div v-for="i in 4" :key="i" class="h-12 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"></div>
            </div>

            <div v-else-if="processedCategories.length > 0">
                <div v-if="viewMode === 'table'" class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="border-b border-neutral-200/80 bg-neutral-50/60 font-semibold uppercase tracking-wider text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-neutral-400">
                            <tr>
                                <th class="px-4 py-3 w-16">ID</th>
                                <th class="px-4 py-3">Nama Kategori</th>
                                <th class="px-4 py-3">Deskripsi</th>
                                <th class="px-4 py-3 text-center">Jumlah SKU</th>
                                <th class="px-4 py-3">Koleksi Produk</th>
                                <th class="px-4 py-3">Pembaruan Terakhir</th>
                                <th class="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                            <tr
                                v-for="category in processedCategories"
                                :key="category.id"
                                class="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/30 transition-colors group"
                            >
                                <td class="px-4 py-3.5 font-mono text-[11px] text-neutral-500 font-semibold">
                                    #{{ category.id }}
                                </td>
                                <td class="px-4 py-3.5">
                                    <div class="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                                        {{ category.name }}
                                    </div>
                                </td>
                                <td class="px-4 py-3.5 text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                                    {{ category.description || '-' }}
                                </td>
                                <td class="px-4 py-3.5 text-center font-mono">
                                    <button
                                        type="button"
                                        class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all"
                                        :class="
                                            (category.products?.length ?? 0) > 0
                                                ? 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'
                                                : 'border border-dashed border-neutral-300 text-neutral-400 dark:border-neutral-700'
                                        "
                                        @click="handleOpenDetail(category)"
                                    >
                                        <span>{{ category.products?.length ?? 0 }} Produk</span>
                                    </button>
                                </td>
                                <td class="px-4 py-3.5">
                                    <div v-if="category.products && category.products.length > 0" class="flex items-center -space-x-1.5">
                                        <template v-for="(p, idx) in category.products.slice(0, 3)" :key="p.id">
                                            <div
                                                class="size-6 rounded-md border border-white bg-neutral-100 dark:border-neutral-900 dark:bg-neutral-800 flex items-center justify-center text-[9px] font-bold text-neutral-600 dark:text-neutral-300 overflow-hidden shadow-2xs"
                                                :title="p.name"
                                            >
                                                <img
                                                    v-if="p.image_url"
                                                    :src="p.image_url"
                                                    :alt="p.name"
                                                    class="size-full object-cover"
                                                    @error="($event.target as HTMLElement).style.display = 'none'"
                                                />
                                                <span v-else>{{ p.name.charAt(0) }}</span>
                                            </div>
                                        </template>
                                        <span v-if="category.products.length > 3" class="pl-2 text-[10px] text-neutral-400 font-mono">
                                            +{{ category.products.length - 3 }}
                                        </span>
                                    </div>
                                    <span v-else class="text-[11px] text-neutral-400 italic">
                                        Belum ada item
                                    </span>
                                </td>
                                <td class="px-4 py-3.5 text-neutral-500 font-mono text-[11px]">
                                    {{ formatDateTime(category.updated_at || category.created_at) }}
                                </td>
                                <td class="px-4 py-3.5 text-right">
                                    <div class="inline-flex items-center gap-1">
                                        <button
                                            type="button"
                                            title="Lihat Detail Produk"
                                            class="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                                            @click="handleOpenDetail(category)"
                                        >
                                            <Eye class="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Edit Kategori"
                                            class="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors"
                                            @click="handleOpenEdit(category)"
                                        >
                                            <Pencil class="size-4" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Hapus Kategori"
                                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-colors"
                                            @click="handleOpenDelete(category)"
                                        >
                                            <Trash2 class="size-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div
                        v-for="category in processedCategories"
                        :key="category.id"
                        class="flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 shadow-2xs hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 transition-all group"
                    >
                        <div>
                            <div class="flex items-start justify-between gap-2">
                                <span class="rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-[10px] font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    ID #{{ category.id }}
                                </span>
                                <span
                                    class="rounded-md px-2 py-0.5 text-[10px] font-bold font-mono"
                                    :class="
                                        (category.products?.length ?? 0) > 0
                                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                            : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                                    "
                                >
                                    {{ category.products?.length ?? 0 }} Produk
                                </span>
                            </div>

                            <h4 class="mt-2.5 text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {{ category.name }}
                            </h4>
                            <p class="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                                {{ category.description || 'Tidak ada catatan deskripsi.' }}
                            </p>
                        </div>

                        <div class="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                            <span class="text-[10px] font-mono text-neutral-400">
                                {{ formatDateTime(category.updated_at || category.created_at) }}
                            </span>

                            <div class="flex items-center gap-1">
                                <button
                                    type="button"
                                    class="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    @click="handleOpenDetail(category)"
                                >
                                    <Eye class="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    class="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
                                    @click="handleOpenEdit(category)"
                                >
                                    <Pencil class="size-3.5" />
                                </button>
                                <button
                                    type="button"
                                    class="rounded-lg p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                                    @click="handleOpenDelete(category)"
                                >
                                    <Trash2 class="size-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="flex flex-col items-center justify-center p-12 text-center">
                <div class="flex size-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
                    <FolderTree class="size-6" />
                </div>
                <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {{ searchQuery ? 'Kategori Tidak Ditemukan' : 'Belum Ada Master Data Kategori' }}
                </h3>
                <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm">
                    {{
                        searchQuery
                            ? 'Tidak ada kategori yang cocok dengan pencarian Anda. Coba kata kunci lain.'
                            : 'Klasifikasikan produk toko Anda ke dalam kategori terstruktur untuk memudahkan kasir POS.'
                    }}
                </p>
                <button
                    v-if="!searchQuery"
                    type="button"
                    class="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                    @click="handleOpenCreate"
                >
                    <Plus class="size-4" />
                    <span>Tambah Kategori Sekarang</span>
                </button>
            </div>
        </div>
    </div>

    <CategoryFormModal
        v-model:open="isFormModalOpen"
        :category="categoryToEdit"
        :is-submitting="isSubmitting"
        :errors="errors"
        @submit="handleFormSubmit"
    />

    <CategoryDetailModal
        v-model:open="isDetailModalOpen"
        :category="selectedCategory"
    />

    <CategoryDeleteDialog
        v-model:open="isDeleteDialogOpen"
        :category="categoryToDelete"
        :is-submitting="isSubmitting"
        @confirm="handleDeleteConfirm"
    />
</template>
