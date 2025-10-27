<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'customers';

    const CREATED_AT = 'create_date';
    const UPDATED_AT = null;
    const DELETED_AT = 'delete_date';

    protected $dates = ['create_date', 'delete_date'];

    protected $fillable = [
        'first_name', 'last_name', 'email', 'phone', 'address', 'city', 'province', 'postal_code',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
