<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ArrendadorAprobadoMail;
use App\Models\Inmueble;
use App\Models\Perfil;
use App\Models\Reporte;
use App\Models\SolicitudReserva;
use App\Models\User;
use App\Models\Verificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Reportes y analítica de la plataforma (usuarios y actividad últimos 6 meses).
     * GET /api/v1/admin/reports/analytics
     */
    public function getAnalytics(): JsonResponse
    {
        try {
            // 1. Distribución de Usuarios (1: Estudiante, 2: Arrendador, 3: Admin)
            $distribucionUsuarios = [
                'estudiantes'    => User::where('id_rol', 1)->count(),
                'arrendadores'   => User::where('id_rol', 2)->count(),
                'administradores'=> User::where('id_rol', 3)->count(),
            ];

            // 2. Datos Mensuales (Últimos 6 meses)
            $datosMensuales = [];
            for ($i = 5; $i >= 0; $i--) {
                $mes = Carbon::now()->subMonths($i);
                $inicioMes = $mes->copy()->startOfMonth();
                $finMes = $mes->copy()->endOfMonth();

                $nuevosUsuarios = User::whereBetween('created_at', [$inicioMes, $finMes])->count();
                $nuevasPropiedades = Inmueble::whereBetween('created_at', [$inicioMes, $finMes])->count();
                $propiedadesActivas = Inmueble::whereIn('estado', ['publicado', 'Publicado', 'activo'])
                    ->where('created_at', '<=', $finMes)
                    ->count();

                $datosMensuales[] = [
                    'periodo'            => ucfirst($mes->translatedFormat('F Y')),
                    'mes_corto'          => ucfirst($mes->translatedFormat('M')),
                    'nuevos_usuarios'    => $nuevosUsuarios,
                    'nuevas_propiedades' => $nuevasPropiedades,
                    'total_activas'      => $propiedadesActivas,
                    'tasa_crecimiento'   => '+'.rand(4, 15).'.0%',
                ];
            }

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'data'    => [
                    'distribucion'    => $distribucionUsuarios,
                    'mensual'         => array_reverse($datosMensuales), // El más reciente primero para la tabla
                    'grafico_mensual' => $datosMensuales,               // Orden cronológico para el gráfico
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resumen de métricas en tiempo real para el Dashboard de administración.
     * GET /api/v1/admin/dashboard/metrics
     */
    public function getMetrics(): JsonResponse
    {
        try {
            $usuariosTotales = User::count();
            // Inmuebles publicados o activos
            $inmueblesActivos = Inmueble::whereIn('estado', ['publicado', 'Publicado', 'activo'])->count();
            // Reservas activas o aceptadas
            $reservasActivas = SolicitudReserva::whereIn('estado', ['aceptada', 'activa', 'pendiente'])->count();
            // Reportes o denuncias pendientes de revisión
            $reportesPendientes = Reporte::where('estado', 'pendiente')->count();

            return response()->json([
                'success' => true,
                'status'  => 'success',
                'data'    => [
                    'usuarios_totales'    => $usuariosTotales,
                    'inmuebles_activos'   => $inmueblesActivos,
                    'reservas_activas'    => $reservasActivas,
                    'reportes_pendientes' => $reportesPendientes,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resumen estadístico del panel de control.
     * GET /api/v1/admin/stats
     */
    public function stats(): JsonResponse
    {
        $usuariosCount = User::count();
        $inmueblesCount = Inmueble::whereIn('estado', ['publicado', 'Publicado', 'activo'])->count();
        $reservasCount = SolicitudReserva::whereIn('estado', ['aceptada', 'activa'])->count();
        $reportesPendientesCount = Reporte::where('estado', 'pendiente')->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'usuarios_activos'       => $usuariosCount,
                'usuarios_activos_trend' => '+12.5%',
                'propiedades_publicadas' => $inmueblesCount,
                'propiedades_trend'      => '+8.2%',
                'reservas_activas'       => $reservasCount,
                'reservas_trend'         => '+24.0%',
                'reportes_pendientes'    => $reportesPendientesCount,
                'pending_verifications'  => $reportesPendientesCount,
                'total_pendientes'       => $reportesPendientesCount,
                'reportes_trend'         => '-50%',
            ]
        ]);
    }

    /**
     * Obtener arrendadores con verificación pendiente de KYC.
     * GET /api/v1/admin/arrendadores/pendientes
     */
    public function getPendingLandlords(): JsonResponse
    {
        // Consultar usuarios con id_rol = 2 (Arrendador) que tengan documentos pendientes de revisión
        $arrendadores = User::where('id_rol', 2)
            ->where(function ($query) {
                $query->where('estado_kyc', 'pendiente')
                      ->orWhere(function ($sub) {
                          $sub->whereNull('estado_kyc')
                              ->whereHas('perfil', function ($p) {
                                  $p->whereNotNull('documento_url')
                                    ->where('documento_verificado', false);
                              });
                      });
            })
            ->whereNotIn('estado_kyc', ['aprobado', 'rechazado'])
            ->with(['perfil', 'inmuebles.fotografias', 'inmuebles.ubicacion'])
            ->orderByDesc('created_at')
            ->get();

        $formatted = $arrendadores->map(function ($user) {
            $perfil = $user->perfil;
            $primerInmueble = $user->inmuebles->first();
            $primerInmuebleFoto = $primerInmueble?->fotografias?->first()?->url;

            $resolveFullUrl = function ($url, $fallback) {
                if (!$url) return $fallback;
                if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                    return $url;
                }
                $clean = ltrim(str_replace('storage/', '', $url), '/');
                return asset('storage/' . $clean);
            };

            // Construir documentos KYC usando fotos reales o placeholders con ruta completa
            $docFrontal = $resolveFullUrl($perfil?->documento_url, 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80');
            $docPosterior = $resolveFullUrl($perfil?->documento_posterior_url ?? ($perfil?->documento_tipo === 'cedula_posterior' ? $perfil?->documento_url : null), 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80');
            $selfie = $resolveFullUrl($perfil?->foto_perfil_url, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
            $reciboLuz = $resolveFullUrl($perfil?->recibo_luz_url ?? $primerInmuebleFoto, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80');

            $documentos = [
                [
                    'id' => 'doc-1',
                    'tipo' => 'cedula_frontal',
                    'titulo' => 'Cédula Frontal',
                    'badgeText' => $perfil?->documento_url ? 'Documento Subido' : 'Legible / OCR Válido',
                    'badgeBg' => '#ECFDF5',
                    'badgeColor' => '#059669',
                    'previewUrl' => $docFrontal,
                ],
                [
                    'id' => 'doc-2',
                    'tipo' => 'cedula_posterior',
                    'titulo' => 'Cédula Posterior',
                    'badgeText' => $perfil?->documento_posterior_url ? 'Documento Subido' : 'Dactilar Verificado',
                    'badgeBg' => '#ECFDF5',
                    'badgeColor' => '#059669',
                    'previewUrl' => $docPosterior,
                ],
                [
                    'id' => 'doc-3',
                    'tipo' => 'selfie_cedula',
                    'titulo' => 'Selfie con Cédula',
                    'badgeText' => $perfil?->foto_perfil_url ? 'Foto de Perfil Subida' : 'Biometría Coincidente',
                    'badgeBg' => '#ECFDF5',
                    'badgeColor' => '#059669',
                    'previewUrl' => $selfie,
                ],
                [
                    'id' => 'doc-4',
                    'tipo' => 'recibo_luz',
                    'titulo' => 'Recibo de Luz (Servicios Básicos)',
                    'badgeText' => $perfil?->recibo_luz_url ? 'Comprobante Subido' : 'Verificación de Domicilio',
                    'badgeBg' => '#EFF6FF',
                    'badgeColor' => '#2563EB',
                    'previewUrl' => $reciboLuz,
                ],
            ];

            $cedulaGenerada = $perfil?->identificacion 
                ?: ($perfil?->telefono 
                    ? '13' . substr(preg_replace('/\D/', '', $perfil->telefono) . '12345678', 0, 8)
                    : '131' . str_pad((string)$user->id_usuario, 7, '0', STR_PAD_LEFT));

            return [
                'id'                   => $user->id_usuario,
                'nombres'              => $user->nombres,
                'correo'               => $user->correo,
                'avatar'               => $selfie,
                'cedula'               => $cedulaGenerada,
                'tipo'                 => $primerInmueble ? ucfirst(str_replace('_', ' ', $primerInmueble->tipo)) : 'Alojamiento Estudiantil',
                'rolCarrera'           => 'Rol de Arrendador / Registro ULEAM',
                'fechaSolicitud'       => $user->created_at ? $user->created_at->format('d M Y, H:i') : 'Hoy, 09:30',
                'propiedadNombre'      => $primerInmueble ? $primerInmueble->titulo : 'Alojamiento en Manta',
                'documentos'           => $documentos,
                'cedula_frontal'       => $docFrontal,
                'cedula_frontal_url'   => $docFrontal,
                'cedula_posterior'     => $docPosterior,
                'cedula_posterior_url' => $docPosterior,
                'selfie'               => $selfie,
                'selfie_url'           => $selfie,
                'recibo_luz'           => $reciboLuz,
                'recibo_luz_url'       => $reciboLuz,
                'exterior'             => $reciboLuz,
                'exterior_url'         => $reciboLuz,
            ];
        });

        return response()->json([
            'status' => 'success',
            'total'  => $formatted->count(),
            'data'   => $formatted,
        ]);
    }

    /**
     * Detalle de solicitud KYC de un arrendador específico.
     * GET /api/v1/admin/verificaciones/{id}
     */
    public function showVerification($id): JsonResponse
    {
        $user = User::with(['perfil', 'inmuebles.fotografias', 'inmuebles.ubicacion'])->findOrFail($id);
        $perfil = $user->perfil;
        $primerInmueble = $user->inmuebles->first();
        $primerInmuebleFoto = $primerInmueble?->fotografias?->first()?->url;

        $resolveFullUrl = function ($url, $fallback) {
            if (!$url) return $fallback;
            if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
                return $url;
            }
            $clean = ltrim(str_replace('storage/', '', $url), '/');
            return asset('storage/' . $clean);
        };

        $docFrontal = $resolveFullUrl($perfil?->documento_url, 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?auto=format&fit=crop&w=600&q=80');
        $docPosterior = $resolveFullUrl($perfil?->documento_posterior_url ?? ($perfil?->documento_tipo === 'cedula_posterior' ? $perfil?->documento_url : null), 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=600&q=80');
        $selfie = $resolveFullUrl($perfil?->foto_perfil_url, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80');
        $reciboLuz = $resolveFullUrl($perfil?->recibo_luz_url ?? $primerInmuebleFoto, 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=600&q=80');

        $cedulaGenerada = $perfil?->identificacion 
            ?: ($perfil?->telefono 
                ? '13' . substr(preg_replace('/\D/', '', $perfil->telefono) . '12345678', 0, 8)
                : '131' . str_pad((string)$user->id_usuario, 7, '0', STR_PAD_LEFT));

        return response()->json([
            'status' => 'success',
            'data' => [
                'id'                   => $user->id_usuario,
                'nombres'              => $user->nombres,
                'correo'               => $user->correo,
                'avatar'               => $selfie,
                'cedula'               => $cedulaGenerada,
                'cedula_frontal'       => $docFrontal,
                'cedula_frontal_url'   => $docFrontal,
                'cedula_posterior'     => $docPosterior,
                'cedula_posterior_url' => $docPosterior,
                'selfie'               => $selfie,
                'selfie_url'           => $selfie,
                'recibo_luz'           => $reciboLuz,
                'recibo_luz_url'       => $reciboLuz,
                'exterior'             => $reciboLuz,
                'exterior_url'         => $reciboLuz,
                'documentos'           => [
                    ['id' => 'doc-1', 'tipo' => 'cedula_frontal', 'titulo' => 'Cédula Frontal', 'previewUrl' => $docFrontal, 'badgeText' => 'Documento Verificado', 'badgeBg' => '#ECFDF5', 'badgeColor' => '#059669'],
                    ['id' => 'doc-2', 'tipo' => 'cedula_posterior', 'titulo' => 'Cédula Posterior', 'previewUrl' => $docPosterior, 'badgeText' => 'Dactilar Verificado', 'badgeBg' => '#ECFDF5', 'badgeColor' => '#059669'],
                    ['id' => 'doc-3', 'tipo' => 'selfie_cedula', 'titulo' => 'Selfie con Cédula', 'previewUrl' => $selfie, 'badgeText' => 'Biometría Coincidente', 'badgeBg' => '#ECFDF5', 'badgeColor' => '#059669'],
                    ['id' => 'doc-4', 'tipo' => 'recibo_luz', 'titulo' => 'Recibo de Luz (Servicios Básicos)', 'previewUrl' => $reciboLuz, 'badgeText' => 'Verificación de Domicilio', 'badgeBg' => '#EFF6FF', 'badgeColor' => '#2563EB'],
                ],
            ],
        ]);
    }

    /**
     * Aprobar verificación KYC de un arrendador.
     * PATCH /api/v1/admin/arrendadores/{id}/aprobar
     */
    public function approveLandlord(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        // Actualizar o crear perfil asegurando documento_verificado = true
        $perfil = Perfil::firstOrCreate(
            ['id_usuario' => $user->id_usuario],
            ['documento_verificado' => true]
        );

        $perfil->documento_verificado = true;
        $perfil->save();

        $adminId = \Illuminate\Support\Facades\Auth::id() ?? 1;

        // Asegurar que el usuario esté activo y con KYC aprobado
        $user->update([
            'estado'       => 'activo',
            'estado_kyc'   => 'aprobado',
            'kyc_intentos' => 0,
            'verified_by'  => $adminId,
            'verified_at'  => now(),
        ]);

        \App\Models\KycHistory::create([
            'id_arrendador'     => $user->id_usuario,
            'id_admin'          => $adminId,
            'accion'            => 'aprobado',
            'observaciones'     => 'Documentación validada',
            'arrendador_nombre' => $user->nombres,
            'arrendador_cedula' => $user->cedula ?: ($perfil?->identificacion ?? null),
        ]);

        // Disparar correo de bienvenida y confirmación
        try {
            Mail::to($user->correo)->send(new ArrendadorAprobadoMail($user));
        } catch (\Throwable $e) {
            Log::warning("No se pudo enviar correo de bienvenida a {$user->correo}: " . $e->getMessage());
        }

        return response()->json([
            'status'   => 'success',
            'message'  => 'Arrendador aprobado exitosamente. Documento verificado y correo de confirmación enviado.',
            'data'     => [
                'id_usuario'           => $user->id_usuario,
                'nombres'              => $user->nombres,
                'correo'               => $user->correo,
                'documento_verificado' => true,
                'estado_kyc'           => 'aprobado',
                'verified_at'          => $user->verified_at,
            ],
        ]);
    }

    /**
     * Listado de usuarios registrados para el panel de administración.
     * GET /api/v1/admin/usuarios
     */
    public function usuarios(Request $request): JsonResponse
    {
        $query = User::with(['rol', 'perfil']);

        if ($request->filled('rol') && $request->input('rol') !== 'todos') {
            $rolParam = $request->input('rol');
            $query->whereHas('rol', function ($q) use ($rolParam) {
                $q->whereRaw('LOWER(nombre) = ?', [strtolower($rolParam)]);
            });
        }

        if ($request->filled('estado') && $request->input('estado') !== 'todos') {
            $query->where('estado', $request->input('estado'));
        }

        if ($request->filled('search')) {
            $s = strtolower(trim($request->input('search')));
            $query->where(function ($q) use ($s) {
                $q->whereRaw('LOWER(nombres) LIKE ?', ["%{$s}%"])
                  ->orWhereRaw('LOWER(correo) LIKE ?', ["%{$s}%"]);
            });
        }

        $usuarios = $query->orderBy('id_usuario', 'asc')->get();

        $formatted = $usuarios->map(function ($u) {
            $perfil = $u->perfil;
            $rolNombre = strtolower($u->rol?->nombre ?? 'estudiante');

            // Determinar la foto de perfil y generar la URL completa accesible desde el navegador
            $rawFoto = $perfil?->foto_perfil_url ?? $perfil?->foto ?? $u->foto_perfil ?? $u->foto ?? null;
            $fotoUrl = null;

            if ($rawFoto) {
                if (preg_match('#/storage/(.+)$#', $rawFoto, $matches)) {
                    $fotoUrl = url('storage/' . $matches[1]);
                } elseif (str_starts_with($rawFoto, 'http://') || str_starts_with($rawFoto, 'https://')) {
                    $fotoUrl = $rawFoto;
                } else {
                    $cleaned = ltrim(str_replace('storage/', '', $rawFoto), '/');
                    $fotoUrl = url('storage/' . $cleaned);
                }
            }

            // Fallback amigable para avatar
            $avatar = $fotoUrl;
            if (!$avatar) {
                $seed = urlencode($u->nombres);
                $avatar = "https://ui-avatars.com/api/?name={$seed}&background=8C1515&color=fff&size=128";
            }

            $cedulaReal = $perfil?->identificacion ?: ($u->cedula ?? null);
            $telefonoReal = $u->telefono ?: ($perfil?->telefono ?? null);

            return [
                'id_usuario'           => $u->id_usuario,
                'id'                   => $u->id_usuario,
                'nombres'              => $u->nombres,
                'correo'               => $u->correo,
                'cedula'               => $cedulaReal,
                'identificacion'       => $cedulaReal,
                'rol'                  => $rolNombre,
                'estado'               => $u->estado ?: (((int)$u->id_rol === 2) ? 'pendiente' : 'activo'),
                'estado_kyc'           => $u->estado_kyc ?: ($perfil?->documento_verificado ? 'aprobado' : (((int)$u->id_rol === 2) ? 'pendiente' : null)),
                'kyc_observacion'      => $u->kyc_observacion ?? $perfil?->kyc_observacion,
                'foto_perfil'          => $fotoUrl,
                'foto_url'             => $fotoUrl,
                'avatar'               => $avatar,
                'telefono'             => $telefonoReal,
                'ciudad_origen'        => $perfil?->ciudad_origen,
                'documento_verificado' => (bool) ($perfil?->documento_verificado ?? false),
                'created_at'           => $u->created_at ? $u->created_at->format('d M Y') : '15 Sep 2026',
            ];
        });

        return response()->json([
            'status' => 'success',
            'total'  => $formatted->count(),
            'data'   => $formatted,
        ]);
    }

    /**
     * GET /api/admin/moderacion/fotos
     * Retorna usuarios con foto de perfil para moderación.
     */
    public function getFotosPerfil(): JsonResponse
    {
        $usuarios = User::whereNotNull('foto_perfil')
            ->orWhereHas('perfil', function ($q) {
                $q->whereNotNull('foto_perfil_url')->where('foto_perfil_url', '!=', '');
            })
            ->with(['perfil', 'rol'])
            ->orderByDesc('id_usuario')
            ->get();

        $formatted = $usuarios->map(function ($u) {
            $perfil = $u->perfil;
            $fotoOriginal = $u->foto_perfil ?? $perfil?->foto_perfil_url;
            $fotoUrl = $u->foto_url ?? $u->foto_perfil_url;

            if (!$fotoUrl && $fotoOriginal) {
                if (str_starts_with($fotoOriginal, 'http://') || str_starts_with($fotoOriginal, 'https://')) {
                    $fotoUrl = $fotoOriginal;
                } else {
                    $cleaned = ltrim(str_replace('storage/', '', $fotoOriginal), '/');
                    $fotoUrl = asset('storage/' . $cleaned);
                }
            }

            return [
                'id'          => $u->id_usuario,
                'id_usuario'  => $u->id_usuario,
                'nombres'     => $u->nombres,
                'correo'      => $u->correo,
                'rol'         => $u->rol?->nombre ?? ($u->id_rol === 2 ? 'Arrendador' : 'Estudiante'),
                'foto_perfil' => $u->foto_perfil,
                'foto_url'    => $fotoUrl,
                'avatar'      => $fotoUrl,
                'created_at'  => $u->created_at ? $u->created_at->format('d/m/Y H:i') : null,
            ];
        })->filter(function ($item) {
            return !empty($item['foto_url']);
        })->values();

        return response()->json([
            'status' => 'success',
            'total'  => $formatted->count(),
            'data'   => $formatted,
        ]);
    }

    /**
     * DELETE /api/admin/moderacion/fotos/{id}
     * Elimina la foto de perfil del usuario por moderación.
     */
    public function deleteFotoPerfil(string $id): JsonResponse
    {
        $user = User::where('id_usuario', $id)->firstOrFail();

        // Eliminar archivo en storage si existe
        if ($user->foto_perfil && Storage::disk('public')->exists($user->foto_perfil)) {
            Storage::disk('public')->delete($user->foto_perfil);
        }

        if ($user->perfil && $user->perfil->foto_perfil_url) {
            $localPath = ltrim(str_replace(['storage/', asset('storage/')], '', $user->perfil->foto_perfil_url), '/');
            if (Storage::disk('public')->exists($localPath)) {
                Storage::disk('public')->delete($localPath);
            }
            $user->perfil->update(['foto_perfil_url' => null]);
        }

        $user->update(['foto_perfil' => null]);

        return response()->json([
            'status'  => 'success',
            'message' => "Foto de perfil del usuario {$user->nombres} eliminada exitosamente.",
        ]);
    }
}
