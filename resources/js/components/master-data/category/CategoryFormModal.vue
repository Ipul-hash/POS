<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import { X, Check, Loader2, Sparkles } from '@lucide/vue';
import type { Category, CategoryPayload } from '@/types';

const props = defineProps<{
    open: boolean;
    category?: Category | null;
    isSubmitting: boolean;
    errors?: Record<string, string[]>;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', payload: CategoryPayload): void;
}>();

const form = reactive<CategoryPayload>({
    name: '',
    description: '',
});

const nameInputRef = ref<HTMLInputElement | null>(null);
const isEditing = computed(() => !!props.category?.id);

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            if (props.category) {
                form.name = props.category.name || '';
                form.description = props.category.description || '';
            } else {
                form.name = '';
                form.description = '';
            }
            setTimeout(() => {
                nameInputRef.value?.focus();
            }, 100);
        }
    }
);

function closeModal() {
    if (props.isSubmitting) return;
    emit('update:open', false);
}

function handleSubmit() {
    if (!form.name.trim() || props.isSubmitting) return;
    emit('submit', {
        name: form.name.trim(),
        description: form.description ? form.description.trim() : null,
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
                class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            >
                <div
                    class="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity"
                    @click="closeModal"
                ></div>

                <div
                    class="relative w-full max-w-lg transform overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-2xl transition-all dark:border-neutral-800 dark:bg-neutral-900"
                >
                    <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-800/80">
                        <div class="flex items-center gap-3">
                            <div class="flex size-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100">
                                <Sparkles class="size-4" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                                    {{ isEditing ? 'Perbarui Kategori' : 'Kategori Baru' }}
                                </h3>
                                <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                    {{ isEditing ? 'Edit parameter klasifikasi produk POS' : 'Buat kelompok kategori baru untuk katalog POS' }}
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

                    <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
                        <div class="space-y-1.5">
                            <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                Nama Kategori <span class="text-rose-500">*</span>
                            </label>
                            <input
                                ref="nameInputRef"
                                v-model="form.name"
                                type="text"
                                placeholder="Misal: Minuman Espresso, Pastry, Makanan Berat"
                                :disabled="isSubmitting"
                                class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10 transition-all"
                                :class="{ '!border-rose-500 !ring-rose-500/20': errors?.name }"
                            />
                            <p v-if="errors?.name?.[0]" class="text-xs font-medium text-rose-500">
                                {{ errors.name[0] }}
                            </p>
                        </div>

                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between">
                                <label class="block text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                    Deskripsi Singkat
                                </label>
                                <span class="text-[11px] text-neutral-400">
                                    {{ (form.description || '').length }}/200
                                </span>
                            </div>
                            <textarea
                                v-model="form.description"
                                rows="3"
                                maxlength="200"
                                placeholder="Keterangan tambahan untuk varian produk di kategori ini..."
                                :disabled="isSubmitting"
                                class="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-600 dark:focus:border-neutral-100 dark:focus:ring-neutral-100/10 transition-all resize-none"
                                :class="{ '!border-rose-500 !ring-rose-500/20': errors?.description }"
                            ></textarea>
                            <p v-if="errors?.description?.[0]" class="text-xs font-medium text-rose-500">
                                {{ errors.description[0] }}
                            </p>
                        </div>

                        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
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
                                :disabled="isSubmitting || !form.name.trim()"
                                class="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all"
                            >
                                <Loader2 v-if="isSubmitting" class="size-3.5 animate-spin" />
                                <Check v-else class="size-3.5" />
                                <span>{{ isEditing ? 'Simpan Perubahan' : 'Buat Kategori' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
