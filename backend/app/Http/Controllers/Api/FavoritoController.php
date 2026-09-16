<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inmueble;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    /**
     * Listar los inmuebles favoritos del usuario autenticado.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $favoritos = $user->favoritos()
            ->with(['ubicacion', 'fotografias', 'arrendador.perfil'])
            ->latest('favoritos.created_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'data'   => $favoritos,
        ]);
    }

    /**
     * Alternar estado de favorito para un inmueble (attach / detach).
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'id_inmueble' => ['required', 'integer', 'exists:inmuebles,id_inmueble'],
        ]);

        $user = $request->user();
        $idInmueble = (int) $request->input('id_inmueble');

        $exists = $user->favoritos()->where('favoritos.id_inmueble', $idInmueble)->exists();

        if ($exists) {
            $user->favoritos()->detach($idInmueble);
            $isFavorite = false;
            $message = 'Inmueble eliminado de favoritos';
        } else {
            $user->favoritos()->attach($idInmueble);
            $isFavorite = true;
            $message = 'Inmueble agregado a tus favoritos';
        }

        return response()->json([
            'status'      => 'success',
            'is_favorite' => $isFavorite,
            'message'     => $message,
        ]);
    }
}
