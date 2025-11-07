<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $table = 'categories';

    // Migration creates id, name_en, name_fr, description_en, description_fr, thumbnail
    public $timestamps = false;

    protected $fillable = [
        'name_en',
        'name_fr',
        // descriptions and thumbnail removed from categories; managed on options
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_categories', 'category_id', 'product_id');
    }

    public function options()
    {
        return $this->belongsToMany(Option::class, 'category_option', 'category_id', 'option_id');
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
