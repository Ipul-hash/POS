<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { Form, Head, useForm, usePage } from '@inertiajs/vue3';
import {
    AlertCircle,
    CheckCircle2,
    Delete,
    Eye,
    EyeOff,
    Headphones,
    KeyRound,
    Lock,
    Mail,
    ShieldAlert,
    ShieldCheck,
    Store,
    User,
    X,
} from '@lucide/vue';
import InputError from '@/components/InputError.vue';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

defineOptions({
    layout: (h: any, page: any) => page,
});

defineProps<{
    status?: string;
    canResetPassword: boolean;
}>();

const page = usePage();

const showPassword = ref(false);
const isContactAdminModalOpen = ref(false);
const isPinModalOpen = ref(false);
const modalType = ref<'forgot_password' | 'sign_up' | 'deactivated'>('forgot_password');

// Quick PIN Login Form
const pinForm = useForm({
    email: '',
    password: '', // stores the PIN
    remember: true,
});

function openContactAdmin(type: 'forgot_password' | 'sign_up' | 'deactivated') {
    modalType.value = type;
    isContactAdminModalOpen.value = true;
}

function openPinModal() {
    pinForm.email = '';
    pinForm.password = '';
    isPinModalOpen.value = true;
}

function handleNumpadPress(digit: string) {
    if (pinForm.password.length < 6) {
        pinForm.password += digit;
    }
}

function handleNumpadDelete() {
    pinForm.password = pinForm.password.slice(0, -1);
}

function handleNumpadClear() {
    pinForm.password = '';
}

function handlePinSubmit() {
    if (!pinForm.email || pinForm.password.length === 0) return;
    pinForm.post('/login', {
        onSuccess: () => {
            isPinModalOpen.value = false;
        },
    });
}

watchEffect(() => {
    const errs = page.props.errors as Record<string, string> | undefined;
    if (errs) {
        if (
            errs.account_deactivated ||
            (errs.email && errs.email.toLowerCase().includes('dinonaktifkan'))
        ) {
            openContactAdmin('deactivated');
        }
    }
});
</script>

<template>
    <Head title="Sign In - POS Nusantara" />

    <div class="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 select-none">
        <!-- Main Split Card Container -->
        <div class="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-neutral-200/80 flex flex-col md:flex-row min-h-[560px]">
            
            <!-- LEFT PANEL: Dynamic Blue Sphere Creative Welcome -->
            <div class="relative w-full md:w-[46%] bg-gradient-to-br from-[#0062E0] via-[#004dc2] to-[#00338f] text-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
                <!-- 3D Organic Blue Spheres (Decorations matching mockup) -->
                <div class="absolute -bottom-16 -left-16 size-64 sm:size-72 rounded-full bg-gradient-to-tr from-[#003d99] via-[#005ce6] to-[#3385ff] shadow-2xl opacity-95 pointer-events-none"></div>
                <div class="absolute bottom-6 -right-12 size-48 sm:size-52 rounded-full bg-gradient-to-tl from-[#002966] via-[#0052cc] to-[#297aff] shadow-2xl opacity-95 pointer-events-none"></div>
                <div class="absolute -top-10 -right-10 size-40 rounded-full bg-blue-300/20 blur-2xl pointer-events-none"></div>

                <!-- Top Brand / Welcome Text -->
                <div class="relative z-10 space-y-2 mt-4 sm:mt-8">
                    <h1 class="text-3xl sm:text-4xl font-black tracking-wider uppercase drop-shadow-sm">
                        WELCOME
                    </h1>
                    <h2 class="text-sm sm:text-base font-extrabold tracking-widest text-blue-100 uppercase">
                        POS NUSANTARA
                    </h2>
                    <p class="text-xs sm:text-sm text-blue-100/85 leading-relaxed pt-2 max-w-xs font-medium">
                        Sistem manajemen kasir penjualan cerdas, inventori stok terintegrasi, dan laporan analitik bisnis modern.
                    </p>
                </div>
            </div>

            <!-- RIGHT PANEL: Clean Sign In Form -->
            <div class="relative w-full md:w-[54%] bg-white p-8 sm:p-12 flex flex-col justify-between overflow-hidden">
                <!-- Ambient Blue Sphere peeking at bottom right corner (from mockup) -->
                <div class="absolute -bottom-16 -right-16 size-40 sm:size-44 rounded-full bg-gradient-to-tl from-[#0047b3] via-[#0066ff] to-[#3399ff] opacity-90 pointer-events-none"></div>

                <div>
                    <!-- Form Title & Subtitle -->
                    <div class="space-y-1">
                        <h2 class="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
                            Sign in
                        </h2>
                        <p class="text-xs text-neutral-400 font-medium">
                            Masukkan email dan kata sandi atau PIN kasir Anda
                        </p>
                    </div>

                    <!-- Status Message if any -->
                    <div
                        v-if="status"
                        class="mt-3 rounded-xl bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700 border border-emerald-200"
                    >
                        {{ status }}
                    </div>

                    <!-- Form -->
                    <Form
                        v-bind="store.form()"
                        :reset-on-success="['password']"
                        v-slot="{ errors, processing }"
                        class="mt-6 space-y-4"
                    >
                        <!-- Deactivated Alert Banner if error exists -->
                        <div
                            v-if="errors.account_deactivated || (errors.email && errors.email.toLowerCase().includes('dinonaktifkan'))"
                            class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 space-y-1"
                        >
                            <div class="flex items-center gap-1.5 font-bold">
                                <ShieldAlert class="size-4 text-rose-600" />
                                <span>Akun Dinonaktifkan</span>
                            </div>
                            <p class="text-[11px] leading-relaxed">
                                Akun Anda telah dinonaktifkan. Silakan hubungi administrator outlet.
                            </p>
                        </div>

                        <!-- Username / Email Input Box -->
                        <div class="space-y-1">
                            <div class="flex items-center rounded-xl bg-[#f0f2f5] px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#0062E0] focus-within:bg-white border border-transparent focus-within:border-blue-200">
                                <User class="size-4.5 text-neutral-500 shrink-0 mr-3" />
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autofocus
                                    autocomplete="email"
                                    placeholder="User Name / Email"
                                    class="w-full bg-transparent text-xs sm:text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
                                />
                            </div>
                            <InputError :message="errors.email" />
                        </div>

                        <!-- Password / PIN Input Box with SHOW/HIDE button -->
                        <div class="space-y-1">
                            <div class="flex items-center rounded-xl bg-[#f0f2f5] px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-[#0062E0] focus-within:bg-white border border-transparent focus-within:border-blue-200">
                                <Lock class="size-4.5 text-neutral-500 shrink-0 mr-3" />
                                <input
                                    id="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    name="password"
                                    required
                                    autocomplete="current-password"
                                    placeholder="Password atau PIN Kasir (6 Digit)"
                                    class="w-full bg-transparent text-xs sm:text-sm font-medium text-neutral-800 placeholder:text-neutral-400 focus:outline-none font-mono"
                                />
                                <button
                                    type="button"
                                    class="shrink-0 text-[11px] font-extrabold text-[#0B3B60] hover:text-[#0062E0] uppercase tracking-wider cursor-pointer transition-colors"
                                    @click="showPassword = !showPassword"
                                >
                                    {{ showPassword ? 'HIDE' : 'SHOW' }}
                                </button>
                            </div>
                            <InputError :message="errors.password" />
                        </div>

                        <!-- Remember Me & Forgot Password Row -->
                        <div class="flex items-center justify-between pt-1">
                            <label for="remember" class="flex items-center gap-2 text-xs text-neutral-600 font-medium cursor-pointer">
                                <input
                                    id="remember"
                                    name="remember"
                                    type="checkbox"
                                    class="size-4 rounded border-neutral-300 text-[#0B3B60] focus:ring-0 cursor-pointer"
                                />
                                <span>Remember me</span>
                            </label>

                            <!-- Forgot Password Trigger -->
                            <button
                                type="button"
                                class="text-xs font-semibold text-[#0B3B60] hover:underline cursor-pointer"
                                @click="openContactAdmin('forgot_password')"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <!-- Sign In Button -->
                        <button
                            type="submit"
                            :disabled="processing"
                            class="w-full h-11 sm:h-12 rounded-xl bg-[#0B3B60] text-white text-sm font-bold tracking-wide shadow-md hover:bg-[#072a45] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                        >
                            <Spinner v-if="processing" class="text-white" />
                            <span>Sign in</span>
                        </button>
                    </Form>

                    <!-- OR Divider -->
                    <div class="relative my-4 flex items-center justify-center">
                        <div class="w-full border-t border-neutral-200"></div>
                        <span class="absolute bg-white px-3 text-[11px] font-semibold text-neutral-400 uppercase">
                            Or
                        </span>
                    </div>

                    <!-- Sign In With PIN Kasir (Numpad Modal Trigger) -->
                    <button
                        type="button"
                        class="w-full h-11 rounded-xl border-2 border-neutral-800 bg-white text-xs font-bold text-neutral-800 hover:bg-neutral-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        @click="openPinModal"
                    >
                        <KeyRound class="size-4 text-[#0B3B60]" />
                        <span>Sign in with other (Login Cepat PIN Kasir)</span>
                    </button>
                </div>

                <!-- Bottom Link: Don't have an account? Sign Up -->
                <div class="pt-6 text-center text-xs text-neutral-500 font-medium">
                    <span>Don't have an account? </span>
                    <button
                        type="button"
                        class="font-bold text-[#0B3B60] hover:underline cursor-pointer ml-1"
                        @click="openContactAdmin('sign_up')"
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>

        <!-- CONTACT ADMIN POP-UP MODAL -->
        <div
            v-if="isContactAdminModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
            <div
                class="relative w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            >
                <!-- Modal Top Icon with Background -->
                <div
                    class="mx-auto flex size-16 items-center justify-center rounded-3xl border shadow-inner"
                    :class="
                        modalType === 'deactivated'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-blue-50 text-[#0062E0] border-blue-200'
                    "
                >
                    <ShieldAlert v-if="modalType === 'deactivated'" class="size-8" />
                    <Headphones v-else class="size-8" />
                </div>

                <!-- Modal Text Content -->
                <div class="space-y-2">
                    <span
                        class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold font-mono"
                        :class="
                            modalType === 'deactivated'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                        "
                    >
                        {{ modalType === 'deactivated' ? 'Akses Dibatasi' : 'Pusat Bantuan Outlet' }}
                    </span>

                    <h3 class="text-lg font-extrabold text-neutral-900 tracking-tight">
                        {{
                            modalType === 'forgot_password'
                                ? 'Lupa Kata Sandi / PIN?'
                                : modalType === 'sign_up'
                                ? 'Pendaftaran Akun Baru'
                                : 'Akun Dinonaktifkan'
                        }}
                    </h3>

                    <p class="text-xs text-neutral-500 leading-relaxed px-2">
                        <span v-if="modalType === 'forgot_password'">
                            Untuk keamanan data operasional outlet, reset kata sandi atau pengaturan PIN kasir dikelola secara langsung oleh <strong>Administrator / Pemilik Outlet</strong>. Silakan hubungi admin Anda.
                        </span>
                        <span v-else-if="modalType === 'sign_up'">
                            Pendaftaran akun staf dan kasir baru dilakukan secara terpusat oleh <strong>Administrator Outlet</strong> melalui menu <em>Kelola Pengguna</em>. Silakan hubungi admin untuk pembuatan akun.
                        </span>
                        <span v-else>
                            Akun Anda telah dinonaktifkan oleh administrator. Silakan hubungi <strong>Admin / Pemilik Outlet</strong> untuk mengaktifkan kembali akun Anda.
                        </span>
                    </p>
                </div>

                <!-- Info Box -->
                <div class="rounded-2xl bg-neutral-50 p-3 text-[11px] text-neutral-600 border border-neutral-200/80 flex items-center justify-center gap-2">
                    <Store class="size-4 text-[#0062E0]" />
                    <span class="font-semibold">POS Nusantara &bull; Outlet Management</span>
                </div>

                <!-- Close Button -->
                <div class="pt-2">
                    <button
                        type="button"
                        class="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0B3B60] px-5 text-xs font-bold text-white shadow-md hover:bg-[#072a45] active:scale-[0.98] transition-all cursor-pointer"
                        @click="isContactAdminModalOpen = false"
                    >
                        <CheckCircle2 class="size-4" />
                        <span>Mengerti, Tutup</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- QUICK PIN NUMPAD MODAL (FOR TOUCH-SCREEN CASHIERS) -->
        <div
            v-if="isPinModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
            <div
                class="relative w-full max-w-sm overflow-hidden rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            >
                <div class="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div class="flex items-center gap-2.5">
                        <div class="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#0062E0]">
                            <KeyRound class="size-5" />
                        </div>
                        <div>
                            <h3 class="text-sm font-extrabold text-neutral-900">
                                Login Cepat PIN Kasir
                            </h3>
                            <p class="text-[11px] text-neutral-400">
                                Masukkan email & 6 digit PIN kasir
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="p-1 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                        @click="isPinModalOpen = false"
                    >
                        <X class="size-5" />
                    </button>
                </div>

                <!-- Email Input -->
                <div class="space-y-1">
                    <label class="text-xs font-bold text-neutral-700">Email Kasir</label>
                    <input
                        v-model="pinForm.email"
                        type="email"
                        required
                        placeholder="Contoh: kasir@posnusantara.com"
                        class="h-10 w-full rounded-xl border border-neutral-200 bg-[#f0f2f5] px-3.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#0062E0]"
                    />
                    <InputError :message="pinForm.errors.email" />
                </div>

                <!-- PIN Display Dots -->
                <div class="py-2 text-center">
                    <div class="flex items-center justify-center gap-2.5">
                        <div
                            v-for="i in 6"
                            :key="i"
                            class="size-3.5 rounded-full border-2 transition-all duration-200"
                            :class="
                                pinForm.password.length >= i
                                    ? 'bg-[#0B3B60] border-[#0B3B60] scale-110'
                                    : 'border-neutral-300 bg-neutral-100'
                            "
                        ></div>
                    </div>
                    <InputError :message="pinForm.errors.password" class="mt-2" />
                </div>

                <!-- Virtual Numpad Grid -->
                <div class="grid grid-cols-3 gap-2 pt-1">
                    <button
                        v-for="num in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                        :key="num"
                        type="button"
                        class="h-12 rounded-xl bg-neutral-100 text-base font-bold text-neutral-800 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer font-mono"
                        @click="handleNumpadPress(num)"
                    >
                        {{ num }}
                    </button>
                    <button
                        type="button"
                        class="h-12 rounded-xl bg-rose-50 text-xs font-bold text-rose-600 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer"
                        @click="handleNumpadClear"
                    >
                        CLEAR
                    </button>
                    <button
                        type="button"
                        class="h-12 rounded-xl bg-neutral-100 text-base font-bold text-neutral-800 hover:bg-neutral-200 active:scale-95 transition-all cursor-pointer font-mono"
                        @click="handleNumpadPress('0')"
                    >
                        0
                    </button>
                    <button
                        type="button"
                        class="h-12 rounded-xl bg-neutral-100 text-neutral-700 hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                        @click="handleNumpadDelete"
                    >
                        <Delete class="size-5" />
                    </button>
                </div>

                <!-- Submit Button -->
                <button
                    type="button"
                    :disabled="pinForm.processing || !pinForm.email || pinForm.password.length === 0"
                    class="w-full h-11 rounded-xl bg-[#0B3B60] text-white text-xs font-bold shadow-md hover:bg-[#072a45] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    @click="handlePinSubmit"
                >
                    <Spinner v-if="pinForm.processing" class="text-white" />
                    <span>Masuk dengan PIN</span>
                </button>
            </div>
        </div>
    </div>
</template>
