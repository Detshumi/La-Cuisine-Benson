<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProductOption extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'product_options';

    const CREATED_AT = 'create_date';
    const UPDATED_AT = null;
    const DELETED_AT = 'delete_date';

    protected $dates = ['create_date', 'delete_date'];

    protected $fillable = ['product_id', 'option_id', 'extra_price'];

    protected $casts = [
        'extra_price' => 'decimal:2',
    ];
}
