<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Fotografia;
use App\Models\Inmueble;
use Illuminate\Http\Request;

class FotografiaController extends Controller
{
    /**
     * GET /api/v1/inmuebles/{id}/fotografias
     * Lista todas las fotos de un inmueble.
     */
    public function index(string $idInmueble)
    {
        $inmueble   = Inmueble::findOrFail($idInmueble);
        $fotografias = $inmueble->fotografias()->orderBy('orden')->get();

        return response()->json($fotografias);
    }

    /**
     * POST /api/v1/inmuebles/{id}/fotografias
     * Subir una nueva foto al inmueble. Solo el arrendador propietario.
     */
    public function store(Request $request, string $idInmueble)
    {
        $inmueble = Inmueble::where('id_arrendador', $request->user()->id_usuario)
            ->findOrFail($idInmueble);

        $request->validate([
            'foto'       => ['required', 'image', 'max:10240', 'mimes:jpg,jpeg,png,webp'],
            'orden'      => ['nullable', 'integer', 'min:0'],
            'es_portada' => ['nullable', 'boolean'],
        ]);

        $path = $request->file('foto')->store(
            "inmuebles/{$inmueble->id_inmueble}",
            'public'
        );

        $url = asset("storage/{$path}");

        // Si se marca como portada, desmarcar las anteriores
        if ($request->boolean('es_portada')) {
            Fotografia::where('id_inmueble', $inmueble->id_inmueble)
                ->update(['es_portada' => false]);
        }

        $fotografia = Fotografia::create([
            'id_inmueble' => $inmueble->id_inmueble,
            'url'         => $url,
            'orden'       => $request->input('orden', 0),
            'es_portada'  => $request->boolean('es_portada', false),
        ]);

        return response()->json([
            'message'    => 'Fotografía subida exitosamente.',
            'fotografia' => $fotografia,
        ], 201);
    }

    /**
     * DELETE /api/v1/fotografias/{id}
     * Eliminar una fotografía. Solo el arrendador propietario del inmueble.
     */
    public function destroy(Request $request, string $id)
    {
        $foto = Fotografia::with('inmueble')->findOrFail($id);

        if ($foto->inmueble->id_arrendador !== $request->user()->id_usuario) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        // Eliminar archivo del storage si es local
        $relativePath = str_replace(asset('storage/'), '', $foto->url);
        if (\Storage::disk('public')->exists($relativePath)) {
            \Storage::disk('public')->delete($relativePath);
        }

        $foto->delete();

        return response()->json(['message' => 'Fotografía eliminada.']);
    }

    /**
     * PATCH /api/v1/fotografias/{id}/portada
     * Marcar una foto como portada del inmueble.
     */
    public function setPortada(Request $request, string $id)
    {
        $foto = Fotografia::with('inmueble')->findOrFail($id);

        if ($foto->inmueble->id_arrendador !== $request->user()->id_usuario) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        // Quitar portada anterior
        Fotografia::where('id_inmueble', $foto->id_inmueble)
            ->update(['es_portada' => false]);

        $foto->update(['es_portada' => true]);

        return response()->json([
            'message'    => 'Fotografía marcada como portada.',
            'fotografia' => $foto->fresh(),
        ]);
    }
}
