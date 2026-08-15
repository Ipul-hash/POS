<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { ChevronRight, Clock, User, Users } from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { CashierPerformanceItem } from '@/types';

defineProps<{
    items: CashierPerformanceItem[];
}>();
</script>

<template>
    <div class="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
            <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Operasional & Tim
                </span>
                <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5">
                    Kinerja Kasir & Shift
                </h3>
            </div>
            <div class="flex size-8 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <Users class="size-4" />
            </div>
        </div>

        <!-- Leaderboard List -->
        <div class="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800/80 flex-1">
            <div
                v-for="item in items"
                :key="item.cashier_id"
                class="py-3 flex items-center justify-between gap-3 group"
            >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <!-- Avatar initial -->
                    <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-bold text-xs">
                        {{ item.name.slice(0, 2).toUpperCase() }}
                    </div>

                    <div class="min-w-0 flex-1">
                        <h4 class="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {{ item.name }}
                        </h4>
                        <div class="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono mt-0.5">
                            <span>{{ item.total_shifts }} shift</span>
                            <span>&bull;</span>
                            <span>{{ item.total_transactions }} nota</span>
                        </div>
                    </div>
                </div>

                <!-- Right: Omzet -->
                <div class="text-right shrink-0 font-mono">
                    <div class="text-xs font-black text-neutral-900 dark:text-neutral-100">
                        {{ formatRupiah(item.total_revenue) }}
                    </div>
                    <div
                        v-if="item.cash_variance !== 0"
                        class="text-[10px] font-bold"
                        :class="item.cash_variance > 0 ? 'text-blue-600' : 'text-rose-600'"
                    >
                        Selisih: {{ item.cash_variance > 0 ? `+${formatRupiah(item.cash_variance)}` : `-${formatRupiah(Math.abs(item.cash_variance))}` }}
                    </div>
                    <div v-else class="text-[10px] text-emerald-600 font-medium">
                        Kas Sesuai (0)
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-if="items.length === 0" class="py-8 text-center text-xs text-neutral-400">
                Belum ada aktivitas shift kasir pada periode ini
            </div>
        </div>

        <!-- Footer Link to Shifts -->
        <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 mt-2">
            <Link
                href="/pos/shifts"
                class="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            >
                <Clock class="size-3.5" />
                <span>Buka Manajemen Shift Kasir</span>
                <ChevronRight class="size-3.5" />
            </Link>
        </div>
    </div>
</template>
