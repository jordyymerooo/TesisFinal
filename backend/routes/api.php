<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\FavoritoController;
use App\Http\Controllers\Api\FotografiaController;
use App\Http\Controllers\Api\InmuebleController;
use App\Http\Controllers\Api\MensajeController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\SolicitudReservaController;
use App\Http\Controllers\Api\UbicacionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VerificacionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — ULEAM Alojamiento Estudiantil v1
|--------------------------------------------------------------------------
|
| Prefijo base: /api  (configurado en bootstrap/app.php)
| Versión: v1
|
| Grupos de acceso:
|   - Públicas (sin token)         → auth/register, auth/login, inmuebles GET
|   - Autenticadas (Bearer Token)  → alquileres, perfiles, mensajes (con verified)
|   - Por Rol (role:estudiante)    → solicitudes de reserva, favoritos
|   - Por Rol (role:arrendador)    → publicar/editar inmuebles, responder solicitudes
|   - Por Rol (role:administrador) → KYC, auditorías, gestión de usuarios
|
*/

// ─────────────────────────────────────────────
// VERIFICACIÓN DE EMAIL (MustVerifyEmail)
// ─────────────────────────────────────────────
Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('verification.verify');
Route::get('/v1/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])->name('v1.verification.verify');
Route::post('/email/verification-notification', [EmailVerificationController::class, 'resend'])->name('verification.send');
Route::post('/v1/email/verification-notification', [EmailVerificationController::class, 'resend'])->name('v1.verification.send');
Route::post('/email/verify-status', [EmailVerificationController::class, 'checkStatus'])->name('verification.status');
Route::post('/v1/email/verify-status', [EmailVerificationController::class, 'checkStatus'])->name('v1.verification.status');

// ─────────────────────────────────────────────
// HEALTHCHECK & PING
// ─────────────────────────────────────────────
Route::get('/v1/ping', fn () => response()->json([
    'status'  => 'ok',
    'app'     => config('app.name'),
    'version' => 'v1',
    'time'    => now()->toIso8601String(),
]));

// ─────────────────────────────────────────────
// AUTENTICACIÓN (rutas públicas)
// ─────────────────────────────────────────────
Route::prefix('v1/auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login',    [AuthController::class, 'login'])->name('auth.login');

    // Rutas protegidas
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/me',      [AuthController::class, 'me'])->name('auth.me');
        Route::get('/user',    [AuthController::class, 'me'])->name('auth.user');
    });
});

// ─────────────────────────────────────────────
// INMUEBLES
// ─────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Listar y ver inmuebles: público (con autenticación opcional para arrendador)
    Route::get('/inmuebles',          [InmuebleController::class, 'index'])->name('inmuebles.index');
    // Ruta optimizada para el mapa móvil — DEBE ir antes de /{id} para no colisionar
    Route::get('/inmuebles/mapa',     [InmuebleController::class, 'mapa'])->name('inmuebles.mapa');
    Route::get('/inmuebles/{id}',     [InmuebleController::class, 'show'])->name('inmuebles.show');

    // Gestión de inmuebles: solo arrendador autenticado y con correo verificado
    Route::middleware(['auth:sanctum', 'verified', 'role:arrendador'])->group(function () {
        Route::post('/inmuebles',              [InmuebleController::class, 'store'])->name('inmuebles.store');
        Route::patch('/inmuebles/{id}/estado', [InmuebleController::class, 'toggleStatus'])->name('inmuebles.toggleStatus');
        Route::post('/inmuebles/{id}/estado',  [InmuebleController::class, 'toggleStatus']);
        Route::put('/inmuebles/{id}',          [InmuebleController::class, 'update'])->name('inmuebles.update');
        Route::patch('/inmuebles/{id}',        [InmuebleController::class, 'update']);
        Route::post('/inmuebles/{id}',         [InmuebleController::class, 'update']);
        Route::delete('/inmuebles/{id}',       [InmuebleController::class, 'destroy'])->name('inmuebles.destroy');
    });
});

// ─────────────────────────────────────────────
// SOLICITUDES DE RESERVA (requiere auth:sanctum y verified)
// ─────────────────────────────────────────────
Route::prefix('v1')->middleware(['auth:sanctum', 'verified'])->group(function () {

    // Listar y ver solicitudes: estudiante ve las suyas, arrendador ve las de sus inmuebles
    Route::get('/solicitudes',          [SolicitudReservaController::class, 'index'])->name('solicitudes.index');
    Route::get('/solicitudes/{id}',     [SolicitudReservaController::class, 'show'])->name('solicitudes.show');

    // Crear solicitud: solo estudiante
    Route::middleware('role:estudiante')->group(function () {
        Route::post('/solicitudes', [SolicitudReservaController::class, 'store'])->name('solicitudes.store');
    });

    // Cambiar estado: estudiante (cancelar) o arrendador (aceptar/rechazar) — la lógica está en el controller
    Route::patch('/solicitudes/{id}', [SolicitudReservaController::class, 'update'])->name('solicitudes.update');
    Route::put('/solicitudes/{id}',   [SolicitudReservaController::class, 'update']);
});

// ─────────────────────────────────────────────
// MENSAJES (Chat en tiempo real - requiere auth:sanctum y verified)
// ─────────────────────────────────────────────
Route::prefix('v1')->middleware(['auth:sanctum', 'verified'])->group(function () {
    // Listado de conversaciones activas
    Route::get('/mensajes/conversaciones',                  [MensajeController::class, 'conversaciones'])->name('mensajes.conversaciones');
    
    // Historial con otro usuario específico
    Route::get('/mensajes/{otro_usuario_id}',               [MensajeController::class, 'chatConUsuario'])->name('mensajes.chat');
    
    // Enviar mensaje
    Route::post('/mensajes',                                [MensajeController::class, 'store'])->name('mensajes.store');

    // Hilo de conversación contextualizado por inmueble
    Route::get('/mensajes/hilo/{idInmueble}/{idUsuario}',  [MensajeController::class, 'hilo'])->name('mensajes.hilo');
});

// ─────────────────────────────────────────────
// VERIFICACIONES (solo administrador)
// ─────────────────────────────────────────────
Route::prefix('v1')->middleware(['auth:sanctum', 'role:administrador'])->group(function () {

    Route::get('/verificaciones',           [VerificacionController::class, 'index'])->name('verificaciones.index');
    Route::post('/verificaciones',          [VerificacionController::class, 'store'])->name('verificaciones.store');
    Route::get('/verificaciones/{id}',      [VerificacionController::class, 'show'])->name('verificaciones.show');
    Route::patch('/verificaciones/{id}',    [VerificacionController::class, 'update'])->name('verificaciones.update');
    Route::put('/verificaciones/{id}',      [VerificacionController::class, 'update']);
});

// ─────────────────────────────────────────────
// ADMIN DASHBOARD (rutas para panel administrativo)
// ─────────────────────────────────────────────
Route::prefix('v1/admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats'])->name('admin.stats');
    Route::get('/usuarios', [AdminController::class, 'usuarios'])->name('admin.usuarios');
    Route::get('/users', [AdminController::class, 'usuarios'])->name('admin.users');
    Route::post('/usuarios', [UserController::class, 'storeAsAdmin'])->name('admin.usuarios.store');
    Route::patch('/usuarios/{id}/estado', [UserController::class, 'toggleStatus'])->name('admin.usuarios.toggleStatus');
    Route::post('/usuarios/{id}/estado', [UserController::class, 'toggleStatus']);
    Route::put('/usuarios/{id}', [UserController::class, 'updateAsAdmin'])->name('admin.usuarios.update');
    Route::patch('/usuarios/{id}', [UserController::class, 'updateAsAdmin']);
    Route::post('/usuarios/{id}', [UserController::class, 'updateAsAdmin']);
    Route::post('/usuarios/{id}/notificar', [NotificationController::class, 'sendToUser'])->name('admin.usuarios.notificar');
    Route::delete('/usuarios/{id}', [UserController::class, 'destroy'])->name('admin.usuarios.destroy');

    // Endpoints KYC para Arrendadores
    Route::get('/arrendadores/pendientes', [AdminController::class, 'getPendingLandlords'])->name('admin.arrendadores.pendientes');
    Route::get('/pending-verifications', [AdminController::class, 'getPendingLandlords'])->name('admin.pending-verifications');
    Route::get('/verificaciones/{id}', [AdminController::class, 'showVerification'])->name('admin.verificaciones.show');
    Route::patch('/arrendadores/{id}/aprobar', [AdminController::class, 'approveLandlord'])->name('admin.arrendadores.aprobar');

    // Auditoría de Mensajes y Conversaciones
    Route::get('/chats', [ChatController::class, 'adminIndex'])->name('admin.chats.index');
    Route::get('/chats/{chat_id}/mensajes', [ChatController::class, 'adminMessages'])->name('admin.chats.messages');

    // Reportes y Analítica
    Route::get('/reportes/estadisticas', [ReportController::class, 'getStats'])->name('admin.reportes.stats');

    Route::get('/inmuebles/pendientes', function () {
        $pendientes = \App\Models\Inmueble::with(['arrendador.perfil', 'ubicacion', 'fotografias'])
            ->whereIn('estado', ['borrador', 'en_revision', 'pendiente'])
            ->orderByDesc('created_at')
            ->get();

        // Si no hay borradores, traer también inmuebles para fines de demo interactiva
        if ($pendientes->isEmpty()) {
            $pendientes = \App\Models\Inmueble::with(['arrendador.perfil', 'ubicacion', 'fotografias'])
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();
        }

        $formatted = $pendientes->map(function ($inm) {
            $foto = $inm->fotografias->first();
            $ub = $inm->ubicacion;
            $arr = $inm->arrendador;

            return [
                'id'          => $inm->id_inmueble,
                'titulo'      => $inm->titulo,
                'precio'      => (float) $inm->precio,
                'tipo'        => $inm->tipo,
                'estado'      => $inm->estado,
                'fecha'       => $inm->created_at ? $inm->created_at->format('d M Y, H:i') : '15 Sep 2026',
                'direccion'   => $ub ? trim(($ub->sector ? $ub->sector . ', ' : '') . ($ub->direccion_referencial ?? 'Manta')) : 'Manta, Manabí',
                'foto_url'    => $foto?->url ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80',
                'arrendador'  => [
                    'id'       => $arr?->id_usuario ?? 0,
                    'nombres'  => $arr?->nombres ?? 'Carlos Mendoza Bravo',
                    'correo'   => $arr?->correo ?? 'arrendador@uleam.edu.ec',
                    'avatar'   => $arr?->perfil?->foto_perfil_url ?? null,
                ],
            ];
        });

        return response()->json([
            'status' => 'success',
            'total'  => $formatted->count(),
            'data'   => $formatted,
        ]);
    })->name('admin.inmuebles.pendientes');

    Route::patch('/inmuebles/{id}/estado', function (\Illuminate\Http\Request $request, $id) {
        $request->validate([
            'estado' => ['required', 'string', 'in:publicado,borrador,rechazado,inactivo,en_revision'],
        ]);

        $inmueble = \App\Models\Inmueble::findOrFail($id);
        $inmueble->estado = $request->input('estado');
        $inmueble->save();

        return response()->json([
            'status'   => 'success',
            'message'  => 'Estado del inmueble actualizado a ' . $inmueble->estado,
            'inmueble' => $inmueble->fresh(['arrendador', 'ubicacion', 'fotografias']),
        ]);
    })->name('admin.inmuebles.estado');
});

// ─────────────────────────────────────────────
// ROLES (público — para formulario de registro)
// ─────────────────────────────────────────────
Route::get('/v1/roles', [RolController::class, 'index'])->name('roles.index');

// ─────────────────────────────────────────────
// PERFIL (usuario autenticado)
// ─────────────────────────────────────────────
// PERFIL (usuario autenticado y verificado)
// ─────────────────────────────────────────────
Route::prefix('v1')->middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/perfil',          [PerfilController::class, 'show'])->name('perfil.show');
    Route::put('/perfil',          [PerfilController::class, 'update'])->name('perfil.update');
    Route::patch('/perfil',        [PerfilController::class, 'update']);
    Route::post('/perfil/foto',    [PerfilController::class, 'uploadFoto'])->name('perfil.foto');
});

// ─────────────────────────────────────────────
// FOTOGRAFÍAS DE INMUEBLES
// ─────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    // Ver fotos: disponible para todos (autenticado o no)
    Route::get('/inmuebles/{idInmueble}/fotografias', [FotografiaController::class, 'index'])->name('fotografias.index');

    // Subir/eliminar fotos: solo arrendador propietario verificado
    Route::middleware(['auth:sanctum', 'verified', 'role:arrendador'])->group(function () {
        Route::post('/inmuebles/{idInmueble}/fotografias',  [FotografiaController::class, 'store'])->name('fotografias.store');
        Route::delete('/fotografias/{id}',                  [FotografiaController::class, 'destroy'])->name('fotografias.destroy');
        Route::patch('/fotografias/{id}/portada',           [FotografiaController::class, 'setPortada'])->name('fotografias.portada');
    });
});

// ─────────────────────────────────────────────
// UBICACIONES DE INMUEBLES
// ─────────────────────────────────────────────
Route::prefix('v1')->group(function () {
    // Ver ubicación: público
    Route::get('/inmuebles/{idInmueble}/ubicacion', [UbicacionController::class, 'show'])->name('ubicacion.show');

    // Crear/actualizar ubicación: solo arrendador propietario verificado
    Route::middleware(['auth:sanctum', 'verified', 'role:arrendador'])->group(function () {
        Route::post('/inmuebles/{idInmueble}/ubicacion',  [UbicacionController::class, 'upsert'])->name('ubicacion.upsert');
        Route::put('/inmuebles/{idInmueble}/ubicacion',   [UbicacionController::class, 'upsert']);
        Route::patch('/inmuebles/{idInmueble}/ubicacion', [UbicacionController::class, 'upsert']);
    });
});

// ─────────────────────────────────────────────
// PANEL DEL ARRENDADOR (Módulo 3 - requiere auth:sanctum y verified)
// ─────────────────────────────────────────────
Route::prefix('v1/arrendador')->middleware(['auth:sanctum', 'verified'])->group(function () {
    // Inmuebles del arrendador autenticado
    Route::get('/inmuebles', [InmuebleController::class, 'misInmuebles'])->name('arrendador.inmuebles');

    // Solicitudes recibidas en los inmuebles del arrendador
    Route::get('/solicitudes', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        $idsMisInmuebles = \App\Models\Inmueble::where('id_arrendador', $user->id_usuario)
            ->pluck('id_inmueble');

        $solicitudes = \App\Models\SolicitudReserva::whereIn('id_inmueble', $idsMisInmuebles)
            ->with([
                'estudiante.perfil',
                'inmueble.fotografias',
                'inmueble.ubicacion',
            ])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $solicitudes,
        ]);
    })->name('arrendador.solicitudes');

    // Cambiar estado de solicitud (aceptada / rechazada)
    Route::patch('/solicitudes/{id}', [SolicitudReservaController::class, 'update'])->name('arrendador.solicitudes.update');
});

// ─────────────────────────────────────────────
// MÓDULO DE ESTUDIANTES (Favoritos & Solicitudes - requiere auth:sanctum y verified)
// ─────────────────────────────────────────────
Route::prefix('v1/estudiante')->middleware(['auth:sanctum', 'verified'])->group(function () {
    Route::get('/favoritos',         [FavoritoController::class, 'index'])->name('estudiante.favoritos.index');
    Route::post('/favoritos/toggle', [FavoritoController::class, 'toggle'])->name('estudiante.favoritos.toggle');
    Route::get('/solicitudes',       [SolicitudReservaController::class, 'misSolicitudes'])->name('estudiante.solicitudes.index');
});

// ─────────────────────────────────────────────
// NOTIFICACIONES (auth:sanctum)
// ─────────────────────────────────────────────
Route::prefix('v1/notificaciones')->middleware('auth:sanctum')->group(function () {
    Route::get('/',              [NotificacionController::class, 'index'])->name('notificaciones.index');
    Route::patch('/',            [NotificacionController::class, 'update'])->name('notificaciones.update');
    Route::patch('/{id}',        [NotificacionController::class, 'update'])->name('notificaciones.update.one');
    Route::patch('/leer-todas',  [NotificacionController::class, 'update'])->name('notificaciones.readall');
});

Route::prefix('admin')->group(function () {
    Route::post('/usuarios', [UserController::class, 'storeAsAdmin']);
    Route::delete('/usuarios/{id}', [UserController::class, 'destroy']);
    Route::get('/chats', [ChatController::class, 'adminIndex']);
    Route::get('/chats/{chat_id}/mensajes', [ChatController::class, 'adminMessages']);
    Route::post('/usuarios/{id}/notificar', [NotificationController::class, 'sendToUser']);
    Route::get('/reportes/estadisticas', [ReportController::class, 'getStats']);
    Route::get('/verificaciones/{id}', [AdminController::class, 'showVerification']);
});

Route::post('/admin/usuarios', [UserController::class, 'storeAsAdmin']);
Route::delete('/admin/usuarios/{id}', [UserController::class, 'destroy']);
Route::get('/admin/verificaciones/{id}', [AdminController::class, 'showVerification']);

// Endpoint móvil para listar notificaciones del usuario
Route::get('/v1/mis-notificaciones', [NotificationController::class, 'misNotificaciones'])->name('v1.mis-notificaciones');
Route::get('/mis-notificaciones', [NotificationController::class, 'misNotificaciones'])->name('mis-notificaciones');

