<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointOfInterest extends Model
{
    protected $fillable = ['name', 'type', 'latitude', 'longitude'];
}
