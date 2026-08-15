<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Discount;
use Illuminate\Support\Facades\Validator;

class DiscountController extends Controller
{
    public function index(Request $request)
    {
        $query = Discount::query();

        if ($request->has('search') && $request->search != '') {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->has('type') && $request->type != '') {
            $query->where('type', $request->type);
        }

        if ($request->has('applies_to') && $request->applies_to != '') {
            $query->where('applies_to', $request->applies_to);
        }

        if ($request->has('is_active') && $request->is_active !== null && $request->is_active !== '') {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        $discounts = $query->orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar diskon berhasil didapatkan',
            'data' => $discounts,
        ], 200);
    }


    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'       => 'required|string|max:100',
            'type'       => 'required|in:percentage,fixed',
            'value'      => 'required|numeric|min:0',
            'applies_to' => 'required|in:product,transaction',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'is_active'  => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $discount = Discount::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Diskon berhasil ditambahkan',
            'data' => $discount,
        ], 201);
    }

    public function show(string $id)
    {
        $discount = Discount::find($id);

        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Diskon tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail diskon berhasil didapatkan',
            'data' => $discount,
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        $discount = Discount::find($id);

        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Diskon tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'       => 'sometimes|required|string|max:100',
            'type'       => 'sometimes|required|in:percentage,fixed',
            'value'      => 'sometimes|required|numeric|min:0',
            'applies_to' => 'sometimes|required|in:product,transaction',
            'start_date' => 'sometimes|required|date',
            'end_date'   => 'sometimes|required|date|after_or_equal:start_date',
            'is_active'  => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $discount->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Diskon berhasil diupdate',
            'data' => $discount,
        ], 200);
    }

    public function destroy(string $id)
    {
        $discount = Discount::find($id);

        if (!$discount) {
            return response()->json([
                'success' => false,
                'message' => 'Diskon tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $discount->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Diskon berhasil dinonaktifkan',
            'data' => $discount,
        ], 200);
    }
}