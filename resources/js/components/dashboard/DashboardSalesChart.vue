<script setup lang="ts">
import { computed, ref } from 'vue';
import { BarChart3, TrendingUp } from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { SalesTimeSeriesItem } from '@/types';

const props = defineProps<{
    data: SalesTimeSeriesItem[];
    totalRevenue: number;
    totalTransactions: number;
}>();

const hoveredIndex = ref<number | null>(null);

const maxRevenue = computed(() => {
    if (!props.data.length) return 100000;
    const max = Math.max(...props.data.map((d) => d.revenue));
    return max > 0 ? max : 100000;
});
</script>

<template>
    <div class="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
            <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Tren Penjualan Outlet
                </span>
                <div class="mt-1 flex items-baseline gap-2">
                    <h3 class="text-xl font-black text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ formatRupiah(totalRevenue) }}
                    </h3>
                    <span class="text-xs text-neutral-400 font-medium">
                        ({{ totalTransactions }} transaksi)
                    </span>
                </div>
            </div>

            <div class="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <TrendingUp class="size-4" />
            </div>
        </div>

        <!-- Chart Bars Area -->
        <div class="pt-6 pb-2">
            <div v-if="data.length > 0" class="flex items-end justify-between gap-2 h-44 sm:h-52 w-full pt-4">
                <div
                    v-for="(item, idx) in data"
                    :key="item.date"
                    class="relative flex flex-1 flex-col items-center h-full justify-end group cursor-pointer"
                    @mouseenter="hoveredIndex = idx"
                    @mouseleave="hoveredIndex = null"
                >
                    <!-- Tooltip Card -->
                    <div
                        v-if="hoveredIndex === idx"
                        class="absolute -top-14 z-20 whitespace-nowrap rounded-xl bg-neutral-900 px-3 py-1.5 text-center text-white shadow-xl dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-mono animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
                    >
                        <div class="font-bold">{{ formatRupiah(item.revenue) }}</div>
                        <div class="text-[10px] text-neutral-300 dark:text-neutral-600">
                            {{ item.transactions_count }} transaksi &bull; {{ item.label }}
                        </div>
                    </div>

                    <!-- Bar Stick -->
                    <div class="w-full max-w-[40px] flex items-end h-full">
                        <div
                            class="w-full rounded-t-xl transition-all duration-300 group-hover:opacity-90"
                            :class="
                                hoveredIndex === idx
                                    ? 'bg-indigo-600 dark:bg-indigo-400 shadow-md ring-2 ring-indigo-300 dark:ring-indigo-700'
                                    : item.revenue > 0
                                    ? 'bg-gradient-to-t from-indigo-500 to-indigo-400/80 dark:from-indigo-600 dark:to-indigo-500'
                                    : 'bg-neutral-100 dark:bg-neutral-800'
                            "
                            :style="{
                                height: `${Math.max(8, Math.round((item.revenue / maxRevenue) * 100))}%`,
                            }"
                        ></div>
                    </div>

                    <!-- Label -->
                    <span class="mt-2 text-[10px] font-mono font-medium text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 truncate w-full text-center">
                        {{ item.day_name || item.label }}
                    </span>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="flex h-44 items-center justify-center text-neutral-400 text-xs">
                Belum ada data penjualan pada periode ini
            </div>
        </div>
    </div>
</template>
