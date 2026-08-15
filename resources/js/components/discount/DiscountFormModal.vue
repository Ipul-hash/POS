<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import {
    X,
    Check,
    Loader2,
    Percent,
    Banknote,
    Receipt,
    ShoppingBag,
    Calendar,
    Sparkles,
    Tag,
    Calculator,
    AlertCircle,
} from '@lucide/vue';
import { formatRupiah } from '@/lib/formatters';
import type {
    Discount,
    DiscountAppliesTo,
    DiscountPayload,
    DiscountType,
} from '@/types';

const props = defineProps<{
    open: boolean;
    discount?: Discount | null;
    isSubmitting: boolean;
    errors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', payload: DiscountPayload): void;
}>();

const isEditing = computed(() => !!props.discount);

const form = reactive<{
    name: string;
    type: DiscountType;
    value: number | '';
    applies_to: DiscountAppliesTo;
    start_date: string;
    end_date: string;
    is_active: boolean;
}>({
    name: '',
    type: 'percentage',
    value: 10,
    applies_to: 'transaction',
    start_date: '',
    end_date: '',
    is_active: true,
});

// Simulation sample price
const sampleTestAmount = ref<number>(50000);

const simulatedDiscountAmount = computed(() => {
    const val = Number(form.value) || 0;
    if (form.type === 'percentage') {
        return (sampleTestAmount.value * val) / 100;
    } else {
        return Math.min(sampleTestAmount.value, val);
    }
});

const simulatedFinalPrice = computed(() => {
    return Math.max(0, sampleTestAmount.value - simulatedDiscountAmount.value);
});

function formatDateToInput(dateStr?: string | Date): string {
    if (!dateStr) {
        const d = new Date();
        return d.toISOString().split('T')[0];
    }
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0];
}

function applyPresetDuration(days: number | 'end_of_year') {
    const today = new Date();
    form.start_date = today.toISOString().split('T')[0];

    if (days === 'end_of_year') {
        const year = today.getFullYear();
        form.end_date = `${year}-12-31`;
    } else {
        const end = new Date(today);
        end.setDate(today.getDate() + days);
        form.end_date = end.toISOString().split('T')[0];
    }
}

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            if (props.discount) {
                form.name = props.discount.name;
                form.type = props.discount.type;
                form.value = parseFloat(String(props.discount.value)) || 0;
                form.applies_to = props.discount.applies_to;
                form.start_date = formatDateToInput(props.discount.start_date);
                form.end_date = formatDateToInput(props.discount.end_date);
                form.is_active = props.discount.is_active;
            } else {
                const today = new Date();
                const end = new Date(today);
                end.setDate(today.getDate() + 30);

                form.name = '';
                form.type = 'percentage';
                form.value = 10;
                form.applies_to = 'transaction';
                form.start_date = today.toISOString().split('T')[0];
                form.end_date = end.toISOString().split('T')[0];
                form.is_active = true;
            }
        }
    }
);

function closeModal() {
    if (props.isSubmitting) return;
    emit('update:open', false);
}

function handleSubmit() {
    if (
        !form.name.trim() ||
        form.value === '' ||
        form.value < 0 ||
        (form.type === 'percentage' && form.value > 100) ||
        !form.start_date ||
        !form.end_date ||
        props.isSubmitting
    ) {
        return;
    }

    emit('submit', {
        name: form.name.trim(),
        type: form.type,
        value: Number(form.value),
        applies_to: form.applies_to,
        start_date: form.start_date,
        end_date: form.end_date,
        is_active: form.is_active,
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
                <!-- Backdrop -->
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
                    @click="closeModal"
                ></div>

                <!-- Modal Container -->
                <div
                    class="relative my-auto flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <!-- Header -->
                    <div class="flex shrink-0 items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <Tag class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    {{ isEditing ? 'Edit Aturan Diskon' : 'Tambah Diskon / Promo Baru' }}
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    Konfigurasikan skema potongan harga untuk kasir POS
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
                            <!-- Name Input -->
                            <div class="space-y-1.5">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Nama Diskon / Promo <span class="text-rose-500">*</span>
                                </label>
                                <input
                                    v-model="form.name"
                                    type="text"
                                    placeholder="Contoh: Diskon Member 10%, Promo Gajian Rp 15.000"
                                    maxlength="100"
                                    :disabled="isSubmitting"
                                    class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                    :class="{ '!border-rose-500': errors?.name }"
                                />
                                <p v-if="errors?.name?.[0]" class="text-xs text-rose-500 font-medium">
                                    {{ errors.name[0] }}
                                </p>
                            </div>

                            <!-- Discount Type & Value Row -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <!-- Type Selector -->
                                <div class="space-y-1.5">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Tipe Pemotongan <span class="text-rose-500">*</span>
                                    </label>
                                    <div class="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            class="flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all"
                                            :class="
                                                form.type === 'percentage'
                                                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                            "
                                            @click="form.type = 'percentage'"
                                        >
                                            <Percent class="size-3.5" />
                                            <span>Persentase (%)</span>
                                        </button>
                                        <button
                                            type="button"
                                            class="flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-all"
                                            :class="
                                                form.type === 'fixed'
                                                    ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs'
                                                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                            "
                                            @click="form.type = 'fixed'"
                                        >
                                            <Banknote class="size-3.5" />
                                            <span>Nominal (Rp)</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- Value Input -->
                                <div class="space-y-1.5">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Nilai Diskon <span class="text-rose-500">*</span>
                                    </label>
                                    <div class="relative">
                                        <input
                                            v-model.number="form.value"
                                            type="number"
                                            :min="form.type === 'percentage' ? 0.01 : 0"
                                            :max="form.type === 'percentage' ? 100 : undefined"
                                            :step="form.type === 'percentage' ? 0.5 : 500"
                                            :disabled="isSubmitting"
                                            placeholder="Contoh: 10 atau 15000"
                                            class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2 font-mono text-sm font-bold text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                            :class="{ '!border-rose-500': errors?.value }"
                                        />
                                        <span class="absolute right-3.5 top-2.5 font-mono text-xs font-bold text-neutral-400">
                                            {{ form.type === 'percentage' ? '%' : 'IDR' }}
                                        </span>
                                    </div>
                                    <p v-if="errors?.value?.[0]" class="text-xs text-rose-500 font-medium">
                                        {{ errors.value[0] }}
                                    </p>
                                </div>
                            </div>

                            <!-- Applies To Selector -->
                            <div class="space-y-2">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Cakupan Pemotongan (Applies To) <span class="text-rose-500">*</span>
                                </label>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <!-- Transaction Scope -->
                                    <button
                                        type="button"
                                        class="flex items-start gap-3 rounded-xl border p-3 text-left transition-all"
                                        :class="
                                            form.applies_to === 'transaction'
                                                ? 'border-indigo-500/80 bg-indigo-50/60 text-indigo-950 dark:border-indigo-500/80 dark:bg-indigo-950/40 dark:text-indigo-200 ring-1 ring-indigo-500/20'
                                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                        "
                                        @click="form.applies_to = 'transaction'"
                                    >
                                        <div
                                            class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                                            :class="form.applies_to === 'transaction' ? 'bg-indigo-500 text-white' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'"
                                        >
                                            <Receipt class="size-4" />
                                        </div>
                                        <div>
                                            <div class="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Per Transaksi (Checkout)
                                            </div>
                                            <div class="text-[11px] text-neutral-500 leading-snug mt-0.5">
                                                Memotong subtotal seluruh keranjang belanja kasir.
                                            </div>
                                        </div>
                                    </button>

                                    <!-- Product Scope -->
                                    <button
                                        type="button"
                                        class="flex items-start gap-3 rounded-xl border p-3 text-left transition-all"
                                        :class="
                                            form.applies_to === 'product'
                                                ? 'border-amber-500/80 bg-amber-50/60 text-amber-950 dark:border-amber-500/80 dark:bg-amber-950/40 dark:text-amber-200 ring-1 ring-amber-500/20'
                                                : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400'
                                        "
                                        @click="form.applies_to = 'product'"
                                    >
                                        <div
                                            class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
                                            :class="form.applies_to === 'product' ? 'bg-amber-500 text-white' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'"
                                        >
                                            <ShoppingBag class="size-4" />
                                        </div>
                                        <div>
                                            <div class="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                                Per Produk (Item Menu)
                                            </div>
                                            <div class="text-[11px] text-neutral-500 leading-snug mt-0.5">
                                                Memotong harga satuan menu/barang produk.
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <!-- Date Range & Presets -->
                            <div class="space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                        Masa Berlaku Promo <span class="text-rose-500">*</span>
                                    </label>
                                    <!-- Preset Duration Quick Buttons -->
                                    <div class="flex items-center gap-1">
                                        <button
                                            type="button"
                                            class="rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                            @click="applyPresetDuration(7)"
                                        >
                                            7 Hari
                                        </button>
                                        <button
                                            type="button"
                                            class="rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                            @click="applyPresetDuration(14)"
                                        >
                                            14 Hari
                                        </button>
                                        <button
                                            type="button"
                                            class="rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                            @click="applyPresetDuration(30)"
                                        >
                                            30 Hari
                                        </button>
                                        <button
                                            type="button"
                                            class="rounded-md border border-neutral-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                                            @click="applyPresetDuration('end_of_year')"
                                        >
                                            Akhir Tahun
                                        </button>
                                    </div>
                                </div>

                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <span class="text-[11px] text-neutral-500 mb-1 block">Tanggal Mulai</span>
                                        <input
                                            v-model="form.start_date"
                                            type="date"
                                            :disabled="isSubmitting"
                                            class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                        />
                                    </div>
                                    <div>
                                        <span class="text-[11px] text-neutral-500 mb-1 block">Tanggal Berakhir</span>
                                        <input
                                            v-model="form.end_date"
                                            type="date"
                                            :min="form.start_date"
                                            :disabled="isSubmitting"
                                            class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3 py-2 text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                                            :class="{ '!border-rose-500': errors?.end_date }"
                                        />
                                        <p v-if="errors?.end_date?.[0]" class="text-xs text-rose-500 font-medium mt-1">
                                            {{ errors.end_date[0] }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <!-- Live Calculator / Simulation Box -->
                            <div class="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/40">
                                <div class="flex items-center justify-between mb-2.5">
                                    <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                                        <Calculator class="size-3.5 text-neutral-500" />
                                        <span>Simulasi Perhitungan Potongan Harga</span>
                                    </div>
                                    <div class="flex items-center gap-1 text-[11px] text-neutral-400">
                                        <span>Contoh Belanja:</span>
                                        <select
                                            v-model="sampleTestAmount"
                                            class="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[11px] font-mono font-bold text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                                        >
                                            <option :value="25000">Rp 25.000</option>
                                            <option :value="50000">Rp 50.000</option>
                                            <option :value="100000">Rp 100.000</option>
                                            <option :value="200000">Rp 200.000</option>
                                        </select>
                                    </div>
                                </div>

                                <div class="grid grid-cols-3 gap-2 text-center font-mono">
                                    <div class="rounded-lg bg-white p-2 border border-neutral-100 dark:bg-neutral-900 dark:border-neutral-800">
                                        <span class="text-[10px] text-neutral-400 block">Harga Awal</span>
                                        <span class="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                            {{ formatRupiah(sampleTestAmount) }}
                                        </span>
                                    </div>
                                    <div class="rounded-lg bg-rose-50/70 p-2 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/60">
                                        <span class="text-[10px] text-rose-500 block">Potongan Diskon</span>
                                        <span class="text-xs font-bold text-rose-600 dark:text-rose-400">
                                            -{{ formatRupiah(simulatedDiscountAmount) }}
                                        </span>
                                    </div>
                                    <div class="rounded-lg bg-emerald-50/70 p-2 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/60">
                                        <span class="text-[10px] text-emerald-600 block">Total Bayar</span>
                                        <span class="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                                            {{ formatRupiah(simulatedFinalPrice) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Active Toggle -->
                            <div class="flex items-center justify-between rounded-xl border border-neutral-100 p-3.5 dark:border-neutral-800 bg-white dark:bg-neutral-950">
                                <div>
                                    <label class="text-xs font-bold text-neutral-900 dark:text-neutral-100 cursor-pointer">
                                        Status Diskon Aktif
                                    </label>
                                    <p class="text-[11px] text-neutral-500">
                                        Bila aktif, diskon dapat langsung diterapkan pada modul kasir POS selama dalam tanggal berlaku.
                                    </p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input
                                        v-model="form.is_active"
                                        type="checkbox"
                                        :disabled="isSubmitting"
                                        class="sr-only peer"
                                    />
                                    <div class="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:bg-neutral-700 peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"></div>
                                </label>
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
                                :disabled="isSubmitting || !form.name.trim() || form.value === ''"
                                class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            >
                                <Loader2 v-if="isSubmitting" class="size-3.5 animate-spin" />
                                <Check v-else class="size-3.5" />
                                <span>{{ isEditing ? 'Simpan Perubahan' : 'Buat Aturan Diskon' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
