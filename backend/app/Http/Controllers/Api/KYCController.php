<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;

class KYCController extends Controller
{
    /**
     * POST /api/kyc/documentos o /api/v1/kyc/documentos
     * Sube los documentos KYC del arrendador (Cédula Frontal, Cédula Posterior, Selfie y Recibo).
     * Solo requiere autenticación con Sanctum (NO requiere email verificado).
     */
    public function upload(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user && $request->filled('id_usuario')) {
            $user = User::find($request->input('id_usuario'));
        }

        if (!$user && $request->filled('correo')) {
            $user = User::where('correo', strtolower(trim($request->input('correo'))))->first();
        }

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuario no identificado o no encontrado.',
            ], 401);
        }

        $perfil = $user->perfil ?? Perfil::create(['id_usuario' => $user->id_usuario]);

        // Helper para borrar archivos físicos antiguos del disco público
        $deleteOldFile = function (?string $url) {
            if (!$url) return;
            if (preg_match('#/storage/(.+)$#', $url, $matches)) {
                $relativePath = $matches[1];
                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }
        };

        // Si el usuario ya tenía archivos previos (porque su estado era rechazado o re-sube), borrar archivos antiguos
        if ($user->estado_kyc === 'rechazado' || !empty($perfil->documento_url)) {
            $deleteOldFile($perfil->documento_url);
            $deleteOldFile($perfil->documento_posterior_url);
            $deleteOldFile($perfil->foto_perfil_url);
            $deleteOldFile($perfil->recibo_luz_url);
        }

        $uploadedUrls = [];
        $documentKeys = [
            'cedulaFrontal'   => ['cedulaFrontal', 'cedula_frontal', 'documento_frontal'],
            'cedulaPosterior' => ['cedulaPosterior', 'cedula_posterior', 'documento_posterior'],
            'selfie'          => ['selfie', 'selfie_cedula', 'foto_selfie', 'foto_perfil'],
            'reciboLuz'       => ['reciboLuz', 'recibo_luz', 'recibo_servicio', 'recibo'],
        ];

        foreach ($documentKeys as $canonicalKey => $aliases) {
            $file = null;
            foreach ($aliases as $alias) {
                if ($request->hasFile($alias)) {
                    $file = $request->file($alias);
                    break;
                }
            }

            if ($file instanceof UploadedFile && $file->isValid()) {
                $path = $file->store("documentos/{$user->id_usuario}", 'public');
                $uploadedUrls[$canonicalKey] = asset("storage/{$path}");
            } elseif ($request->has($aliases[0]) && is_string($request->input($aliases[0]))) {
                // Si viene como string/URL previa o base64
                $val = $request->input($aliases[0]);
                if (!empty($val)) {
                    $uploadedUrls[$canonicalKey] = $val;
                }
            }
        }

        // Asignar a perfil y limpiar observaciones previas
        $updates = [
            'documento_verificado' => false,
            'documento_tipo'       => 'cedula',
            'kyc_observacion'      => null,
        ];

        if (isset($uploadedUrls['cedulaFrontal'])) {
            $updates['documento_url'] = $uploadedUrls['cedulaFrontal'];
        } elseif (empty($perfil->documento_url) && !empty($uploadedUrls)) {
            // Si subió al menos un documento, registrar documento_url
            $first = reset($uploadedUrls);
            $updates['documento_url'] = $first;
        }

        if (isset($uploadedUrls['cedulaPosterior'])) {
            $updates['documento_posterior_url'] = $uploadedUrls['cedulaPosterior'];
        }

        if (isset($uploadedUrls['selfie'])) {
            $updates['foto_perfil_url'] = $uploadedUrls['selfie'];
        }

        if (isset($uploadedUrls['reciboLuz'])) {
            $updates['recibo_luz_url'] = $uploadedUrls['reciboLuz'];
        }

        $perfil->update($updates);

        // Crítico: Cambiar el estado del usuario de vuelta a la cola de revisión
        $user->update([
            'estado_kyc'      => 'pendiente',
            'kyc_observacion' => null,
            'estado'          => 'pendiente',
        ]);

        $freshUser = $user->fresh(['rol', 'perfil']);

        return response()->json([
            'status'      => 'success',
            'message'     => 'Documentos de identidad recibidos exitosamente. Tu cuenta está en revisión por el equipo administrativo.',
            'estado_kyc'  => 'pendiente',
            'documentos'  => $uploadedUrls,
            'user'        => $freshUser,
        ], 200);
    }
}
