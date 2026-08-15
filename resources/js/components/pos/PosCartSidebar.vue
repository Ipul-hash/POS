<script setup lang="ts">
import { computed } from 'vue';
import {
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Percent,
    Tag,
    Receipt,
    User,
    Store,
    CreditCard,
    Sparkles,
    Check,
} from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { CartItem, Customer, Discount } from '@/types';

const props = defineProps<{
    cart: CartItem[];
    activeDiscounts: Discount[];
    selectedDiscount: Discount | null;
    selectedCustomer: Customer | null;
    cartSubtotal: number;
    cartItemCount: number;
    discountAmount: number;
    taxAmount: number;
    grandTotal: number;
    taxEnabled: boolean;
    isProcessing: boolean;
}>();

const emit = defineEmits<{
    (e: 'updateQuantity', productId: number, qty: number): void;
    (e: 'removeFromCart', productId: number): void;
    (e: 'clearCart'): void;
    (e: 'selectDiscount', discount: Discount | null): void;
    (e: 'toggleTax'): void;
    (e: 'openPaymentModal'): void;
}>();

const transactionDiscounts = computed(() => {
    return props.activeDiscounts.filter((d) => d.applies_to === 'transaction');
});
</script>

<template>
    <div class="flex flex-col h-full w-full lg:w-96 xl:w-[420px] shrink-0 border-l border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900 shadow-lg select-none">
        <!-- Sidebar Header: Order & Cart Info -->
        <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800/80">
            <div class="flex items-center gap-2.5">
                <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs">
                    <ShoppingCart class="size-4" />
                </div>
                <div>
                    <h3 class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        Pesanan Kasir
                    </h3>
                    <p class="text-[11px] text-neutral-400 font-mono">
                        {{ cartItemCount }} item terpilih
                    </p>
                </div>
            </div>

            <button
                v-if="cart.length > 0"
                type="button"
                class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/60 transition-colors"
                @click="emit('clearCart')"
            >
                <Trash2 class="size-3" />
                <span>Kosongkan</span>
            </button>
        </div>

        <!-- Cart Items Scrollable List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="cart.length > 0" class="space-y-2.5">
                <div
                    v-for="item in cart"
                    :key="item.product.id"
                    class="group flex items-center justify-between rounded-xl border border-neutral-100 bg-neutral-50/60 p-2.5 dark:border-neutral-800/80 dark:bg-neutral-950/40 transition-colors"
                >
                    <!-- Left: Item Info -->
                    <div class="flex-1 min-w-0 pr-2">
                        <h5 class="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                            {{ item.product.name }}
                        </h5>
                        <div class="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
                            <span>{{ formatRupiah(item.price) }}</span>
                            <span v-if="item.discount > 0" class="text-rose-500 text-[10px]">
                                (-{{ formatRupiah(item.discount) }})
                            </span>
                        </div>
                    </div>

                    <!-- Center / Right: Stepper & Subtotal -->
                    <div class="flex items-center gap-3 shrink-0">
                        <!-- Quantity Stepper -->
                        <div class="flex items-center rounded-lg border border-neutral-200 bg-white p-0.5 dark:border-neutral-700 dark:bg-neutral-900 shadow-2xs">
                            <button
                                type="button"
                                class="flex size-6 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                @click="emit('updateQuantity', item.product.id, item.quantity - 1)"
                            >
                                <Minus class="size-3" />
                            </button>
                            <span class="w-7 text-center font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                {{ item.quantity }}
                            </span>
                            <button
                                type="button"
                                class="flex size-6 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors"
                                @click="emit('updateQuantity', item.product.id, item.quantity + 1)"
                            >
                                <Plus class="size-3" />
                            </button>
                        </div>

                        <!-- Item Total Price -->
                        <div class="w-18 text-right font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {{ formatRupiah(item.subtotal) }}
                        </div>

                        <!-- Remove Button -->
                        <button
                            type="button"
                            class="text-neutral-400 hover:text-rose-600 transition-colors"
                            @click="emit('removeFromCart', item.product.id)"
                        >
                            <Trash2 class="size-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Empty Cart State -->
            <div v-else class="flex flex-col items-center justify-center p-8 text-center h-full">
                <div class="flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 mb-3">
                    <ShoppingCart class="size-6" />
                </div>
                <h4 class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Keranjang Masih Kosong
                </h4>
                <p class="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
                    Klik salah satu produk di katalog menu untuk menambahkannya ke pesanan.
                </p>
            </div>
        </div>

        <!-- Summary, Discounts & Checkout Section -->
        <div class="shrink-0 border-t border-neutral-100 bg-neutral-50/50 p-4 dark:border-neutral-800/80 dark:bg-neutral-950/30 space-y-3">
            <!-- Voucher / Discount Selector -->
            <div class="space-y-1">
                <div class="flex items-center justify-between text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                    <span class="flex items-center gap-1">
                        <Tag class="size-3 text-neutral-400" />
                        Voucher / Diskon Transaksi
                    </span>
                    <button
                        v-if="selectedDiscount"
                        type="button"
                        class="text-[10px] text-rose-500 hover:underline"
                        @click="emit('selectDiscount', null)"
                    >
                        Hapus Promo
                    </button>
                </div>
                <select
                    :value="selectedDiscount?.id || ''"
                    class="h-8 w-full rounded-lg border border-neutral-200 bg-white px-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                    @change="
                        emit(
                            'selectDiscount',
                            activeDiscounts.find((d) => d.id === Number(($event.target as HTMLSelectElement).value)) || null
                        )
                    "
                >
                    <option value="">Tanpa Diskon Transaksi</option>
                    <option
                        v-for="disc in transactionDiscounts"
                        :key="disc.id"
                        :value="disc.id"
                    >
                        {{ disc.name }} ({{ disc.type === 'percentage' ? `${disc.value}%` : formatRupiah(disc.value) }})
                    </option>
                </select>
            </div>

            <!-- Tax (PPN) Toggle -->
            <div class="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                <label class="flex items-center gap-1.5 cursor-pointer">
                    <input
                        type="checkbox"
                        :checked="taxEnabled"
                        class="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:border-neutral-700"
                        @change="emit('toggleTax')"
                    />
                    <span>Sertakan PPN (10%)</span>
                </label>
                <span v-if="taxEnabled" class="font-mono text-neutral-800 dark:text-neutral-200">
                    +{{ formatRupiah(taxAmount) }}
                </span>
            </div>

            <!-- Breakdown Lines -->
            <div class="space-y-1.5 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 text-xs font-mono">
                <div class="flex items-center justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span class="font-semibold text-neutral-800 dark:text-neutral-200">
                        {{ formatRupiah(cartSubtotal) }}
                    </span>
                </div>

                <div v-if="discountAmount > 0" class="flex items-center justify-between text-rose-600 dark:text-rose-400">
                    <span>Diskon Promo</span>
                    <span class="font-bold">-{{ formatRupiah(discountAmount) }}</span>
                </div>

                <!-- Grand Total -->
                <div class="flex items-baseline justify-between pt-1.5 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                    <span class="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        Total Tagihan
                    </span>
                    <span class="text-xl font-black text-neutral-900 dark:text-neutral-100">
                        {{ formatRupiah(grandTotal) }}
                    </span>
                </div>
            </div>

            <!-- Checkout Action Button -->
            <button
                type="button"
                :disabled="cart.length === 0 || isProcessing"
                class="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all cursor-pointer"
                @click="emit('openPaymentModal')"
            >
                <CreditCard class="size-4" />
                <span>Bayar Sekarang ({{ formatRupiah(grandTotal) }})</span>
            </button>
        </div>
    </div>
</template>
