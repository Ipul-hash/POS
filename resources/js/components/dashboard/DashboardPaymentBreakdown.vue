<script setup lang="ts">
import { Banknote, CreditCard, QrCode, Smartphone, Wallet } from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { PaymentMethodDistribution } from '@/types';

defineProps<{
    data: PaymentMethodDistribution[];
}>();

const methodIcons: Record<string, typeof Banknote> = {
    cash: Banknote,
    qris: QrCode,
    debit: CreditCard,
    credit: CreditCard,
    ewallet: Smartphone,
};

const methodColors: Record<string, { bar: string; text: string; bg: string }> = {
    cash: { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
    qris: { bar: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
    debit: { bar: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/60' },
    credit: { bar: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60' },
    ewallet: { bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' },
};
</script>

<template>
    <div class="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 flex flex-col justify-between">
        <!-- Header -->
        <div class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
            <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Metode Pembayaran
                </span>
                <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5">
                    Distribusi Transaksi Kasir
                </h3>
            </div>
            <div class="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Wallet class="size-4" />
            </div>
        </div>

        <!-- Breakdown List -->
        <div class="mt-4 space-y-3.5 flex-1">
            <div
                v-for="item in data"
                :key="item.method"
                class="space-y-1.5"
            >
                <div class="flex items-center justify-between text-xs font-mono">
                    <div class="flex items-center gap-2 font-sans font-semibold text-neutral-800 dark:text-neutral-200">
                        <div
                            class="flex size-6 items-center justify-center rounded-lg"
                            :class="methodColors[item.method]?.bg || 'bg-neutral-100 dark:bg-neutral-800'"
                        >
                            <component
                                :is="methodIcons[item.method] || Banknote"
                                class="size-3.5"
                                :class="methodColors[item.method]?.text || 'text-neutral-600'"
                            />
                        </div>
                        <span>{{ item.label }}</span>
                        <span class="text-[10px] text-neutral-400 font-normal">({{ item.count }}x)</span>
                    </div>

                    <div class="flex items-baseline gap-2">
                        <span class="font-bold text-neutral-900 dark:text-neutral-100">
                            {{ formatRupiah(item.amount) }}
                        </span>
                        <span class="text-[11px] font-bold text-neutral-400 w-10 text-right">
                            {{ item.percentage }}%
                        </span>
                    </div>
                </div>

                <!-- Progress bar -->
                <div class="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                        class="h-full rounded-full transition-all duration-500"
                        :class="methodColors[item.method]?.bar || 'bg-neutral-400'"
                        :style="{ width: `${item.percentage}%` }"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>
