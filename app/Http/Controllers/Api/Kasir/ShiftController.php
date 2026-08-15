<?php

namespace App\Http\Controllers\Api\Kasir;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Shift;
use App\Models\StoreProfile;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ShiftController extends Controller
{
    public function index(Request $request)
    {
        $query = Shift::with(['cashier', 'transactions.payments']);

        if ($request->has('cashier_id') && $request->cashier_id != '') {
            $query->where('cashier_id', $request->cashier_id);
        }

        if ($request->has('status') && $request->status != '') {
            if ($request->status === 'open') {
                $query->whereNull('closed_at');
            } elseif ($request->status === 'closed') {
                $query->whereNotNull('closed_at');
            }
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('opened_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59',
            ]);
        }

        $shifts = $query->orderBy('id', 'desc')->get()->map(function ($shift) {
            $paidTransactions = $shift->transactions->where('status', 'paid');
            $totalSales = (float) $paidTransactions->sum('grand_total');
            $totalCash = 0;

            foreach ($paidTransactions as $tx) {
                $totalCash += (float) $tx->payments->where('method', 'cash')->sum('amount');
            }

            $opening = (float) $shift->opening_balance;
            $closing = $shift->closing_balance !== null ? (float) $shift->closing_balance : null;
            $expected = $opening + $totalCash;
            $variance = $closing !== null ? ($closing - $expected) : null;

            return [
                'id' => $shift->id,
                'cashier_id' => $shift->cashier_id,
                'opening_balance' => $opening,
                'closing_balance' => $closing,
                'opened_at' => $shift->opened_at,
                'closed_at' => $shift->closed_at,
                'cashier' => $shift->cashier,
                'total_sales' => $totalSales,
                'total_transactions_count' => $paidTransactions->count(),
                'expected_cash' => $expected,
                'cash_variance' => $variance,
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Daftar shift berhasil didapatkan',
            'data' => $shifts,
        ], 200);
    }

    public function current(Request $request)
    {
        $userId = $request->user()->id ?? 1;

        $activeShift = Shift::with(['cashier', 'transactions.payments'])
            ->where('cashier_id', $userId)
            ->whereNull('closed_at')
            ->latest('opened_at')
            ->first();

        if (!$activeShift) {
            return response()->json([
                'success' => true,
                'message' => 'Tidak ada shift yang aktif saat ini',
                'data' => null,
            ], 200);
        }

        $summary = $this->calculateShiftSummary($activeShift);

        return response()->json([
            'success' => true,
            'message' => 'Shift aktif berhasil didapatkan',
            'data' => [
                'shift' => $activeShift,
                'summary' => $summary,
            ],
        ], 200);
    }

    public function open(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'opening_balance' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $userId = $request->user()->id ?? 1;

        $activeShift = Shift::where('cashier_id', $userId)
            ->whereNull('closed_at')
            ->first();

        if ($activeShift) {
            return response()->json([
                'success' => false,
                'message' => 'Masih ada shift yang belum ditutup',
                'data' => $activeShift,
            ], 400);
        }

        $shift = Shift::create([
            'cashier_id' => $userId,
            'opening_balance' => $request->opening_balance,
            'opened_at' => Carbon::now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift kasir berhasil dibuka',
            'data' => $shift->load('cashier'),
        ], 201);
    }

    public function close(Request $request, string $id)
    {
        $shift = Shift::with(['cashier', 'transactions.payments'])->find($id);

        if (!$shift) {
            return response()->json([
                'success' => false,
                'message' => 'Shift tidak ditemukan',
                'data' => null,
            ], 404);
        }

        if ($shift->closed_at) {
            return response()->json([
                'success' => false,
                'message' => 'Shift ini sudah ditutup sebelumnya',
                'data' => $shift,
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'closing_balance' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $shift->update([
            'closing_balance' => $request->closing_balance,
            'closed_at' => Carbon::now(),
        ]);

        $summary = $this->calculateShiftSummary($shift);
        $storeProfile = StoreProfile::first() ?? (object)[
            'name' => 'POS Nusantara Outlet',
            'address' => 'Jl. Sudirman No. 88, Jakarta Pusat',
            'phone' => '0812-3456-7890',
            'logo_url' => null,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Shift berhasil ditutup dan laporan penjualan telah digenerate',
            'data' => [
                'shift' => $shift->fresh(['cashier', 'transactions.payments']),
                'summary' => $summary,
                'store' => $storeProfile,
            ],
        ], 200);
    }

    public function show(string $id)
    {
        $shift = Shift::with(['cashier', 'transactions.payments'])->find($id);

        if (!$shift) {
            return response()->json([
                'success' => false,
                'message' => 'Shift tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $summary = $this->calculateShiftSummary($shift);

        return response()->json([
            'success' => true,
            'message' => 'Detail shift berhasil didapatkan',
            'data' => [
                'shift' => $shift,
                'summary' => $summary,
            ],
        ], 200);
    }

    public function report(string $id)
    {
        $shift = Shift::with(['cashier', 'transactions.items.product', 'transactions.payments'])->find($id);

        if (!$shift) {
            return response()->json([
                'success' => false,
                'message' => 'Shift tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $summary = $this->calculateShiftSummary($shift);
        $storeProfile = StoreProfile::first() ?? (object)[
            'name' => 'POS Nusantara Outlet',
            'address' => 'Jl. Sudirman No. 88, Jakarta Pusat',
            'phone' => '0812-3456-7890',
            'logo_url' => null,
        ];

        return response()->json([
            'success' => true,
            'message' => 'Laporan penutupan shift (Z-Report) berhasil didapatkan',
            'data' => [
                'shift' => $shift,
                'summary' => $summary,
                'store' => $storeProfile,
            ],
        ], 200);
    }

    private function calculateShiftSummary(Shift $shift): array
    {
        $paidTransactions = $shift->transactions->where('status', 'paid');
        $voidTransactions = $shift->transactions->where('status', 'void');

        $totalSales = (float) $paidTransactions->sum('grand_total');
        $totalDiscount = (float) $paidTransactions->sum('discount_total');
        $totalTax = (float) $paidTransactions->sum('tax_total');

        $paymentsByMethod = [
            'cash' => 0.0,
            'qris' => 0.0,
            'debit' => 0.0,
            'credit' => 0.0,
            'ewallet' => 0.0,
        ];

        foreach ($paidTransactions as $tx) {
            foreach ($tx->payments as $payment) {
                $method = $payment->method;
                $amount = (float) $payment->amount;
                if (isset($paymentsByMethod[$method])) {
                    $paymentsByMethod[$method] += $amount;
                } else {
                    $paymentsByMethod[$method] = $amount;
                }
            }
        }

        $opening = (float) $shift->opening_balance;
        $totalCash = $paymentsByMethod['cash'];
        $expectedCash = $opening + $totalCash;
        $closing = $shift->closing_balance !== null ? (float) $shift->closing_balance : null;
        $cashVariance = $closing !== null ? ($closing - $expectedCash) : null;

        return [
            'total_sales' => $totalSales,
            'total_discount' => $totalDiscount,
            'total_tax' => $totalTax,
            'total_transactions_count' => $paidTransactions->count(),
            'void_transactions_count' => $voidTransactions->count(),
            'total_cash_payments' => $totalCash,
            'payments_by_method' => $paymentsByMethod,
            'opening_balance' => $opening,
            'expected_cash' => $expectedCash,
            'closing_balance' => $closing,
            'cash_variance' => $cashVariance,
        ];
    }
}