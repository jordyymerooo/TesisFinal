<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — ULEAM Alojamiento API
|--------------------------------------------------------------------------
| Este backend es 100% API REST. No hay vistas Blade ni rutas web activas.
| Toda la funcionalidad se expone en /api/v1/* (ver routes/api.php).
|--------------------------------------------------------------------------
*/

// Redirigir la raíz al health-check de la API
Route::get('/', fn () => response()->json([
    'app'     => config('app.name'),
    'type'    => 'REST API',
    'docs'    => '/api/v1/ping',
    'version' => 'v1',
]));
