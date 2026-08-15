<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import {
    X,
    Check,
    Loader2,
    Package,
    Sparkles,
    Barcode,
    DollarSign,
    Image,
    Layers,
    Sliders,
    AlertCircle,
} from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type { Category, Product, ProductPayload } from '@/types';

const props = defineProps<{
    open: boolean;
    product?: Product | null;
    categories: Category[];
    isSubmitting: boolean;
    errors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', payload: ProductPayload): void;
}>();

const nameInputRef = ref<HTMLInputElement | null>(null);

const form = reactive<ProductPayload>({
    category_id: '',
    sku: '',
    barcode: '',
    name: '',
    unit: 'pcs',
    cost_price: 0,
    sell_price: 0,
    image_url: '',
    is_active: true,
    initial_stock: 0,
    min_stock: 5,
});

const isEditing = computed(() => !!props.product?.id);

const unitPresets = ['pcs', 'cup', 'porsi', 'botol', 'pack', 'box', 'kg', 'gr', 'ml'];

const samplePlaceholders = [
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80',
];

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            if (props.product) {
                form.category_id = props.product.category_id || '';
                form.sku = props.product.sku || '';
                form.barcode = props.product.barcode || '';
                form.name = props.product.name || '';
                form.unit = props.product.unit || 'pcs';
                form.cost_price = Number(props.product.cost_price) || 0;
                form.sell_price = Number(props.product.sell_price) || 0;
                form.image_url = props.product.image_url || '';
                form.is_active = props.product.is_active ?? true;
                form.initial_stock = props.product.inventory?.quantity ?? 0;
                form.min_stock = props.product.inventory?.min_stock ?? 5;
            } else {
                form.category_id = props.categories.length > 0 ? props.categories[0].id : '';
                form.sku = generateRandomSku();
                form.barcode = generateRandomBarcode();
                form.name = '';
                form.unit = 'pcs';
                form.cost_price = 0;
                form.sell_price = 0;
                form.image_url = '';
                form.is_active = true;
                form.initial_stock = 0;
                form.min_stock = 5;
            }
            setTimeout(() => {
                nameInputRef.value?.focus();
            }, 100);
        }
    }
);

function generateRandomSku() {
    const prefix = 'SKU';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand}`;
}

function generateRandomBarcode() {
    let code = '899';
    for (let i = 0; i < 9; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

const profit = computed(() => {
    const sell = Number(form.sell_price) || 0;
    const cost = Number(form.cost_price) || 0;
    return sell - cost;
});

const profitMargin = computed(() => {
    const sell = Number(form.sell_price) || 0;
    const cost = Number(form.cost_price) || 0;
    if (sell <= 0) return 0;
    return Math.round(((sell - cost) / sell) * 100);
});

function closeModal() {
    if (props.isSubmitting) return;
    emit('update:open', false);
}

function handleSubmit() {
    if (!form.name.trim() || !form.sku.trim() || !form.category_id || props.isSubmitting) {
        return;
    }

    emit('submit', {
        category_id: Number(form.category_id),
        sku: form.sku.trim(),
        barcode: form.barcode?.trim() || null,
        name: form.name.trim(),
        unit: form.unit?.trim() || 'pcs',
        cost_price: Number(form.cost_price) || 0,
        sell_price: Number(form.sell_price) || 0,
        image_url: form.image_url?.trim() || null,
        is_active: form.is_active,
        initial_stock: Number(form.initial_stock) || 0,
        quantity: Number(form.initial_stock) || 0,
        min_stock: Number(form.min_stock) || 0,
    });
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
                v-if="open"
                class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
            >
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
                    @click="closeModal"
                ></div>

                <div
                    class="relative my-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <Package class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    {{ isEditing ? 'Perbarui Data Produk' : 'Tambah Produk Baru' }}
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    {{ isEditing ? 'Edit rincian, harga, dan parameter inventori produk' : 'Daftarkan SKU produk baru ke dalam katalog kasir POS' }}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                            :disabled="isSubmitting"
                            @click="closeModal"
                        >
                            <X class="size-4" />
                        </button>
                    </div>

                    <!-- Scrollable Form Body -->
                    <form @submit.prevent="handleSubmit" class="flex flex-1 flex-col overflow-y-auto">
                        <div class="p-6 space-y-5">
                            <!-- Category & Product Name -->
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
                                <div class="sm:col-span-5 space-y-1.5">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Kategori <span class="text-rose-500">*</span>
                                    </label>
                                    <div class="relative">
                                        <select
                                            v-model="form.category_id"
                                            :disabled="isSubmitting"
                                            class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                                            :class="{ '!border-rose-500': errors?.category_id }"
                                        >
                                            <option value="" disabled>Pilih Kategori Produk</option>
                                            <option
                                                v-for="cat in categories"
                                                :key="cat.id"
                                                :value="cat.id"
                                            >
                                                {{ cat.name }}
                                            </option>
                                        </select>
                                    </div>
                                    <p v-if="errors?.category_id?.[0]" class="text-xs text-rose-500 font-medium">
                                        {{ errors.category_id[0] }}
                                    </p>
                                </div>

                                <div class="sm:col-span-7 space-y-1.5">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Nama Produk <span class="text-rose-500">*</span>
                                    </label>
                                    <input
                                        ref="nameInputRef"
                                        v-model="form.name"
                                        type="text"
                                        placeholder="Misal: Americano Hot, Croissant Butter"
                                        :disabled="isSubmitting"
                                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100"
                                        :class="{ '!border-rose-500': errors?.name }"
                                    />
                                    <p v-if="errors?.name?.[0]" class="text-xs text-rose-500 font-medium">
                                        {{ errors.name[0] }}
                                    </p>
                                </div>
                            </div>

                            <!-- SKU & Barcode & Unit -->
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-12">
                                <div class="sm:col-span-4 space-y-1.5">
                                    <div class="flex items-center justify-between">
                                        <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                            Kode SKU <span class="text-rose-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            class="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium underline"
                                            @click="form.sku = generateRandomSku()"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                    <input
                                        v-model="form.sku"
                                        type="text"
                                        placeholder="COF-001"
                                        :disabled="isSubmitting"
                                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 font-mono text-xs text-neutral-900 uppercase focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                                        :class="{ '!border-rose-500': errors?.sku }"
                                    />
                                    <p v-if="errors?.sku?.[0]" class="text-xs text-rose-500 font-medium">
                                        {{ errors.sku[0] }}
                                    </p>
                                </div>

                                <div class="sm:col-span-5 space-y-1.5">
                                    <div class="flex items-center justify-between">
                                        <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                            Barcode / EAN
                                        </label>
                                        <button
                                            type="button"
                                            class="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 font-medium underline"
                                            @click="form.barcode = generateRandomBarcode()"
                                        >
                                            Generate
                                        </button>
                                    </div>
                                    <div class="relative">
                                        <input
                                            v-model="form.barcode"
                                            type="text"
                                            placeholder="899100100001"
                                            :disabled="isSubmitting"
                                            class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-8 pr-3.5 py-2 font-mono text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                                            :class="{ '!border-rose-500': errors?.barcode }"
                                        />
                                        <Barcode class="absolute left-2.5 top-2.5 size-3.5 text-neutral-400" />
                                    </div>
                                    <p v-if="errors?.barcode?.[0]" class="text-xs text-rose-500 font-medium">
                                        {{ errors.barcode[0] }}
                                    </p>
                                </div>

                                <div class="sm:col-span-3 space-y-1.5">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Satuan (Unit)
                                    </label>
                                    <input
                                        v-model="form.unit"
                                        list="units-list"
                                        type="text"
                                        placeholder="cup / pcs"
                                        :disabled="isSubmitting"
                                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                                    />
                                    <datalist id="units-list">
                                        <option v-for="u in unitPresets" :key="u" :value="u" />
                                    </datalist>
                                </div>
                            </div>

                            <!-- Pricing Matrix (Cost Price & Sell Price) -->
                            <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-950/40 space-y-3">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        <DollarSign class="size-3.5 text-emerald-600" />
                                        <span>Struktur Harga & Keuntungan</span>
                                    </div>
                                    <span
                                        class="rounded-md px-2 py-0.5 font-mono text-[10px] font-bold"
                                        :class="profitMargin >= 30 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'"
                                    >
                                        Margin {{ profitMargin }}% ({{ formatRupiah(profit) }} / unit)
                                    </span>
                                </div>

                                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div class="space-y-1.5">
                                        <label class="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                            Harga Pokok / Modal (Cost Price)
                                        </label>
                                        <div class="relative">
                                            <span class="absolute left-3 top-2 text-xs font-mono font-bold text-neutral-400">Rp</span>
                                            <input
                                                v-model.number="form.cost_price"
                                                type="number"
                                                min="0"
                                                step="100"
                                                placeholder="0"
                                                :disabled="isSubmitting"
                                                class="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3.5 py-2 font-mono text-xs font-semibold text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                            />
                                        </div>
                                    </div>

                                    <div class="space-y-1.5">
                                        <label class="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
                                            Harga Jual Kasir (Sell Price) <span class="text-rose-500">*</span>
                                        </label>
                                        <div class="relative">
                                            <span class="absolute left-3 top-2 text-xs font-mono font-bold text-neutral-400">Rp</span>
                                            <input
                                                v-model.number="form.sell_price"
                                                type="number"
                                                min="0"
                                                step="100"
                                                placeholder="0"
                                                :disabled="isSubmitting"
                                                class="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-3.5 py-2 font-mono text-xs font-bold text-neutral-900 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                                :class="{ '!border-rose-500': errors?.sell_price }"
                                            />
                                        </div>
                                        <p v-if="errors?.sell_price?.[0]" class="text-xs text-rose-500 font-medium">
                                            {{ errors.sell_price[0] }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Inventory Parameters -->
                            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div class="space-y-1.5">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        {{ isEditing ? 'Stok Saat Ini (Kuantitas)' : 'Stok Awal Fisik' }}
                                    </label>
                                    <input
                                        v-model.number="form.initial_stock"
                                        type="number"
                                        min="0"
                                        :disabled="isSubmitting"
                                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 font-mono text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                                    />
                                    <p class="text-[10px] text-neutral-400">
                                        Unit fisik yang tersedia di outlet saat ini.
                                    </p>
                                </div>

                                <div class="space-y-1.5">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Batas Stok Kritis (Min Stock)
                                    </label>
                                    <input
                                        v-model.number="form.min_stock"
                                        type="number"
                                        min="0"
                                        :disabled="isSubmitting"
                                        class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 font-mono text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:border-neutral-100"
                                    />
                                    <p class="text-[10px] text-neutral-400">
                                        Peringatan stok menipis muncul jika kuantitas &le; batas ini.
                                    </p>
                                </div>
                            </div>

                            <!-- Image URL & Preview -->
                            <div class="space-y-2">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    URL Gambar Produk
                                </label>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="size-14 shrink-0 rounded-xl border border-neutral-200 bg-neutral-100 overflow-hidden flex items-center justify-center dark:border-neutral-800 dark:bg-neutral-800 shadow-2xs"
                                    >
                                        <img
                                            v-if="form.image_url"
                                            :src="form.image_url"
                                            alt="Preview"
                                            class="size-full object-cover"
                                            @error="($event.target as HTMLElement).style.display = 'none'"
                                        />
                                        <Image v-else class="size-5 text-neutral-400" />
                                    </div>

                                    <div class="flex-1 space-y-1">
                                        <input
                                            v-model="form.image_url"
                                            type="url"
                                            placeholder="https://images.unsplash.com/photo-..."
                                            :disabled="isSubmitting"
                                            class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100"
                                        />
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] text-neutral-400">Pilihan cepat:</span>
                                            <button
                                                v-for="(pUrl, idx) in samplePlaceholders"
                                                :key="idx"
                                                type="button"
                                                class="rounded px-1.5 py-0.5 text-[9px] font-mono bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400"
                                                @click="form.image_url = pUrl"
                                            >
                                                Preset #{{ idx + 1 }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Active Switch -->
                            <div class="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-neutral-800 dark:bg-neutral-950/40">
                                <div>
                                    <div class="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                        Status Aktif di Kasir POS
                                    </div>
                                    <div class="text-[11px] text-neutral-500 dark:text-neutral-400">
                                        Produk aktif akan langsung muncul pada katalog transaksi kasir POS.
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                                    :class="form.is_active ? 'bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-200 dark:bg-neutral-700'"
                                    @click="form.is_active = !form.is_active"
                                >
                                    <span
                                        class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out dark:bg-neutral-900"
                                        :class="form.is_active ? 'translate-x-5' : 'translate-x-0'"
                                    />
                                </button>
                            </div>
                        </div>

                        <!-- Footer Actions -->
                        <div class="flex shrink-0 items-center justify-end gap-2.5 border-t border-neutral-100 bg-neutral-50/50 px-6 py-3.5 dark:border-neutral-800/80 dark:bg-neutral-950/30">
                            <button
                                type="button"
                                :disabled="isSubmitting"
                                class="h-9 rounded-xl border border-neutral-200 px-4 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.98] disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-all"
                                @click="closeModal"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                :disabled="isSubmitting || !form.name.trim() || !form.sku.trim() || !form.category_id"
                                class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            >
                                <Loader2 v-if="isSubmitting" class="size-3.5 animate-spin" />
                                <Check v-else class="size-3.5" />
                                <span>{{ isEditing ? 'Simpan Perubahan' : 'Simpan Produk' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
