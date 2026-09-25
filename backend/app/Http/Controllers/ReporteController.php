<?php

namespace App\Http\Controllers;

use App\Models\Reporte;
use App\Models\Inmueble;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ReporteController extends Controller
{
    /**
     * Guarda un nuevo reporte/denuncia emitido por un estudiante autenticado.
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            $estudianteId = $user->id_usuario ?? $user->id;

            $validated = $request->validate([
                'arrendador_id' => 'nullable|integer',
                'inmueble_id'   => 'nullable|integer',
                'motivo'        => 'required|string|max:255',
                'descripcion'   => 'nullable|string|max:2000',
            ]);

            $inmuebleId = $validated['inmueble_id'] ?? null;
            $arrendadorId = $validated['arrendador_id'] ?? null;

            // Si no se proporcionó arrendador_id pero sí inmueble_id, inferirlo
            if (!$arrendadorId && $inmuebleId) {
                $inmueble = Inmueble::find($inmuebleId);
                if ($inmueble) {
                    $arrendadorId = $inmueble->id_arrendador;
                }
            }

            if (!$arrendadorId) {
                return response()->json([
                    'status'  => 'error',
                    'message' => 'No se pudo identificar el arrendador a reportar.',
                ], 422);
            }

            $reporte = Reporte::create([
                'estudiante_id' => $estudianteId,
                'arrendador_id' => $arrendadorId,
                'inmueble_id'   => $inmuebleId,
                'motivo'        => $validated['motivo'],
                'descripcion'   => $validated['descripcion'] ?? null,
                'estado'        => 'pendiente',
            ]);

            $reporte->load(['estudiante', 'arrendador', 'inmueble']);

            return response()->json([
                'status'  => 'success',
                'message' => 'Reporte registrado exitosamente. Será revisado por un administrador.',
                'data'    => $reporte,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Datos inválidos.',
                'errors'  => $ve->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('[ReporteController@store] Error al crear reporte:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Ocurrió un error al procesar el reporte: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lista todos los reportes para el panel administrativo.
     */
    public function index()
    {
        try {
            $reportes = Reporte::with(['estudiante', 'arrendador', 'inmueble'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => 'success',
                'data'   => $reportes,
            ]);
        } catch (\Exception $e) {
            Log::error('[ReporteController@index] Error al listar reportes:', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Error al obtener la lista de reportes.',
                'data'    => [],
            ], 500);
        }
    }

    /**
     * Resuelve o descarta un reporte.
     */
    public function resolver(Request $request, $id)
    {
        try {
            $reporte = Reporte::findOrFail($id);

            $request->validate([
                'estado' => 'required|in:resuelto,descartado,pendiente',
            ]);

            $reporte->update([
                'estado' => $request->estado,
            ]);

            $reporte->load(['estudiante', 'arrendador', 'inmueble']);

            return response()->json([
                'status'  => 'success',
                'message' => "El reporte ha sido marcado como {$request->estado}.",
                'data'    => $reporte,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Reporte no encontrado.',
            ], 404);
        } catch (\Exception $e) {
            Log::error('[ReporteController@resolver] Error al actualizar estado de reporte:', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status'  => 'error',
                'message' => 'Error al actualizar el estado del reporte.',
            ], 500);
        }
    }
}
