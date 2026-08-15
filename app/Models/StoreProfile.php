<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreProfile extends Model
{
    use HasFactory;

    protected $table = 'store_profile';

    protected $fillable = [
        'name',
        'address',
        'phone',
        'logo_url',
    ];
}