<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Inventory;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class ProdukController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'inventory']);

        if ($request->has('category_id') && $request->category_id != '') {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('sku', 'like', '%' . $searchTerm . '%')
                  ->orWhere('barcode', 'like', '%' . $searchTerm . '%');
            });
        }

        if ($request->has('barcode') && $request->barcode != '') {
            $query->where('barcode', $request->barcode);
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $produk = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar produk berhasil didapatkan',
            'data' => $produk,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id'   => 'required|exists:categories,id',
            'sku'           => 'required|string|max:50|unique:products,sku',
            'barcode'       => 'nullable|string|max:50|unique:products,barcode',
            'name'          => 'required|string|max:150',
            'unit'          => 'nullable|string|max:20',
            'cost_price'    => 'nullable|numeric|min:0',
            'sell_price'    => 'required|numeric|min:0',
            'image_url'     => 'nullable|string|max:255',
            'is_active'     => 'nullable|boolean',
            'quantity'      => 'nullable|integer|min:0',
            'initial_stock' => 'nullable|integer|min:0',
            'min_stock'     => 'nullable|integer|min:0',
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
            $produk = Product::create($request->only([
                'category_id',
                'sku',
                'barcode',
                'name',
                'unit',
                'cost_price',
                'sell_price',
                'image_url',
                'is_active',
            ]));

            $initialQty = $request->input('quantity', $request->input('initial_stock', 0)) ?? 0;
            $minStock = $request->input('min_stock', 0) ?? 0;

            Inventory::create([
                'product_id' => $produk->id,
                'quantity'   => (int) $initialQty,
                'min_stock'  => (int) $minStock,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil ditambahkan',
                'data' => $produk->load(['category', 'inventory']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server saat menyimpan data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(string $id)
    {
        $produk = Product::with(['category', 'inventory'])->find($id);

        if (!$produk) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail produk berhasil didapatkan',
            'data' => $produk,
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        $produk = Product::find($id);

        if (!$produk) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:categories,id',
            'sku'         => 'sometimes|required|string|max:50|unique:products,sku,' . $id,
            'barcode'     => 'nullable|string|max:50|unique:products,barcode,' . $id,
            'name'        => 'sometimes|required|string|max:150',
            'unit'        => 'nullable|string|max:20',
            'cost_price'  => 'nullable|numeric|min:0',
            'sell_price'  => 'sometimes|required|numeric|min:0',
            'image_url'   => 'nullable|string|max:255',
            'is_active'   => 'nullable|boolean',
            'min_stock'   => 'nullable|integer|min:0',
            'quantity'    => 'nullable|integer|min:0',
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
            $produk->update($request->only([
                'category_id',
                'sku',
                'barcode',
                'name',
                'unit',
                'cost_price',
                'sell_price',
                'image_url',
                'is_active',
            ]));

            if ($request->has('min_stock') || $request->has('quantity')) {
                if ($produk->inventory) {
                    $inventoryData = [];
                    if ($request->has('min_stock')) {
                        $inventoryData['min_stock'] = (int) $request->min_stock;
                    }
                    if ($request->has('quantity')) {
                        $inventoryData['quantity'] = (int) $request->quantity;
                    }
                    if (!empty($inventoryData)) {
                        $produk->inventory->update($inventoryData);
                    }
                } else {
                    Inventory::create([
                        'product_id' => $produk->id,
                        'quantity'   => (int) $request->input('quantity', 0),
                        'min_stock'  => (int) $request->input('min_stock', 0),
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil diupdate',
                'data' => $produk->load(['category', 'inventory']),
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(string $id)
    {
        $produk = Product::find($id);

        if (!$produk) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan',
                'data' => null,
            ], 404);
        }

        try {
            $produk->delete();

            return response()->json([
                'success' => true,
                'message' => 'Produk berhasil dihapus permanen',
                'data' => null,
            ], 200);

        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                $produk->update(['is_active' => false]);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Produk sudah dipakai dalam transaksi sehingga tidak dapat dihapus. Status produk berhasil diubah menjadi Nonaktif.',
                    'data' => $produk,
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghapus data produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cekStok(string $id)
    {
        $produk = Product::with('inventory')->find($id);

        if (!$produk) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Stok produk berhasil didapatkan',
            'data' => [
                'product_id' => $produk->id,
                'name' => $produk->name,
                'current_stock' => $produk->inventory ? $produk->inventory->quantity : 0,
                'min_stock' => $produk->inventory ? $produk->inventory->min_stock : 0,
            ],
        ], 200);
    }
}