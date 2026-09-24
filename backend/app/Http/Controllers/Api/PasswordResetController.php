<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetPinMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * POST /api/password/email
     * Valida el correo del usuario, genera un PIN de 6 dígitos y lo envía por correo.
     */
    public function sendPin(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'El correo electrónico es requerido.',
            'email.email'    => 'Debes ingresar un correo electrónico válido.',
        ]);

        $email = strtolower(trim($request->email));

        // Verificar si el usuario existe en el sistema
        $user = User::where('correo', $email)->first();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No existe ninguna cuenta registrada con este correo electrónico.',
            ], 404);
        }

        // Generar PIN numérico de 6 dígitos
        $pin = sprintf('%06d', mt_rand(100000, 999999));

        // Guardar o actualizar PIN en la base de datos
        DB::table('password_reset_pins')->updateOrInsert(
            ['email' => $email],
            [
                'pin'        => Hash::make($pin),
                'token'      => null,
                'created_at' => now(),
            ]
        );

        // Despachar correo electrónico con el PIN
        try {
            Mail::to($email)->send(new PasswordResetPinMail($pin));
        } catch (\Throwable $e) {
            \Log::error('[PasswordResetController] Error al enviar correo de recuperación: ' . $e->getMessage());
            // En desarrollo local seguimos permitiendo continuar
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Código de seguridad de 6 dígitos enviado a tu correo.',
            // Si estamos en local/testing o mail no configurado, facilitamos depuración controlada
            'email'   => $email,
        ], 200);
    }

    /**
     * POST /api/password/verify-pin
     * Verifica que el PIN ingresado coincida y no haya expirado (15 minutos).
     */
    public function verifyPin(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'pin'   => ['required', 'string', 'size:6'],
        ], [
            'email.required' => 'El correo es requerido.',
            'pin.required'   => 'Debes ingresar el código PIN.',
            'pin.size'       => 'El código PIN debe tener exactamente 6 dígitos.',
        ]);

        $email = strtolower(trim($request->email));

        $record = DB::table('password_reset_pins')->where('email', $email)->first();

        if (!$record) {
            return response()->json([
                'status'  => 'error',
                'message' => 'No hay una solicitud de restablecimiento activa para este correo.',
            ], 400);
        }

        // Comprobar expiración (15 minutos)
        if (now()->diffInMinutes(Carbon::parse($record->created_at)) > 15) {
            DB::table('password_reset_pins')->where('email', $email)->delete();
            return response()->json([
                'status'  => 'error',
                'message' => 'El código PIN ha expirado (tiempo límite de 15 minutos). Por favor solicita uno nuevo.',
            ], 400);
        }

        // Verificar el hash del PIN
        if (!Hash::check($request->pin, $record->pin)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'El código PIN ingresado es incorrecto. Verifica en tu correo e intenta nuevamente.',
            ], 400);
        }

        // Generar un token temporal seguro para el paso de actualización de clave
        $resetToken = Str::random(64);

        DB::table('password_reset_pins')->where('email', $email)->update([
            'token'      => Hash::make($resetToken),
            'created_at' => now(),
        ]);

        return response()->json([
            'status'      => 'success',
            'message'     => 'Código PIN verificado correctamente.',
            'reset_token' => $resetToken,
            'email'       => $email,
        ], 200);
    }

    /**
     * POST /api/password/reset
     * Actualiza la contraseña del usuario tras validar el token temporal.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email'                 => ['required', 'email'],
            'reset_token'           => ['required', 'string'],
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'email.required'        => 'El correo es requerido.',
            'reset_token.required'  => 'El token de seguridad es requerido.',
            'password.required'     => 'La nueva contraseña es requerida.',
            'password.min'          => 'La contraseña debe tener al menos 6 caracteres.',
            'password.confirmed'    => 'La confirmación de contraseña no coincide.',
        ]);

        $email = strtolower(trim($request->email));

        $record = DB::table('password_reset_pins')->where('email', $email)->first();

        if (!$record || !$record->token || !Hash::check($request->reset_token, $record->token)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'El token de restablecimiento es inválido o ha expirado. Por favor solicita un nuevo código.',
            ], 400);
        }

        // Comprobar expiración del token (15 minutos)
        if (now()->diffInMinutes(Carbon::parse($record->created_at)) > 15) {
            DB::table('password_reset_pins')->where('email', $email)->delete();
            return response()->json([
                'status'  => 'error',
                'message' => 'La sesión de restablecimiento expiró. Por favor inicia nuevamente el proceso.',
            ], 400);
        }

        $user = User::where('correo', $email)->first();

        if (!$user) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Usuario no encontrado en la plataforma.',
            ], 404);
        }

        // Actualizar contraseña con hash seguro (en clave_hash de PostgreSQL)
        $hashed = Hash::make($request->password);
        $user->clave_hash = $hashed;
        $user->save();

        // Eliminar registro de pines usado
        DB::table('password_reset_pins')->where('email', $email)->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva clave.',
        ], 200);
    }
}
