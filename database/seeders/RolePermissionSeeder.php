<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create Permissions
        $permissions = [
            'view-dashboard',
            'manage-categories',
            'manage-products',
            'manage-inventory',
            'manage-discounts',
            'access-pos',
            'manage-shifts',
            'view-transactions',
            'manage-users',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Create Roles
        $ownerRole = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $kasirRole = Role::firstOrCreate(['name' => 'kasir', 'guard_name' => 'web']);

        // 3. Assign Permissions to Roles
        $ownerRole->syncPermissions(Permission::all());
        $adminRole->syncPermissions(Permission::all());
        $kasirRole->syncPermissions([
            'access-pos',
            'manage-shifts',
            'view-transactions',
        ]);

        // 4. Assign Roles to Existing Users
        $users = User::all();
        foreach ($users as $user) {
            if ($user->id === 1 || str_contains(strtolower($user->email), 'owner') || str_contains(strtolower($user->name), 'owner')) {
                $user->syncRoles(['owner']);
            } elseif (str_contains(strtolower($user->email), 'admin') || str_contains(strtolower($user->name), 'admin')) {
                $user->syncRoles(['admin']);
            } elseif (str_contains(strtolower($user->email), 'kasir') || str_contains(strtolower($user->name), 'kasir')) {
                $user->syncRoles(['kasir']);
            } else {
                // Default fallback to owner for first user, kasir for others
                if ($user->id === 1) {
                    $user->syncRoles(['owner']);
                } else {
                    $user->syncRoles(['kasir']);
                }
            }
        }

        // 5. Ensure sample accounts exist for testing
        $ownerUser = User::firstOrCreate(
            ['email' => 'owner@posnusantara.com'],
            [
                'name' => 'Budi Pratama (Owner)',
                'password' => Hash::make('password'),
                'pin' => '123456',
                'is_active' => true,
            ]
        );
        $ownerUser->syncRoles(['owner']);

        $adminUser = User::firstOrCreate(
            ['email' => 'admin@posnusantara.com'],
            [
                'name' => 'Admin Outlet',
                'password' => Hash::make('password'),
                'pin' => '123456',
                'is_active' => true,
            ]
        );
        $adminUser->syncRoles(['admin']);

        $kasirUser = User::firstOrCreate(
            ['email' => 'kasir@posnusantara.com'],
            [
                'name' => 'Siti Kasir',
                'password' => Hash::make('password'),
                'pin' => '123456',
                'is_active' => true,
            ]
        );
        $kasirUser->syncRoles(['kasir']);
    }
}
