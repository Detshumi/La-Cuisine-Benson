<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    use HasFactory;

    protected $table = 'options';

    // The migration for options only creates id, name_en and name_fr.
    // There are no timestamp or soft-delete columns, so disable timestamps.
    public $timestamps = false;

    /** @var array */
    protected $fillable = [
        'name_en',
        'name_fr',
        'description_en',
        'description_fr',
        'thumbnail',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_options', 'option_id', 'product_id')
            ->withPivot('extra_price');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_option', 'option_id', 'category_id');
    }

    /**
     * Store names in lowercase for consistent uniqueness and comparisons.
     */
    public function setNameEnAttribute($value)
    {
        $this->attributes['name_en'] = $value === null ? null : mb_strtolower($value, 'UTF-8');
    }

    public function getNameEnAttribute($value)
    {
        if ($value === null) {
            return null;
        }
        $lower = mb_strtolower($value, 'UTF-8');
        $first = mb_strtoupper(mb_substr($lower, 0, 1, 'UTF-8'), 'UTF-8');
        return $first . mb_substr($lower, 1, null, 'UTF-8');
    }

    public function setNameFrAttribute($value)
    {
        $this->attributes['name_fr'] = $value === null ? null : mb_strtolower($value, 'UTF-8');
    }

    public function getNameFrAttribute($value)
    {
        if ($value === null) {
            return null;
        }
        $lower = mb_strtolower($value, 'UTF-8');
        $first = mb_strtoupper(mb_substr($lower, 0, 1, 'UTF-8'), 'UTF-8');
        return $first . mb_substr($lower, 1, null, 'UTF-8');
    }
}
