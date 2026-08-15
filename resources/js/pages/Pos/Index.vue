<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Head, Link } from '@inertiajs/vue3';
import {
    ShoppingCart,
    Store,
    Receipt,
    History,
    RefreshCw,
    Clock,
    User,
    Sparkles,
    Coins,
    Lock,
    Unlock,
    AlertCircle,
} from '@lucide/vue';
import PosCartSidebar from '@/components/pos/PosCartSidebar.vue';
import PosPaymentModal from '@/components/pos/PosPaymentModal.vue';
import PosProductGrid from '@/components/pos/PosProductGrid.vue';
import PosReceiptModal from '@/components/pos/PosReceiptModal.vue';
import CloseShiftModal from '@/components/pos/shift/CloseShiftModal.vue';
import OpenShiftModal from '@/components/pos/shift/OpenShiftModal.vue';
import ShiftReportModal from '@/components/pos/shift/ShiftReportModal.vue';
import { usePos } from '@/composables/usePos';
import { useShift } from '@/composables/useShift';
import { formatRupiah } from '@/lib/formatters';
import type { BreadcrumbItem, PaymentPayload } from '@/types';

defineOptions({
    layout: {
        breadcrumbs: [
            {
                title: 'Dashboard',
                href: '/dashboard',
            },
            {
                title: 'Kasir POS',
                href: '/pos',
            },
        ] as BreadcrumbItem[],
    },
});

const {
    products,
    categories,
    activeDiscounts,
    cart,
    selectedTransactionDiscount,
    selectedCustomer,
    taxEnabled,
    searchQuery,
    selectedCategoryId,
    isCatalogLoading,
    isProcessingCheckout,
    receiptData,
    filteredProducts,
    cartSubtotal,
    cartItemCount,
    transactionDiscountAmount,
    taxAmount,
    grandTotal,
    getCartQuantity,
    getProductStock,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    selectTransactionDiscount,
    fetchCatalog,
    processCheckout,
} = usePos();

const {
    currentShift,
    currentShiftSummary,
    selectedShiftDetail,
    isActionLoading: isShiftActionLoading,
    isOpenModalOpen,
    isCloseModalOpen,
    isReportModalOpen,
    isShiftActive,
    fetchCurrentShift,
    openShift,
    closeShift,
} = useShift();

const isPaymentModalOpen = ref(false);
const isReceiptModalOpen = ref(false);

onMounted(() => {
    fetchCatalog();
    fetchCurrentShift();
});

function handleOpenPaymentModal() {
    if (cart.value.length === 0) return;
    isPaymentModalOpen.value = true;
}

async function handlePaymentSubmit(payments: PaymentPayload[]) {
    const shiftId = currentShift.value?.id;
    const transaction = await processCheckout(payments, shiftId);
    if (transaction) {
        isPaymentModalOpen.value = false;
        isReceiptModalOpen.value = true;
        // Refresh live shift sales calculation
        await fetchCurrentShift();
    }
}

function handleNewTransaction() {
    clearCart();
    isReceiptModalOpen.value = false;
}

async function handleOpenShiftSubmit(openingBalance: number) {
    await openShift(openingBalance);
}

async function handleCloseShiftSubmit(closingBalance: number) {
    if (!currentShift.value) return;
    await closeShift(currentShift.value.id, closingBalance);
}
</script>

<template>
    <Head title="Terminal Kasir POS" />

    <div class="flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-neutral-100/60 dark:bg-neutral-950">
        <!-- POS Top Control Bar -->
        <div class="flex shrink-0 items-center justify-between border-b border-neutral-200/80 bg-white px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900 shadow-2xs">
            <div class="flex items-center gap-3">
                <div class="flex size-8 items-center justify-center rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs">
                    <Store class="size-4" />
                </div>
                <div>
                    <h2 class="text-sm font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                        Terminal Kasir Penjualan
                    </h2>
                    <p class="text-[10px] text-neutral-400 font-medium">
                        Pilih menu untuk menambahkan ke pesanan &bull; Real-time Stock Sync
                    </p>
                </div>
            </div>

            <!-- Center/Right: Shift Status & Top Bar Actions -->
            <div class="flex items-center gap-2">
                <!-- Active Shift Indicator Pill -->
                <div
                    v-if="isShiftActive && currentShift"
                    class="hidden md:flex items-center gap-2 rounded-xl border border-emerald-200/80 bg-emerald-50/70 px-3 py-1 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 font-mono"
                >
                    <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span class="font-bold">Shift #{{ currentShift.id }}</span>
                    <span class="text-neutral-400">&bull;</span>
                    <span>Kas: {{ formatRupiah(currentShiftSummary?.expected_cash || currentShift.opening_balance) }}</span>
                    <button
                        type="button"
                        class="ml-1 text-[11px] font-bold text-rose-600 hover:underline dark:text-rose-400"
                        @click="isCloseModalOpen = true"
                    >
                        [Tutup]
                    </button>
                </div>

                <!-- No Active Shift Warning Pill -->
                <button
                    v-else
                    type="button"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 transition-all shadow-2xs"
                    @click="isOpenModalOpen = true"
                >
                    <Coins class="size-3.5 text-amber-600" />
                    <span>Buka Shift</span>
                </button>

                <button
                    type="button"
                    :disabled="isCatalogLoading"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    title="Sinkronkan Menu & Stok"
                    @click="fetchCatalog"
                >
                    <RefreshCw class="size-3.5" :class="{ 'animate-spin': isCatalogLoading }" />
                    <span class="hidden sm:inline">Refresh Menu</span>
                </button>

                <Link
                    href="/pos/shifts"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all shadow-2xs"
                    title="Manajemen Shift & Z-Report"
                >
                    <Clock class="size-3.5 text-neutral-500" />
                    <span class="hidden sm:inline">Shift</span>
                </Link>

                <Link
                    href="/pos/transactions"
                    class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all shadow-2xs"
                >
                    <History class="size-3.5 text-neutral-500" />
                    <span>Riwayat</span>
                </Link>
            </div>
        </div>

        <!-- POS Terminal Main Split-Screen / Locked Screen -->
        <div v-if="isShiftActive" class="flex flex-1 flex-col lg:flex-row overflow-hidden">
            <!-- Left: Product Grid & Search -->
            <PosProductGrid
                :products="filteredProducts"
                :categories="categories"
                :search-query="searchQuery"
                :selected-category-id="selectedCategoryId"
                :is-loading="isCatalogLoading"
                :get-cart-quantity="getCartQuantity"
                :get-product-stock="getProductStock"
                @update:search-query="searchQuery = $event"
                @update:selected-category-id="selectedCategoryId = $event"
                @add-to-cart="addToCart"
            />

            <!-- Right: Interactive Cart Sidebar -->
            <PosCartSidebar
                :cart="cart"
                :active-discounts="activeDiscounts"
                :selected-discount="selectedTransactionDiscount"
                :selected-customer="selectedCustomer"
                :cart-subtotal="cartSubtotal"
                :cart-item-count="cartItemCount"
                :discount-amount="transactionDiscountAmount"
                :tax-amount="taxAmount"
                :grand-total="grandTotal"
                :tax-enabled="taxEnabled"
                :is-processing="isProcessingCheckout"
                @update-quantity="updateQuantity"
                @remove-from-cart="removeFromCart"
                @clear-cart="clearCart"
                @select-discount="selectTransactionDiscount"
                @toggle-tax="taxEnabled = !taxEnabled"
                @open-payment-modal="handleOpenPaymentModal"
            />
        </div>

        <!-- LOCKED STATE WHEN SHIFT IS NOT ACTIVE -->
        <div v-else class="flex flex-1 flex-col items-center justify-center p-6 text-center bg-neutral-50/60 dark:bg-neutral-950/40">
            <div class="max-w-md w-full rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <!-- Icon with glowing backdrop -->
                <div class="mx-auto flex size-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 shadow-inner">
                    <Lock class="size-10" />
                </div>

                <div class="space-y-2">
                    <span class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold font-mono text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                        <AlertCircle class="size-3.5" />
                        Sesi Kasir Belum Dibuka
                    </span>
                    <h3 class="text-xl font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                        Silahkan Buka Shift Baru
                    </h3>
                    <p class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        Terminal kasir terkunci. Masukkan modal kas awal laci (*opening balance*) untuk mengaktifkan kasir dan mulai memproses transaksi pesanan.
                    </p>
                </div>

                <div class="pt-2 flex flex-col gap-2.5">
                    <button
                        type="button"
                        class="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 text-sm font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all cursor-pointer"
                        @click="isOpenModalOpen = true"
                    >
                        <Coins class="size-4.5" />
                        <span>Buka Shift Baru Sekarang</span>
                    </button>

                    <Link
                        href="/pos/shifts"
                        class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all"
                    >
                        <Clock class="size-3.5 text-neutral-500" />
                        <span>Lihat Riwayat & Manajemen Shift</span>
                    </Link>
                </div>
            </div>
        </div>


        <!-- Modals -->
        <PosPaymentModal
            v-model:open="isPaymentModalOpen"
            :grand-total="grandTotal"
            :is-processing="isProcessingCheckout"
            @submit="handlePaymentSubmit"
        />

        <PosReceiptModal
            v-model:open="isReceiptModalOpen"
            :receipt-data="receiptData"
            @new-transaction="handleNewTransaction"
        />

        <!-- Shift Modals -->
        <OpenShiftModal
            v-model:open="isOpenModalOpen"
            :is-processing="isShiftActionLoading"
            @submit="handleOpenShiftSubmit"
        />

        <CloseShiftModal
            v-model:open="isCloseModalOpen"
            :shift="currentShift"
            :summary="currentShiftSummary"
            :is-processing="isShiftActionLoading"
            @submit="handleCloseShiftSubmit"
        />

        <ShiftReportModal
            v-model:open="isReportModalOpen"
            :report-data="selectedShiftDetail"
        />
    </div>
</template>
