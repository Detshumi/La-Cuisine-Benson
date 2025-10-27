<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Option extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'options';

    const CREATED_AT = 'create_date';
    const UPDATED_AT = null;
    const DELETED_AT = 'delete_date';

    protected $dates = ['create_date', 'delete_date'];

    protected $fillable = ['name_en', 'name_fr', 'price', 'sku'];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_options', 'option_id', 'product_id')
            ->withPivot('extra_price');
    }
}
