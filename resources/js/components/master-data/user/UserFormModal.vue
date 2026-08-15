<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    Mail,
    Shield,
    ShieldAlert,
    ShieldCheck,
    User,
    X,
} from '@lucide/vue';
import type { CreateUserPayload, RoleItem, UpdateUserPayload, UserAccount } from '@/types';

const props = defineProps<{
    open: boolean;
    user?: UserAccount | null;
    roles: RoleItem[];
    isProcessing?: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'submit', payload: CreateUserPayload | UpdateUserPayload): void;
}>();

const form = reactive({
    name: '',
    email: '',
    password: '',
    pin: '',
    role: 'kasir',
    is_active: true,
});

const isEditing = computed(() => !!props.user);

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            if (props.user) {
                form.name = props.user.name;
                form.email = props.user.email;
                form.password = '';
                form.pin = props.user.pin || '';
                form.role = props.user.roles?.[0]?.name || 'kasir';
                form.is_active = props.user.is_active;
            } else {
                form.name = '';
                form.email = '';
                form.password = '';
                form.pin = '';
                form.role = 'kasir';
                form.is_active = true;
            }
        }
    }
);

function handleSubmit() {
    if (!form.name || !form.email) return;
    if (!isEditing.value && !form.password) return;

    if (isEditing.value) {
        const payload: UpdateUserPayload = {
            name: form.name,
            email: form.email,
            pin: form.pin || undefined,
            role: form.role,
            is_active: form.is_active,
        };
        if (form.password) {
            payload.password = form.password;
        }
        emit('submit', payload);
    } else {
        const payload: CreateUserPayload = {
            name: form.name,
            email: form.email,
            password: form.password,
            pin: form.pin || undefined,
            role: form.role,
            is_active: form.is_active,
        };
        emit('submit', payload);
    }
}

const roleOptions = [
    {
        name: 'owner',
        label: 'Owner / Pemilik',
        description: 'Akses penuh ke seluruh sistem, laporan laba, konfigurasi, dan manajemen staf.',
        badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
    },
    {
        name: 'admin',
        label: 'Admin Outlet',
        description: 'Akses dashboard analitik, master produk, inventori gudang, dan diskon.',
        badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
    },
    {
        name: 'kasir',
        label: 'Kasir (Cashier)',
        description: 'Akses terbatas hanya untuk Terminal Kasir POS, Buka/Tutup Shift, dan Transaksi.',
        badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
    },
];
</script>

<template>
    <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
        <div
            class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        >
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                <div class="flex items-center gap-3">
                    <div class="flex size-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        <User class="size-5" />
                    </div>
                    <div>
                        <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                            {{ isEditing ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru' }}
                        </h3>
                        <p class="text-xs text-neutral-400">
                            {{ isEditing ? 'Perbarui informasi dan hak akses pengguna' : 'Buat akun kasir, admin, atau owner baru' }}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    class="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors"
                    @click="emit('update:open', false)"
                >
                    <X class="size-5" />
                </button>
            </div>

            <!-- Form Body -->
            <form @submit.prevent="handleSubmit" class="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
                <!-- Name -->
                <div class="space-y-1.5">
                    <label class="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Nama Lengkap <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                        <User class="absolute left-3.5 top-3 size-4 text-neutral-400" />
                        <input
                            v-model="form.name"
                            type="text"
                            required
                            placeholder="Contoh: Siti Rahmawati"
                            class="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <!-- Email -->
                <div class="space-y-1.5">
                    <label class="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Alamat Email <span class="text-rose-500">*</span>
                    </label>
                    <div class="relative">
                        <Mail class="absolute left-3.5 top-3 size-4 text-neutral-400" />
                        <input
                            v-model="form.email"
                            type="email"
                            required
                            placeholder="Contoh: kasir1@posnusantara.com"
                            class="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                        />
                    </div>
                </div>

                <!-- Password & PIN (2 columns) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <!-- Password -->
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            Password {{ isEditing ? '(Opsional)' : '*' }}
                        </label>
                        <div class="relative">
                            <Lock class="absolute left-3.5 top-3 size-4 text-neutral-400" />
                            <input
                                v-model="form.password"
                                type="password"
                                :required="!isEditing"
                                minlength="6"
                                :placeholder="isEditing ? 'Kosongkan jika tetap' : 'Min. 6 karakter'"
                                class="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                            />
                        </div>
                    </div>

                    <!-- PIN Kasir -->
                    <div class="space-y-1.5">
                        <label class="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            PIN Kasir (6 Digit)
                        </label>
                        <div class="relative">
                            <KeyRound class="absolute left-3.5 top-3 size-4 text-neutral-400" />
                            <input
                                v-model="form.pin"
                                type="password"
                                maxlength="6"
                                placeholder="Contoh: 123456"
                                class="h-10 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3.5 text-xs font-mono text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100"
                            />
                        </div>
                    </div>
                </div>

                <!-- Role Selection -->
                <div class="space-y-2 pt-1">
                    <label class="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                        Pilih Hak Akses & Peran (Role) <span class="text-rose-500">*</span>
                    </label>
                    <div class="space-y-2">
                        <label
                            v-for="role in roleOptions"
                            :key="role.name"
                            class="flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all"
                            :class="
                                form.role === role.name
                                    ? 'border-neutral-900 bg-neutral-50/80 ring-1 ring-neutral-900 dark:border-neutral-100 dark:bg-neutral-800/40 dark:ring-neutral-100'
                                    : 'border-neutral-200/80 bg-white hover:bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/20'
                            "
                        >
                            <input
                                v-model="form.role"
                                type="radio"
                                name="user_role"
                                :value="role.name"
                                class="mt-1 size-4 text-neutral-900 focus:ring-0"
                            />
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                        {{ role.label }}
                                    </span>
                                </div>
                                <p class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                                    {{ role.description }}
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Active Status Toggle -->
                <div class="pt-2 flex items-center justify-between p-3 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950/30">
                    <div>
                        <span class="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                            Status Akun Aktif
                        </span>
                        <p class="text-[10px] text-neutral-400">
                            Akun non-aktif tidak akan dapat login ke sistem.
                        </p>
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input
                            v-model="form.is_active"
                            type="checkbox"
                            class="sr-only peer"
                        />
                        <div class="w-10 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-emerald-600"></div>
                    </label>
                </div>

                <!-- Footer Buttons -->
                <div class="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        class="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        @click="emit('update:open', false)"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        :disabled="isProcessing"
                        class="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all cursor-pointer"
                    >
                        <CheckCircle2 class="size-3.5" />
                        <span>{{ isEditing ? 'Simpan Perubahan' : 'Buat Akun Sekarang' }}</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>
