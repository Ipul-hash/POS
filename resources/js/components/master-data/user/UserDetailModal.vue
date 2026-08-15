<script setup lang="ts">
import {
    Calendar,
    CheckCircle2,
    KeyRound,
    Mail,
    Pencil,
    Shield,
    ShieldCheck,
    User,
    X,
    XCircle,
} from '@lucide/vue';
import { formatDateTime } from '@/lib/formatters';
import type { UserAccount } from '@/types';

const props = defineProps<{
    open: boolean;
    user?: UserAccount | null;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'edit', user: UserAccount): void;
}>();

const roleColors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
    kasir: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
};
</script>

<template>
    <div
        v-if="open && user"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
        <div
            class="relative w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 animate-in zoom-in-95 duration-200 space-y-5"
        >
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800/80">
                <div class="flex items-center gap-3">
                    <div class="flex size-11 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 font-extrabold text-sm">
                        {{ user.name.slice(0, 2).toUpperCase() }}
                    </div>
                    <div>
                        <h3 class="text-base font-extrabold text-neutral-900 dark:text-neutral-100">
                            {{ user.name }}
                        </h3>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span
                                v-for="role in user.roles"
                                :key="role.id"
                                class="rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase font-mono"
                                :class="roleColors[role.name] || 'bg-neutral-100 text-neutral-700'"
                            >
                                {{ role.name }}
                            </span>
                            <span
                                class="inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[10px] font-bold"
                                :class="user.is_active ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'"
                            >
                                {{ user.is_active ? 'Aktif' : 'Non-Aktif' }}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    class="rounded-xl p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                    @click="emit('update:open', false)"
                >
                    <X class="size-5" />
                </button>
            </div>

            <!-- Details List -->
            <div class="space-y-3 text-xs divide-y divide-neutral-100 dark:divide-neutral-800/80">
                <div class="flex items-center justify-between py-1.5">
                    <div class="flex items-center gap-2 text-neutral-500">
                        <Mail class="size-4 text-neutral-400" />
                        <span>Alamat Email</span>
                    </div>
                    <span class="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                        {{ user.email }}
                    </span>
                </div>

                <div class="flex items-center justify-between py-2">
                    <div class="flex items-center gap-2 text-neutral-500">
                        <KeyRound class="size-4 text-neutral-400" />
                        <span>PIN Kasir (6 Digit)</span>
                    </div>
                    <span class="font-mono font-semibold" :class="user.pin ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'">
                        {{ user.pin ? '•••••• (Aktif)' : 'Belum Diatur' }}
                    </span>
                </div>

                <div class="flex items-center justify-between py-2">
                    <div class="flex items-center gap-2 text-neutral-500">
                        <Calendar class="size-4 text-neutral-400" />
                        <span>Terdaftar Sejak</span>
                    </div>
                    <span class="font-mono text-neutral-700 dark:text-neutral-300">
                        {{ formatDateTime(user.created_at) }}
                    </span>
                </div>
            </div>

            <!-- Role Scope Info Box -->
            <div class="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-950/40 space-y-1.5">
                <div class="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    <ShieldCheck class="size-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Cakupan Hak Akses Role</span>
                </div>
                <p class="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    <span v-if="user.roles?.some(r => r.name === 'owner' || r.name === 'admin')">
                        Pengguna ini memiliki hak akses penuh untuk mengelola master data produk, inventori, laporan laba dashboard, dan operasional kasir.
                    </span>
                    <span v-else>
                        Pengguna ini dibatasi hanya untuk mengoperasikan Terminal Kasir POS, membuka/menutup shift kasir, dan melihat log transaksi penjualan.
                    </span>
                </p>
            </div>

            <!-- Footer Actions -->
            <div class="pt-2 flex items-center justify-end gap-2">
                <button
                    type="button"
                    class="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                    @click="emit('update:open', false)"
                >
                    Tutup
                </button>
                <button
                    type="button"
                    class="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-neutral-800 active:scale-[0.98] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 transition-all cursor-pointer"
                    @click="emit('edit', user); emit('update:open', false)"
                >
                    <Pencil class="size-3.5" />
                    <span>Edit Pengguna</span>
                </button>
            </div>
        </div>
    </div>
</template>
