<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inmueble;
use App\Models\Ubicacion;
use Illuminate\Http\Request;

class UbicacionController extends Controller
{
    /**
     * GET /api/v1/inmuebles/{id}/ubicacion
     * Obtener la ubicación de un inmueble.
     */
    public function show(string $idInmueble)
    {
        $inmueble = Inmueble::findOrFail($idInmueble);
        $ubicacion = $inmueble->ubicacion;

        if (! $ubicacion) {
            return response()->json(['message' => 'Este inmueble no tiene ubicación registrada.'], 404);
        }

        return response()->json($ubicacion);
    }

    /**
     * POST /api/v1/inmuebles/{id}/ubicacion
     * Crear o actualizar la ubicación de un inmueble (upsert).
     * Solo el arrendador propietario.
     */
    public function upsert(Request $request, string $idInmueble)
    {
        $inmueble = Inmueble::where('id_arrendador', $request->user()->id_usuario)
            ->findOrFail($idInmueble);

        $data = $request->validate([
            'latitud'               => ['required', 'numeric', 'between:-90,90'],
            'longitud'              => ['required', 'numeric', 'between:-180,180'],
            'direccion_referencial' => ['nullable', 'string', 'max:255'],
            'sector'                => ['nullable', 'string', 'max:100'],
            'distancia_uleam_km'    => ['nullable', 'numeric', 'min:0', 'max:999.99'],
        ]);

        $ubicacion = Ubicacion::updateOrCreate(
            ['id_inmueble' => $inmueble->id_inmueble],
            $data
        );

        return response()->json([
            'message'   => 'Ubicación guardada correctamente.',
            'ubicacion' => $ubicacion,
        ], $ubicacion->wasRecentlyCreated ? 201 : 200);
    }
}
