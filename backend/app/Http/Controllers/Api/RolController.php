<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;

class RolController extends Controller
{
    /**
     * GET /api/v1/roles
     * Lista pública de roles disponibles para registro.
     * Solo devuelve estudiante y arrendador (no administrador).
     */
    public function index()
    {
        $roles = Rol::whereIn('nombre', ['estudiante', 'arrendador'])
            ->select('id_rol', 'nombre')
            ->get();

        return response()->json($roles);
    }
}
