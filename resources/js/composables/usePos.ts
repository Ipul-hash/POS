import { computed, ref } from 'vue';
import axios from 'axios';
import { toast } from 'vue-sonner';
import { getCategoriesApi } from '@/services/category.service';
import { getDiscountsApi } from '@/services/discount.service';
import { createTransactionApi, getReceiptApi } from '@/services/pos.service';
import { getProductsApi } from '@/services/product.service';
import type {
    CartItem,
    Category,
    Customer,
    Discount,
    PaymentPayload,
    Product,
    ReceiptData,
    Transaction,
    TransactionItemPayload,
} from '@/types';

export function usePos() {
    const products = ref<Product[]>([]);
    const categories = ref<Category[]>([]);
    const activeDiscounts = ref<Discount[]>([]);
    const cart = ref<CartItem[]>([]);

    const selectedTransactionDiscount = ref<Discount | null>(null);
    const selectedCustomer = ref<Customer | null>(null);

    const taxEnabled = ref(false);
    const taxRatePercent = ref(10); // 10% PPN optional

    const searchQuery = ref('');
    const selectedCategoryId = ref<number | string | 'all'>('all');

    const isCatalogLoading = ref(false);
    const isProcessingCheckout = ref(false);
    const isReceiptLoading = ref(false);

    const lastCompletedTransaction = ref<Transaction | null>(null);
    const receiptData = ref<ReceiptData | null>(null);

    const filteredProducts = computed(() => {
        let list = [...products.value];

        // Filter category
        if (selectedCategoryId.value !== 'all' && selectedCategoryId.value !== '') {
            const catId = Number(selectedCategoryId.value);
            list = list.filter((p) => p.category_id === catId);
        }

        // Search Query (name, SKU, barcode)
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase().trim();
            list = list.filter((p) => {
                const name = (p.name || '').toLowerCase();
                const sku = (p.sku || '').toLowerCase();
                const barcode = (p.barcode || '').toLowerCase();
                return name.includes(q) || sku.includes(q) || barcode.includes(q);
            });
        }

        return list;
    });

    const cartSubtotal = computed(() => {
        return cart.value.reduce((acc, item) => {
            const itemPrice = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
            const lineTotal = itemPrice * item.quantity - (item.discount || 0);
            return acc + Math.max(0, lineTotal);
        }, 0);
    });

    const cartItemCount = computed(() => {
        return cart.value.reduce((acc, item) => acc + item.quantity, 0);
    });

    const transactionDiscountAmount = computed(() => {
        if (!selectedTransactionDiscount.value) return 0;
        const disc = selectedTransactionDiscount.value;
        const val = parseFloat(String(disc.value)) || 0;

        if (disc.type === 'percentage') {
            return (cartSubtotal.value * val) / 100;
        } else {
            return Math.min(cartSubtotal.value, val);
        }
    });

    const taxAmount = computed(() => {
        if (!taxEnabled.value) return 0;
        const taxable = Math.max(0, cartSubtotal.value - transactionDiscountAmount.value);
        return (taxable * taxRatePercent.value) / 100;
    });

    const grandTotal = computed(() => {
        const total = cartSubtotal.value - transactionDiscountAmount.value + taxAmount.value;
        return Math.max(0, Math.round(total));
    });

    function getCartQuantity(productId: number): number {
        const item = cart.value.find((c) => c.product.id === productId);
        return item ? item.quantity : 0;
    }

    function getProductStock(product: Product): number {
        if (product.inventory) {
            return product.inventory.quantity ?? 0;
        }
        return 999; // Fallback jika inventori tidak dilacak
    }

    function addToCart(product: Product, quantity = 1) {
        const currentInCart = getCartQuantity(product.id);
        const maxStock = getProductStock(product);

        if (maxStock <= 0) {
            toast.error(`Stok "${product.name}" habis (0 unit tersedia)`);
            return;
        }

        if (currentInCart + quantity > maxStock) {
            toast.warning(
                `Kuantitas melebihi stok fisik "${product.name}" (Tersedia: ${maxStock})`
            );
            return;
        }

        const price = typeof product.sell_price === 'string'
            ? parseFloat(product.sell_price)
            : product.sell_price;

        const existing = cart.value.find((c) => c.product.id === product.id);
        if (existing) {
            existing.quantity += quantity;
            existing.subtotal = existing.price * existing.quantity - existing.discount;
        } else {
            // Check if there is an active product-level discount for this product
            let itemDiscount = 0;
            const prodDiscount = activeDiscounts.value.find(
                (d) => d.applies_to === 'product' && d.is_active
            );
            if (prodDiscount) {
                const val = parseFloat(String(prodDiscount.value)) || 0;
                if (prodDiscount.type === 'percentage') {
                    itemDiscount = (price * val) / 100;
                } else {
                    itemDiscount = Math.min(price, val);
                }
            }

            cart.value.push({
                product,
                quantity,
                price,
                discount: itemDiscount,
                subtotal: price * quantity - itemDiscount,
            });
        }
    }

    function updateQuantity(productId: number, newQty: number) {
        const index = cart.value.findIndex((c) => c.product.id === productId);
        if (index === -1) return;

        if (newQty <= 0) {
            cart.value.splice(index, 1);
            return;
        }

        const item = cart.value[index];
        const maxStock = getProductStock(item.product);
        if (newQty > maxStock) {
            toast.warning(
                `Kuantitas melebihi stok fisik "${item.product.name}" (Maks: ${maxStock})`
            );
            item.quantity = maxStock;
        } else {
            item.quantity = newQty;
        }
        item.subtotal = item.price * item.quantity - item.discount;
    }

    function removeFromCart(productId: number) {
        cart.value = cart.value.filter((c) => c.product.id !== productId);
    }

    function applyItemDiscount(productId: number, discountAmount: number) {
        const item = cart.value.find((c) => c.product.id === productId);
        if (item) {
            item.discount = Math.max(0, Math.min(item.price * item.quantity, discountAmount));
            item.subtotal = item.price * item.quantity - item.discount;
        }
    }

    function clearCart() {
        cart.value = [];
        selectedTransactionDiscount.value = null;
        selectedCustomer.value = null;
    }

    function selectTransactionDiscount(discount: Discount | null) {
        selectedTransactionDiscount.value = discount;
    }

    function selectCustomer(customer: Customer | null) {
        selectedCustomer.value = customer;
    }

    async function fetchCatalog() {
        isCatalogLoading.value = true;
        try {
            const [productsRes, categoriesRes, discountsRes] = await Promise.all([
                getProductsApi({ is_active: true }),
                getCategoriesApi(),
                getDiscountsApi({ is_active: true }),
            ]);

            if (productsRes.success) {
                products.value = productsRes.data;
            }
            if (categoriesRes.success) {
                categories.value = categoriesRes.data;
            }
            if (discountsRes.success) {
                activeDiscounts.value = discountsRes.data;
            }
        } catch {
            toast.error('Gagal memuat data katalog POS');
        } finally {
            isCatalogLoading.value = false;
        }
    }

    async function processCheckout(
        payments: PaymentPayload[],
        shiftId?: number | null
    ): Promise<Transaction | null> {
        if (cart.value.length === 0) {
            toast.error('Keranjang belanja masih kosong');
            return null;
        }

        if (payments.length === 0) {
            toast.error('Pilih metode pembayaran');
            return null;
        }

        const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
        if (totalPaid < grandTotal.value) {
            toast.error(
                `Jumlah pembayaran (Rp ${totalPaid.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${grandTotal.value.toLocaleString('id-ID')})`
            );
            return null;
        }

        isProcessingCheckout.value = true;
        try {
            const itemsPayload: TransactionItemPayload[] = cart.value.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount,
            }));

            const payload = {
                shift_id: shiftId ?? null,
                customer_id: selectedCustomer.value?.id ?? null,
                items: itemsPayload,
                payments,
                discount_total: transactionDiscountAmount.value,
                tax_total: taxAmount.value,
            };

            const response = await createTransactionApi(payload);
            if (response.success && response.data) {
                toast.success('Transaksi berhasil diproses');
                lastCompletedTransaction.value = response.data;
                await fetchReceipt(response.data.id);
                clearCart();
                // Refresh catalog stock
                await fetchCatalog();
                return response.data;
            } else {
                toast.error(response.message || 'Transaksi gagal');
                return null;
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Transaksi gagal diproses'
                );
            } else {
                toast.error('Terjadi kesalahan saat memproses transaksi');
            }
            return null;
        } finally {
            isProcessingCheckout.value = false;
        }
    }

    async function fetchReceipt(transactionId: number | string): Promise<ReceiptData | null> {
        isReceiptLoading.value = true;
        try {
            const response = await getReceiptApi(transactionId);
            if (response.success && response.data) {
                receiptData.value = response.data;
                return response.data;
            }
            return null;
        } catch {
            toast.error('Gagal mengambil data struk belanja');
            return null;
        } finally {
            isReceiptLoading.value = false;
        }
    }

    return {
        products,
        categories,
        activeDiscounts,
        cart,
        selectedTransactionDiscount,
        selectedCustomer,
        taxEnabled,
        taxRatePercent,
        searchQuery,
        selectedCategoryId,
        isCatalogLoading,
        isProcessingCheckout,
        isReceiptLoading,
        lastCompletedTransaction,
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
        applyItemDiscount,
        clearCart,
        selectTransactionDiscount,
        selectCustomer,
        fetchCatalog,
        processCheckout,
        fetchReceipt,
    };
}
