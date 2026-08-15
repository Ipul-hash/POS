<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { Award, ChevronRight, Package } from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { BestSellerItem } from '@/types';

defineProps<{
    items: BestSellerItem[];
}>();
</script>

<template>
    <div class="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
            <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Performa Produk
                </span>
                <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5">
                    Menu Terlaris (Best Sellers)
                </h3>
            </div>
            <div class="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <Award class="size-4" />
            </div>
        </div>

        <!-- Best Seller List -->
        <div class="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800/80 flex-1">
            <div
                v-for="(item, idx) in items"
                :key="item.product_id"
                class="py-3 flex items-center justify-between gap-3 group hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 rounded-xl px-2 -mx-2 transition-colors"
            >
                <!-- Left: Rank & Image & Info -->
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <!-- Rank Badge -->
                    <div
                        class="flex size-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-extrabold"
                        :class="
                            idx === 0
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                                : idx === 1
                                ? 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200'
                                : idx === 2
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400'
                        "
                    >
                        {{ idx + 1 }}
                    </div>

                    <!-- Image Thumbnail -->
                    <div class="size-10 shrink-0 rounded-xl bg-neutral-100 overflow-hidden flex items-center justify-center dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700">
                        <img
                            v-if="item.image_url"
                            :src="item.image_url"
                            :alt="item.name"
                            class="size-full object-cover"
                            @error="($event.target as HTMLElement).style.display = 'none'"
                        />
                        <Package v-else class="size-5 text-neutral-400" />
                    </div>

                    <!-- Name & Category -->
                    <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {{ item.name }}
                        </h4>
                        <div class="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono mt-0.5">
                            <span class="rounded bg-neutral-100 px-1 dark:bg-neutral-800 font-sans">{{ item.category }}</span>
                            <span>&bull;</span>
                            <span>Stok: {{ item.current_stock }}</span>
                        </div>
                    </div>
                </div>

                <!-- Right: Sold Qty & Revenue -->
                <div class="text-right shrink-0 font-mono">
                    <div class="text-xs font-black text-neutral-900 dark:text-neutral-100">
                        {{ item.total_qty_sold }} <span class="text-[10px] font-normal text-neutral-500">terjual</span>
                    </div>
                    <div class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {{ formatRupiah(item.total_revenue) }}
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="items.length === 0" class="py-8 text-center text-neutral-400 text-xs">
                Belum ada transaksi penjualan pada periode ini
            </div>
        </div>

        <!-- Footer link to Products -->
        <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 mt-2">
            <Link
                href="/master-data/products"
                class="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
                <span>Lihat Semua Katalog Produk</span>
                <ChevronRight class="size-3.5" />
            </Link>
        </div>
    </div>
</template>
