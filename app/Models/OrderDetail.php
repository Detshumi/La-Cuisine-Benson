<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'order_details';

    const CREATED_AT = 'create_date';
    const UPDATED_AT = null;
    const DELETED_AT = 'delete_date';

    protected $dates = ['create_date', 'delete_date'];

    protected $fillable = ['order_id', 'product_id', 'quantity', 'unit_price', 'options'];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'quantity' => 'integer',
        'options' => 'array',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
