<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fotografia;
use App\Models\Inmueble;
use App\Models\Ubicacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InmuebleController extends Controller
{
    /**
     * GET /api/v1/inmuebles
     * Lista inmuebles publicados (público) o todos los propios (arrendador).
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Arrendador: ve solo sus inmuebles (todos los estados)
        if ($user && $user->esArrendador()) {
            $inmuebles = Inmueble::where('id_arrendador', auth()->id() ?? $user->id_usuario)
                ->with(['ubicacion', 'fotografias'])
                ->paginate(15);

            return response()->json($inmuebles);
        }

        // Estudiante / público: solo inmuebles disponibles (publicados y no ocupados)
        $inmuebles = Inmueble::whereIn('estado', ['disponible', 'publicado'])
            ->with(['ubicacion', 'fotografias'])
            ->paginate(15);

        return response()->json($inmuebles);
    }

    /**
     * GET /api/v1/inmuebles/mapa
     * Respuesta optimizada para el mapa móvil.
     * Devuelve solo los campos necesarios para pintar marcadores y la tarjeta de previsualización.
     */
    public function mapa(Request $request)
    {
        $inmuebles = Inmueble::whereIn('estado', ['disponible', 'publicado'])
            ->with([
                'ubicacion:id_inmueble,latitud,longitud,direccion_referencial,sector,distancia_uleam_km',
                'fotografias' => fn ($q) => $q->where('es_portada', true)->orderBy('orden')->limit(1),
            ])
            ->get(['id_inmueble', 'titulo', 'precio', 'tipo', 'calificacion_promedio', 'capacidad']);

        $pins = $inmuebles
            ->filter(fn ($i) => $i->ubicacion !== null)
            ->map(function ($i) {
                $ub   = $i->ubicacion;
                $foto = $i->fotografias->first();

                // Distancia formateada
                $dist = $ub->distancia_uleam_km !== null
                    ? ($ub->distancia_uleam_km < 1
                        ? round($ub->distancia_uleam_km * 1000) . 'm de ULEAM'
                        : number_format($ub->distancia_uleam_km, 1) . 'km de ULEAM')
                    : 'Cerca de ULEAM';

                return [
                    'id'             => $i->id_inmueble,
                    'titulo'         => $i->titulo,
                    'precio'         => '$' . number_format((float) $i->precio, 2, '.', ','),
                    'precio_mensual' => (float) $i->precio,
                    'precio_numero'  => (float) $i->precio,
                    'tipo'           => ucfirst(str_replace('_', ' ', $i->tipo)),
                    'tipo_raw'      => $i->tipo,
                    'capacidad'     => (int) ($i->capacidad ?? 1),
                    'calificacion'  => $i->calificacion_promedio ?? 4.5,
                    'latitud'       => (float) $ub->latitud,
                    'longitud'      => (float) $ub->longitud,
                    'distancia'     => $dist,
                    'direccion'     => trim(($ub->sector ? $ub->sector . ', ' : '') . ($ub->direccion_referencial ?? '')),
                    'portada_url'   => $foto?->url ?? null,  // columna real: 'url'
                ];
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'total'  => $pins->count(),
            'data'   => $pins,
        ]);
    }

    /**
     * POST /api/v1/inmuebles
     * Crear inmueble con ubicación y fotografías. Solo arrendador.
     */
    public function store(Request $request)
    {
        if (auth()->user()?->estado !== 'activo') {
            return response()->json([
                'status'  => 'error',
                'message' => 'Tu cuenta aún está en revisión por el administrador.',
            ], 403);
        }

        $request->validate([
            'titulo'                => ['required', 'string', 'max:150'],
            'descripcion'           => ['nullable', 'string'],
            'normas'                => ['nullable', 'string'],
            'precio'                => ['required', 'numeric', 'min:0'],
            'tipo'                  => ['nullable', 'string', 'in:cuarto,mini_departamento,departamento_compartido,suite'],
            'capacidad'             => ['nullable', 'integer', 'min:1', 'max:255'],
            'servicios_incluidos'   => ['nullable'],
            'latitud'               => ['nullable', 'numeric'],
            'longitud'              => ['nullable', 'numeric'],
            'sector'                => ['nullable', 'string', 'max:100'],
            'direccion_referencial' => ['nullable', 'string', 'max:255'],
            'fotos'                 => ['nullable'],
        ]);

        return DB::transaction(function () use ($request) {
            $servicios = filter_var($request->input('servicios_incluidos', false), FILTER_VALIDATE_BOOLEAN);
            $tipo = $request->input('tipo', 'mini_departamento');

            $inmueble = Inmueble::create([
                'id_arrendador'         => $request->user()->id_usuario,
                'titulo'                => $request->input('titulo'),
                'descripcion'           => $request->input('descripcion'),
                'normas'                => $request->input('normas'),
                'precio'                => $request->input('precio'),
                'tipo'                  => $tipo,
                'capacidad'             => $request->input('capacidad', 1),
                'servicios_incluidos'   => $servicios,
                'calificacion_promedio' => 5.0,
                'estado'                => $request->input('estado', 'borrador'),
            ]);

            // Guardar ubicación si viene latitud y longitud
            if ($request->filled('latitud') && $request->filled('longitud')) {
                $lat = (float) $request->input('latitud');
                $lon = (float) $request->input('longitud');

                // Distancia aproximada a la ULEAM (-0.9555, -80.7380)
                $latDiff = ($lat - (-0.9555)) * 111.0;
                $lonDiff = ($lon - (-80.7380)) * 90.0;
                $distKm  = round(sqrt(pow($latDiff, 2) + pow($lonDiff, 2)), 2);

                Ubicacion::create([
                    'id_inmueble'           => $inmueble->id_inmueble,
                    'latitud'               => $lat,
                    'longitud'              => $lon,
                    'sector'                => $request->input('sector', 'Sector ULEAM'),
                    'direccion_referencial' => $request->input('direccion_referencial', 'Cerca del campus universitario'),
                    'distancia_uleam_km'    => $distKm,
                ]);
            }

            // Guardar imágenes en storage/app/public/inmuebles
            if ($request->hasFile('fotos')) {
                $files = $request->file('fotos');
                if (!is_array($files)) {
                    $files = [$files];
                }

                foreach ($files as $index => $file) {
                    if ($file && $file->isValid()) {
                        $path = $file->store('inmuebles', 'public');
                        $url  = asset("storage/{$path}");

                        Fotografia::create([
                            'id_inmueble' => $inmueble->id_inmueble,
                            'url'         => $url,
                            'orden'       => $index + 1,
                            'es_portada'  => ($index === 0),
                        ]);
                    }
                }
            } elseif ($request->has('fotos') && is_array($request->input('fotos'))) {
                // URLs directas de respaldo si no son archivos subidos
                foreach ($request->input('fotos') as $index => $fotoUrl) {
                    if (is_string($fotoUrl) && filter_var($fotoUrl, FILTER_VALIDATE_URL)) {
                        Fotografia::create([
                            'id_inmueble' => $inmueble->id_inmueble,
                            'url'         => $fotoUrl,
                            'orden'       => $index + 1,
                            'es_portada'  => ($index === 0),
                        ]);
                    }
                }
            }

            // Sincronizar servicios si vienen en la creación
            if ($request->has('servicios')) {
                $serviciosInput = $request->input('servicios');
                if (is_string($serviciosInput)) {
                    $decoded = json_decode($serviciosInput, true);
                    $serviciosInput = is_array($decoded) ? $decoded : explode(',', $serviciosInput);
                }
                if (is_array($serviciosInput)) {
                    $servicioIds = [];
                    foreach ($serviciosInput as $s) {
                        if (is_numeric($s)) {
                            $servicioIds[] = (int) $s;
                        } elseif (is_string($s) && trim($s) !== '') {
                            $clean = trim($s);
                            $found = \App\Models\Servicio::where('clave', $clean)->orWhere('nombre', $clean)->first();
                            if ($found) {
                                $servicioIds[] = $found->id_servicio;
                            }
                        }
                    }
                    $inmueble->servicios()->sync($servicioIds);
                }
            }

            return response()->json([
                'message'  => 'Inmueble creado exitosamente.',
                'inmueble' => $inmueble->fresh(['ubicacion', 'fotografias', 'servicios']),
            ], 201);
        });
    }

    /**
     * GET /api/v1/inmuebles/{id}
     * Ver detalle de un inmueble.
     */
    public function show(string $id)
    {
        $inmueble = Inmueble::with([
            'arrendador.perfil',
            'fotografias' => fn ($q) => $q->orderBy('orden'),
            'ubicacion',
            'servicios',
        ])->findOrFail($id);

        // Solo mostrar inmuebles no publicados al propio arrendador o administrador
        if ($inmueble->estado !== 'publicado') {
            $user = request()->user() ?? auth('sanctum')->user();
            if (! $user || ($user->id_usuario !== $inmueble->id_arrendador && ! $user->esAdministrador())) {
                return response()->json(['message' => 'Inmueble no disponible.'], 404);
            }
        }

        return response()->json($inmueble);
    }

    /**
     * GET /api/v1/arrendador/inmuebles
     * Lista solo las propiedades del arrendador autenticado.
     */
    public function misInmuebles(Request $request)
    {
        $inmuebles = Inmueble::where('id_arrendador', auth()->id() ?? $request->user()?->id_usuario)
            ->with(['ubicacion', 'fotografias', 'servicios'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $inmuebles,
        ]);
    }

    /**
     * PUT /api/v1/inmuebles/{id}
     * Actualizar inmueble. Solo el arrendador propietario.
     */
    public function update(Request $request, string $id)
    {
        $inmueble = Inmueble::findOrFail($id);

        if ($inmueble->id_arrendador !== auth()->id() && (int) $inmueble->id_arrendador !== (int) auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'titulo'               => ['sometimes', 'string', 'max:150'],
            'descripcion'          => ['nullable', 'string'],
            'normas'               => ['nullable', 'string'],
            'precio'               => ['sometimes', 'numeric', 'min:0'],
            'tipo'                 => ['sometimes', 'in:cuarto,mini_departamento,departamento_compartido,suite'],
            'estado'               => ['sometimes', 'in:borrador,publicado,inactivo'],
            'capacidad'            => ['nullable', 'integer', 'min:1', 'max:255'],
            'servicios_incluidos'  => ['boolean'],
        ]);

        $inmueble->update($data);

        // Sincronizar relación de servicios si vienen en el request
        if ($request->has('servicios')) {
            $serviciosInput = $request->input('servicios');
            if (is_string($serviciosInput)) {
                $decoded = json_decode($serviciosInput, true);
                $serviciosInput = is_array($decoded) ? $decoded : explode(',', $serviciosInput);
            }
            if (is_array($serviciosInput)) {
                $servicioIds = [];
                foreach ($serviciosInput as $s) {
                    if (is_numeric($s)) {
                        $servicioIds[] = (int) $s;
                    } elseif (is_string($s) && trim($s) !== '') {
                        $clean = trim($s);
                        $found = \App\Models\Servicio::where('clave', $clean)->orWhere('nombre', $clean)->first();
                        if ($found) {
                            $servicioIds[] = $found->id_servicio;
                        }
                    }
                }
                $inmueble->servicios()->sync($servicioIds);
                $inmueble->update(['servicios_incluidos' => count($servicioIds) > 0]);
            }
        }

        // Si se enviaron nuevas fotos
        if ($request->hasFile('fotos')) {
            $files = $request->file('fotos');
            if (!is_array($files)) {
                $files = [$files];
            }
            foreach ($files as $index => $file) {
                if ($file && $file->isValid()) {
                    $path = $file->store('inmuebles', 'public');
                    $url  = asset("storage/{$path}");

                    Fotografia::create([
                        'id_inmueble' => $inmueble->id_inmueble,
                        'url'         => $url,
                        'orden'       => $index + 1,
                        'es_portada'  => ($index === 0),
                    ]);
                }
            }
        }

        // Si se envió ubicación al editar
        if ($request->filled('latitud') && $request->filled('longitud')) {
            Ubicacion::updateOrCreate(
                ['id_inmueble' => $inmueble->id_inmueble],
                [
                    'latitud'               => $request->input('latitud'),
                    'longitud'              => $request->input('longitud'),
                    'sector'                => $request->input('sector', 'Barbasquillo / ULEAM'),
                    'direccion_referencial' => $request->input('direccion_referencial', 'Cerca de ULEAM'),
                ]
            );
        }

        return response()->json([
            'message'  => 'Inmueble actualizado.',
            'inmueble' => $inmueble->fresh(['ubicacion', 'fotografias', 'servicios']),
        ]);
    }

    /**
     * DELETE /api/v1/inmuebles/{id}
     * Eliminar inmueble. Solo el arrendador propietario.
     */
    public function destroy(Request $request, string $id)
    {
        $inmueble = Inmueble::findOrFail($id);

        if ($inmueble->id_arrendador !== auth()->id() && (int) $inmueble->id_arrendador !== (int) auth()->id()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $inmueble->delete();

        return response()->json(['message' => 'Inmueble eliminado.'], 200);
    }

    /**
     * PATCH /api/v1/inmuebles/{id}/estado
     * Alternar el estado de un inmueble (ej. 'disponible' vs 'ocupada'). Solo el propietario.
     */
    public function toggleStatus(Request $request, string $id)
    {
        $inmueble = Inmueble::findOrFail($id);

        $authUserId = auth()->id() ?? $request->user()?->id_usuario;
        if ((int) $inmueble->id_arrendador !== (int) $authUserId) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $request->validate([
            'estado' => ['required', 'string', 'in:disponible,ocupada,ocupado,publicado,inactivo,borrador'],
        ]);

        $nuevoEstado = $request->input('estado');
        $inmueble->estado = $nuevoEstado;
        $inmueble->save();

        return response()->json([
            'status'   => 'success',
            'message'  => 'Estado del inmueble actualizado correctamente.',
            'estado'   => $inmueble->estado,
            'inmueble' => $inmueble->fresh(['ubicacion', 'fotografias', 'servicios']),
        ]);
    }
}
