<script setup lang="ts">
import { computed } from 'vue';
import {
    X,
    Percent,
    Banknote,
    Receipt,
    ShoppingBag,
    Calendar,
    Pencil,
    Trash2,
    Power,
    CheckCircle2,
    Clock,
    XCircle,
    Tag,
    Calculator,
} from '@lucide/vue';
import { getDiscountRealStatus } from '@/composables/useDiscount';
import { formatDate, formatDateTime, formatRupiah } from '@/lib/formatters';
import type { Discount } from '@/types';

const props = defineProps<{
    open: boolean;
    discount: Discount | null;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'edit', discount: Discount): void;
    (e: 'toggle', discount: Discount): void;
    (e: 'delete', discount: Discount): void;
}>();

const statusInfo = computed(() => {
    if (!props.discount) return null;
    const s = getDiscountRealStatus(props.discount);
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
});

const tiers = [25000, 50000, 100000, 250000];

function calculateCut(base: number): number {
    if (!props.discount) return 0;
    const val = parseFloat(String(props.discount.value)) || 0;
    if (props.discount.type === 'percentage') {
        return (base * val) / 100;
    }
    return Math.min(base, val);
}

function closeModal() {
    emit('update:open', false);
}
</script>

<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="open && discount"
                class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            >
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
                    @click="closeModal"
                ></div>

                <div
                    class="relative my-auto flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <Tag class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    Detail Aturan Diskon
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    ID Referensi Promo: #{{ discount.id }}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            @click="closeModal"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="flex-1 overflow-y-auto p-6 space-y-5">
                        <!-- Main Voucher Card Banner -->
                        <div class="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-950/40 space-y-3">
                            <div class="flex items-center justify-between">
                                <span
                                    v-if="statusInfo"
                                    class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold font-mono"
                                    :class="statusInfo.class"
                                >
                                    <component :is="statusInfo.icon" class="size-3" />
                                    {{ statusInfo.label }}
                                </span>
                                <span
                                    class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold font-mono"
                                    :class="
                                        discount.applies_to === 'transaction'
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                    "
                                >
                                    <Receipt v-if="discount.applies_to === 'transaction'" class="size-3" />
                                    <ShoppingBag v-else class="size-3" />
                                    {{ discount.applies_to === 'transaction' ? 'Per Transaksi' : 'Per Produk' }}
                                </span>
                            </div>

                            <div>
                                <h4 class="text-lg font-extrabold text-neutral-900 dark:text-neutral-100">
                                    {{ discount.name }}
                                </h4>
                                <div class="mt-1 flex items-baseline gap-1.5 font-mono">
                                    <span class="text-2xl font-black text-rose-600 dark:text-rose-400">
                                        {{ discount.type === 'percentage' ? `${discount.value}%` : formatRupiah(discount.value) }}
                                    </span>
                                    <span class="text-xs text-neutral-500">
                                        potongan {{ discount.type === 'percentage' ? 'dari subtotal belanja' : 'langsung' }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Details Grid -->
                        <div class="grid grid-cols-2 gap-3 text-xs">
                            <div class="rounded-xl border border-neutral-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
                                <span class="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">
                                    Tanggal Mulai
                                </span>
                                <span class="mt-1 font-mono font-bold text-neutral-800 dark:text-neutral-200 block">
                                    {{ formatDate(discount.start_date) }}
                                </span>
                            </div>

                            <div class="rounded-xl border border-neutral-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
                                <span class="text-neutral-400 block text-[10px] uppercase tracking-wider font-semibold">
                                    Tanggal Berakhir
                                </span>
                                <span class="mt-1 font-mono font-bold text-neutral-800 dark:text-neutral-200 block">
                                    {{ formatDate(discount.end_date) }}
                                </span>
                            </div>
                        </div>

                        <!-- Multi-Tier Simulation Matrix -->
                        <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                            <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2.5">
                                <Calculator class="size-3.5 text-neutral-500" />
                                <span>Tabel Matriks Simulasi Potongan Harga</span>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="w-full text-left text-xs font-mono">
                                    <thead>
                                        <tr class="border-b border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 uppercase">
                                            <th class="pb-1.5">Contoh Belanja</th>
                                            <th class="pb-1.5 text-center">Diskon</th>
                                            <th class="pb-1.5 text-right">Pelanggan Bayar</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                                        <tr v-for="t in tiers" :key="t" class="py-1">
                                            <td class="py-1.5 text-neutral-700 dark:text-neutral-300">
                                                {{ formatRupiah(t) }}
                                            </td>
                                            <td class="py-1.5 text-center text-rose-600 dark:text-rose-400 font-bold">
                                                -{{ formatRupiah(calculateCut(t)) }}
                                            </td>
                                            <td class="py-1.5 text-right text-emerald-600 dark:text-emerald-400 font-extrabold">
                                                {{ formatRupiah(Math.max(0, t - calculateCut(t))) }}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- Footer Actions -->
                    <div class="flex shrink-0 items-center justify-between border-t border-neutral-100 bg-neutral-50/50 px-6 py-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                        <div class="flex items-center gap-1.5">
                            <button
                                type="button"
                                class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                @click="emit('toggle', discount)"
                            >
                                <Power class="size-3" :class="discount.is_active ? 'text-rose-500' : 'text-emerald-500'" />
                                <span>{{ discount.is_active ? 'Nonaktifkan' : 'Aktifkan' }}</span>
                            </button>
                            <button
                                type="button"
                                class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                @click="emit('edit', discount)"
                            >
                                <Pencil class="size-3 text-neutral-500" />
                                <span>Edit</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            class="h-8 rounded-lg border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                            @click="closeModal"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

