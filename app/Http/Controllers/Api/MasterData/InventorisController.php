<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Inventory;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class InventorisController extends Controller
{

    public function index(Request $request)
    {
        $query = Inventory::with('product.category');

        if ($request->boolean('low_stock')) {
            $query->whereColumn('quantity', '<=', 'min_stock');
        }

        $inventori = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar stok berhasil didapatkan',
            'data' => $inventori,
        ], 200);
    }


    public function adjust(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'type'       => 'required|in:in,out,adjustment',
            'quantity'   => 'required|integer|min:1', // Jumlah perubahan stok
            'note'       => 'nullable|string|max:255',
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
            $inventory = Inventory::where('product_id', $request->product_id)->lockForUpdate()->first();

            if (!$inventory) {
                throw new \Exception('Data inventori untuk produk ini tidak ditemukan.');
            }

            $oldQuantity = $inventory->quantity;
            $qtyChange = $request->quantity;

            if ($request->type === 'in') {
                $inventory->quantity += $qtyChange;
            } elseif ($request->type === 'out') {
                if ($inventory->quantity < $qtyChange) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok tidak mencukupi untuk dikeluarkan',
                        'data' => ['current_stock' => $inventory->quantity]
                    ], 400);
                }
                $inventory->quantity -= $qtyChange;
            } elseif ($request->type === 'adjustment') {
                $inventory->quantity = $qtyChange; 
                $qtyChange = $inventory->quantity - $oldQuantity; 
            }

            $inventory->save();

            StockMovement::create([
                'product_id'     => $request->product_id,
                'type'           => $request->type,
                'quantity'       => abs($request->quantity), // Simpan nilai absolut yang diinput
                'reference_type' => 'manual',
                'note'           => $request->note,
                'created_by'     => $request->user()->id ?? 1, // Pastikan auth jalan, default 1 untuk testing
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Stok berhasil disesuaikan',
                'data' => $inventory->load('product.category'),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menyesuaikan stok',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function lowStock()
    {
        $lowStockItems = Inventory::with('product.category')
            ->whereColumn('quantity', '<=', 'min_stock')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar produk dengan stok menipis berhasil didapatkan',
            'data' => $lowStockItems,
        ], 200);
    }


    public function update(Request $request, string $id)
    {
        $inventory = Inventory::find($id);

        if (!$inventory) {
            return response()->json([
                'success' => false,
                'message' => 'Data inventori tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'min_stock' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $inventory->update(['min_stock' => $request->min_stock]);

        return response()->json([
            'success' => true,
            'message' => 'Batas stok minimum berhasil diupdate',
            'data' => $inventory->load('product.category'),
        ], 200);
    }

    public function movements(Request $request)
    {
        $query = StockMovement::with(['product.category', 'creator'])->orderBy('id', 'desc');

        if ($request->has('product_id') && $request->product_id != '') {
            $query->where('product_id', $request->product_id);
        }

        if ($request->has('type') && $request->type != '') {
            $query->where('type', $request->type);
        }

        $movements = $query->take(100)->get();

        return response()->json([
            'success' => true,
            'message' => 'Riwayat pergerakan stok berhasil didapatkan',
            'data' => $movements,
        ], 200);
    }

}