<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { AlertTriangle, Boxes, ChevronRight, PlusCircle } from '@lucide/vue';
import type { LowStockItem } from '@/types';

defineProps<{
    items: LowStockItem[];
    lowStockCount: number;
}>();
</script>

<template>
    <div class="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
            <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Inventori & Gudang
                </span>
                <div class="flex items-center gap-2 mt-0.5">
                    <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                        Peringatan Stok Menipis
                    </h3>
                    <span
                        v-if="lowStockCount > 0"
                        class="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold font-mono text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                    >
                        {{ lowStockCount }} item
                    </span>
                </div>
            </div>
            <div class="flex size-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertTriangle class="size-4" />
            </div>
        </div>

        <!-- Low Stock Items List -->
        <div class="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800/80 flex-1">
            <div
                v-for="item in items"
                :key="item.id"
                class="py-3 flex items-center justify-between gap-3 group"
            >
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                        <h4 class="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {{ item.name }}
                        </h4>
                        <span
                            class="shrink-0 rounded px-1.5 py-0.2 text-[9px] font-bold font-mono"
                            :class="
                                item.quantity <= 0
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            "
                        >
                            {{ item.quantity <= 0 ? 'Habis (0)' : `Sisa ${item.quantity}` }}
                        </span>
                    </div>

                    <!-- Progress bar of stock level -->
                    <div class="mt-1.5 flex items-center gap-2">
                        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                            <div
                                class="h-full rounded-full transition-all"
                                :class="item.quantity <= 0 ? 'bg-rose-500' : 'bg-amber-500'"
                                :style="{ width: `${Math.max(5, item.percentage)}%` }"
                            ></div>
                        </div>
                        <span class="text-[10px] font-mono text-neutral-400 shrink-0">
                            Min: {{ item.min_stock }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Empty State (No low stock alert) -->
            <div v-if="items.length === 0" class="py-8 text-center text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Semua stok produk berada di batas aman (tidak ada stok kritis)
            </div>
        </div>

        <!-- Footer link to Inventory Adjustment -->
        <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 mt-2">
            <Link
                href="/inventory"
                class="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
                <Boxes class="size-3.5" />
                <span>Buka Manajemen Inventori & Stok</span>
                <ChevronRight class="size-3.5" />
            </Link>
        </div>
    </div>
</template>
