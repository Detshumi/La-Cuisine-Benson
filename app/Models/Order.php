<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'orders';

    const CREATED_AT = 'create_date';
    const UPDATED_AT = null;
    const DELETED_AT = 'delete_date';

    protected $dates = ['create_date', 'delete_date', 'placed_at'];

    protected $fillable = ['customer_id', 'total', 'status', 'placed_at'];

    protected $casts = [
        'total' => 'decimal:2',
        'placed_at' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function details()
    {
        return $this->hasMany(OrderDetail::class);
    }
}
