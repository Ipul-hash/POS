<?php

namespace App\Http\Controllers\Api\Kasir;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Payment;
use App\Models\Inventory;
use App\Models\StockMovement;
use App\Models\AuditLog;
use App\Models\StoreProfile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransaksiController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['cashier', 'customer', 'items.product', 'payments']);

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00', 
                $request->end_date . ' 23:59:59'
            ]);
        }

        if ($request->has('cashier_id') && $request->cashier_id != '') {
            $query->where('cashier_id', $request->cashier_id);
        }

        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        return response()->json([
            'success' => true,
            'message' => 'Daftar transaksi berhasil didapatkan',
            'data' => $query->orderBy('id', 'desc')->get(),
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shift_id' => 'nullable|exists:shifts,id',
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'payments' => 'required|array|min:1',
            'payments.*.method' => 'required|in:cash,debit,credit,qris,ewallet',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.reference_no' => 'nullable|string',
            'discount_total' => 'nullable|numeric|min:0',
            'tax_total' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);
            }
            
            $grandTotal = $subtotal - ($request->discount_total ?? 0) + ($request->tax_total ?? 0);
            $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6));
            $userId = $request->user()->id ?? 1;

            $shiftId = $request->shift_id;
            if (!$shiftId) {
                $activeShift = \App\Models\Shift::where('cashier_id', $userId)->whereNull('closed_at')->latest()->first();
                if (!$activeShift) {
                    $activeShift = \App\Models\Shift::create([
                        'cashier_id' => $userId,
                        'opening_balance' => 0,
                        'opened_at' => now(),
                    ]);
                }
                $shiftId = $activeShift->id;
            }

            $transaction = Transaction::create([
                'invoice_number' => $invoiceNumber,
                'cashier_id' => $userId,
                'customer_id' => $request->customer_id,
                'shift_id' => $shiftId,
                'subtotal' => $subtotal,
                'discount_total' => $request->discount_total ?? 0,
                'tax_total' => $request->tax_total ?? 0,
                'grand_total' => $grandTotal,
                'status' => 'paid',
            ]);

            foreach ($request->items as $item) {
                $itemSubtotal = ($item['price'] * $item['quantity']) - ($item['discount'] ?? 0);
                
                TransactionItem::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'discount' => $item['discount'] ?? 0,
                    'subtotal' => $itemSubtotal,
                ]);

                $inventory = Inventory::where('product_id', $item['product_id'])->lockForUpdate()->first();
                
                if (!$inventory || $inventory->quantity < $item['quantity']) {
                    throw new \Exception('Stok tidak mencukupi untuk produk ID: ' . $item['product_id']);
                }
                
                $inventory->quantity -= $item['quantity'];
                $inventory->save();

                StockMovement::create([
                    'product_id' => $item['product_id'],
                    'type' => 'out',
                    'quantity' => $item['quantity'],
                    'reference_type' => 'transaction',
                    'reference_id' => $transaction->id,
                    'created_by' => $userId,
                ]);
            }

            foreach ($request->payments as $payment) {
                Payment::create([
                    'transaction_id' => $transaction->id,
                    'method' => $payment['method'],
                    'amount' => $payment['amount'],
                    'reference_no' => $payment['reference_no'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diproses',
                'data' => $transaction->load(['items.product.category', 'payments', 'cashier', 'customer', 'shift']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Transaksi gagal diproses',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $transaction = Transaction::with(['items.product.category', 'payments', 'cashier', 'customer', 'shift'])->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail transaksi berhasil didapatkan',
            'data' => $transaction,
        ], 200);
    }

    public function voidTransaction(Request $request, string $id)
    {
        return $this->processReversal($request, $id, 'void');
    }

    public function refundTransaction(Request $request, string $id)
    {
        return $this->processReversal($request, $id, 'refunded');
    }

    private function processReversal(Request $request, string $id, string $status)
    {
        DB::beginTransaction();
        try {
            $transaction = Transaction::with('items')->find($id);
            $userId = $request->user()->id ?? 1;

            if (!$transaction || $transaction->status !== 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaksi tidak ditemukan atau tidak valid untuk dibatalkan',
                ], 400);
            }

            $transaction->update(['status' => $status]);

            foreach ($transaction->items as $item) {
                $inventory = Inventory::where('product_id', $item->product_id)->lockForUpdate()->first();
                if ($inventory) {
                    $inventory->quantity += $item->quantity;
                    $inventory->save();

                    StockMovement::create([
                        'product_id' => $item->product_id,
                        'type' => 'in',
                        'quantity' => $item->quantity,
                        'reference_type' => $status,
                        'reference_id' => $transaction->id,
                        'created_by' => $userId,
                    ]);
                }
            }

            AuditLog::create([
                'user_id' => $userId,
                'action' => $status,
                'entity' => 'transaction',
                'entity_id' => $transaction->id,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi berhasil diubah menjadi ' . $status,
                'data' => $transaction,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pembatalan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addPayment(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'method' => 'required|in:cash,debit,credit,qris,ewallet',
            'amount' => 'required|numeric|min:1',
            'reference_no' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $transaction = Transaction::find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }

        $payment = Payment::create([
            'transaction_id' => $transaction->id,
            'method' => $request->method,
            'amount' => $request->amount,
            'reference_no' => $request->reference_no,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil ditambahkan',
            'data' => $payment,
        ], 201);
    }

    public function receipt(string $id)
    {
        $transaction = Transaction::with(['items.product.category', 'payments', 'cashier', 'customer', 'shift'])->find($id);

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi tidak ditemukan',
            ], 404);
        }

        $storeProfile = StoreProfile::first();
        if (!$storeProfile) {
            $storeProfile = (object)[
                'name' => 'POS Nusantara Outlet',
                'address' => 'Jl. Sudirman No. 88, Jakarta Pusat',
                'phone' => '0812-3456-7890',
                'logo_url' => null,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Data struk berhasil didapatkan',
            'data' => [
                'store' => $storeProfile,
                'transaction' => $transaction
            ]
        ], 200);
    }

}