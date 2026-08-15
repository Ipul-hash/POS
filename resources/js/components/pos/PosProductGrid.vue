<script setup lang="ts">
import { ref } from 'vue';
import {
    Search,
    Package,
    Plus,
    Barcode,
    Layers,
    Sparkles,
    AlertCircle,
    Check,
} from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { Category, Product } from '@/types';

const props = defineProps<{
    products: Product[];
    categories: Category[];
    searchQuery: string;
    selectedCategoryId: number | string | 'all';
    isLoading: boolean;
    getCartQuantity: (productId: number) => number;
    getProductStock: (product: Product) => number;
}>();

const emit = defineEmits<{
    (e: 'update:searchQuery', value: string): void;
    (e: 'update:selectedCategoryId', value: number | string | 'all'): void;
    (e: 'addToCart', product: Product): void;
}>();

function handleCardClick(product: Product) {
    if (props.getProductStock(product) <= 0) return;
    emit('addToCart', product);
}
</script>

<template>
    <div class="flex flex-1 flex-col h-full overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/30 p-4 sm:p-5">
        <!-- Search & Filter Bar -->
        <div class="space-y-3.5 shrink-0 pb-4 border-b border-neutral-200/80 dark:border-neutral-800">
            <div class="relative w-full">
                <Search class="absolute left-3.5 top-3 size-4 text-neutral-400" />
                <input
                    :value="searchQuery"
                    type="search"
                    placeholder="Scan barcode atau cari nama produk, SKU..."
                    class="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10 shadow-2xs"
                    @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
                />
            </div>

            <!-- Category Pills (Horizontal Scroll) -->
            <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                    type="button"
                    class="shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all"
                    :class="
                        selectedCategoryId === 'all'
                            ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                    "
                    @click="emit('update:selectedCategoryId', 'all')"
                >
                    Semua Menu ({{ products.length }})
                </button>
                <button
                    v-for="cat in categories"
                    :key="cat.id"
                    type="button"
                    class="shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all"
                    :class="
                        selectedCategoryId === cat.id
                            ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                            : 'bg-white text-neutral-600 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800'
                    "
                    @click="emit('update:selectedCategoryId', cat.id)"
                >
                    {{ cat.name }}
                </button>
            </div>
        </div>

        <!-- Product Grid Area -->
        <div class="flex-1 overflow-y-auto pt-4 pr-1">
            <!-- Loading Skeleton -->
            <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
                <div
                    v-for="i in 10"
                    :key="i"
                    class="h-48 animate-pulse rounded-2xl bg-neutral-200/60 dark:bg-neutral-800/60"
                ></div>
            </div>

            <!-- Product Card Grid -->
            <div
                v-else-if="products.length > 0"
                class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3.5"
            >
                <div
                    v-for="product in products"
                    :key="product.id"
                    class="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-3 shadow-2xs transition-all select-none cursor-pointer"
                    :class="[
                        getProductStock(product) <= 0
                            ? 'opacity-60 grayscale border-neutral-200 bg-neutral-50 cursor-not-allowed dark:border-neutral-800 dark:bg-neutral-950'
                            : getCartQuantity(product.id) > 0
                            ? 'border-neutral-900/50 bg-neutral-50/50 ring-2 ring-neutral-900/10 dark:border-neutral-100/50 dark:bg-neutral-900/50 dark:ring-neutral-100/10'
                            : 'border-neutral-200/80 hover:border-neutral-300 hover:shadow-md active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'
                    ]"
                    @click="handleCardClick(product)"
                >
                    <!-- Cart Counter Badge (Top Right) -->
                    <div
                        v-if="getCartQuantity(product.id) > 0"
                        class="absolute top-2 right-2 z-10 flex size-6 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-mono text-[11px] font-extrabold shadow-sm animate-in zoom-in-50 duration-150"
                    >
                        {{ getCartQuantity(product.id) }}
                    </div>

                    <!-- Image Thumbnail -->
                    <div>
                        <div class="relative aspect-4/3 w-full rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center dark:bg-neutral-800 mb-2.5">
                            <img
                                v-if="product.image_url"
                                :src="product.image_url"
                                :alt="product.name"
                                class="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                                @error="($event.target as HTMLElement).style.display = 'none'"
                            />
                            <Package v-else class="size-8 text-neutral-400" />

                            <!-- SKU Tag (Bottom Left of image) -->
                            <div class="absolute bottom-1.5 left-1.5">
                                <span class="rounded-md bg-neutral-900/80 backdrop-blur-xs px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                                    {{ product.sku }}
                                </span>
                            </div>
                        </div>

                        <!-- Product Info -->
                        <div class="text-[10px] font-medium text-neutral-400 line-clamp-1">
                            {{ product.category?.name || 'Menu' }}
                        </div>
                        <h4 class="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-tight mt-0.5">
                            {{ product.name }}
                        </h4>
                    </div>

                    <!-- Bottom Price & Stock Row -->
                    <div class="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                        <div>
                            <span class="text-xs sm:text-sm font-black font-mono text-neutral-900 dark:text-neutral-100 block">
                                {{ formatRupiah(product.sell_price) }}
                            </span>
                        </div>

                        <!-- Stock Badge -->
                        <div>
                            <span
                                v-if="getProductStock(product) <= 0"
                                class="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 font-mono"
                            >
                                Habis
                            </span>
                            <span
                                v-else-if="getProductStock(product) <= (product.inventory?.min_stock ?? 5)"
                                class="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-mono"
                            >
                                Sisa {{ getProductStock(product) }}
                            </span>
                            <span
                                v-else
                                class="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-mono"
                            >
                                Stok {{ getProductStock(product) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex flex-col items-center justify-center p-12 text-center h-64">
                <Package class="size-10 text-neutral-300 dark:text-neutral-700 mb-2" />
                <h4 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                    Produk Tidak Ditemukan
                </h4>
                <p class="text-xs text-neutral-400 mt-0.5">
                    Tidak ada menu yang sesuai dengan kata kunci pencarian atau kategori ini.
                </p>
            </div>
        </div>
    </div>
</template>
