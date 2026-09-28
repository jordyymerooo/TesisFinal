<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aviso;
use Illuminate\Support\Facades\Auth;

class AvisoController extends Controller
{
    public function indexAdmin()
    {
        $avisos = Aviso::with('user')->orderBy('created_at', 'desc')->get();
        return response()->json($avisos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'titulo' => 'required|string|max:255',
            'mensaje' => 'required|string',
            'tipo' => 'required|in:global,individual',
            'user_id' => 'nullable|exists:users,id_usuario'
        ]);

        $aviso = Aviso::create([
            'titulo' => $request->titulo,
            'mensaje' => $request->mensaje,
            'tipo' => $request->tipo,
            'user_id' => $request->tipo === 'individual' ? $request->user_id : null,
        ]);

        return response()->json([
            'message' => 'Aviso creado exitosamente',
            'aviso' => $aviso
        ], 201);
    }

    public function indexMobile()
    {
        $userId = Auth::id(); // En mi app_estudiantes, la autenticación es mediante Sanctum y el PK de usuario es id_usuario.
        
        $avisos = Aviso::where('tipo', 'global')
            ->orWhere(function($query) use ($userId) {
                $query->where('tipo', 'individual')
                      ->where('user_id', $userId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($avisos);
    }
}
