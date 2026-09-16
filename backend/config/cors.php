<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    | Configurado para el sistema ULEAM Alojamiento:
    |   - Permite peticiones desde el frontend React (Vite dev: 5173)
    |   - Permite peticiones desde React Native (Expo: 19000, 19006)
    |   - En producción reemplazar con las URLs reales del dominio
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',   // React Web (CRA)
        'http://localhost:5173',   // React Web (Vite dev)
        'http://localhost:5174',   // React Web (Vite alternativo)
        'http://localhost:19000',  // Expo React Native
        'http://localhost:19006',  // Expo web
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8000',
        env('FRONTEND_URL', 'http://localhost:3000'),
    ],

    'allowed_origins_patterns' => [
        // Permite cualquier IP local (útil en emuladores móviles)
        '/^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/',
        '/^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization'],

    'max_age' => 86400, // 24 horas de preflight cache

    // false para token-based (Sanctum API tokens no usan cookies de sesión)
    'supports_credentials' => false,

];
