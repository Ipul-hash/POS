<?php

namespace App\Http\Controllers\Api\MasterData;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles');

        if ($request->has('role')) {
            $query->role($request->role);
        }

        $users = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna berhasil didapatkan',
            'data' => $users,
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'pin' => 'nullable|string|max:255',
            'role' => 'required|exists:roles,name',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'pin' => $request->pin,
            'is_active' => $request->is_active ?? true,
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil ditambahkan',
            'data' => $user->load('roles'),
        ], 201);
    }

    public function show(string $id)
    {
        $user = User::with('roles')->find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan',
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pengguna berhasil didapatkan',
            'data' => $user,
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'pin' => 'nullable|string|max:255',
            'role' => 'sometimes|required|exists:roles,name',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['name', 'email', 'pin', 'is_active']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($request->has('role')) {
            $user->syncRoles([$request->role]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil diupdate',
            'data' => $user->load('roles'),
        ], 200);
    }

    public function destroy(string $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan',
                'data' => null,
            ], 404);
        }

        $user->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna berhasil dinonaktifkan',
            'data' => $user,
        ], 200);
    }

    public function roles()
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar peran berhasil didapatkan',
            'data' => $roles,
        ], 200);
    }
}