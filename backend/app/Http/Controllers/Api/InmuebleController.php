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
            $inmuebles = Inmueble::where('id_arrendador', $user->id_usuario)
                ->with(['ubicacion', 'fotografias'])
                ->paginate(15);

            return response()->json($inmuebles);
        }

        // Estudiante / público: solo inmuebles publicados
        $inmuebles = Inmueble::where('estado', 'publicado')
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
        $inmuebles = Inmueble::where('estado', 'publicado')
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
                    'id'            => $i->id_inmueble,
                    'titulo'        => $i->titulo,
                    'precio'        => '$' . number_format($i->precio, 0),
                    'precio_numero' => (float) $i->precio,
                    'tipo'          => ucfirst(str_replace('_', ' ', $i->tipo)),
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
        $request->validate([
            'titulo'                => ['required', 'string', 'max:150'],
            'descripcion'           => ['nullable', 'string'],
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

            return response()->json([
                'message'  => 'Inmueble creado exitosamente.',
                'inmueble' => $inmueble->fresh(['ubicacion', 'fotografias']),
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
     * PUT /api/v1/inmuebles/{id}
     * Actualizar inmueble. Solo el arrendador propietario.
     */
    public function update(Request $request, string $id)
    {
        $inmueble = Inmueble::where('id_arrendador', $request->user()->id_usuario)
            ->findOrFail($id);

        $data = $request->validate([
            'titulo'               => ['sometimes', 'string', 'max:150'],
            'descripcion'          => ['nullable', 'string'],
            'precio'               => ['sometimes', 'numeric', 'min:0'],
            'tipo'                 => ['sometimes', 'in:cuarto,mini_departamento,departamento_compartido,suite'],
            'estado'               => ['sometimes', 'in:borrador,publicado,inactivo'],
            'capacidad'            => ['nullable', 'integer', 'min:1', 'max:255'],
            'servicios_incluidos'  => ['boolean'],
        ]);

        $inmueble->update($data);

        return response()->json([
            'message'  => 'Inmueble actualizado.',
            'inmueble' => $inmueble->fresh(['ubicacion', 'fotografias']),
        ]);
    }

    /**
     * DELETE /api/v1/inmuebles/{id}
     * Eliminar inmueble. Solo el arrendador propietario.
     */
    public function destroy(Request $request, string $id)
    {
        $inmueble = Inmueble::where('id_arrendador', $request->user()->id_usuario)
            ->findOrFail($id);

        $inmueble->delete();

        return response()->json(['message' => 'Inmueble eliminado.'], 200);
    }
}
