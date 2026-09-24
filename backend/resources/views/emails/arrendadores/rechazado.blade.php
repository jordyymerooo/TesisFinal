<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Revisión de Documentación - ULEAM Rental</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 30px 15px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <!-- Header Institucional ULEAM -->
    <tr>
      <td style="background-color: #8C1515; padding: 24px; text-align: center;">
        <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">
          ULEAM Alojamiento Estudiantil
        </h1>
        <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 6px 0 0;">
          Plataforma Oficial de Arrendamientos Universitarios
        </p>
      </td>
    </tr>

    <!-- Contenido Principal -->
    <tr>
      <td style="padding: 32px 28px; color: #1E293B;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: #FEF2F2; color: #DC2626; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #FECACA;">
            ✕ Documentación Requiere Corrección
          </span>
        </div>

        <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 14px;">
          Hola {{ $user->nombre_completo ?? $user->nombres }},
        </h2>

        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">
          Hemos revisado tu documentación pero encontramos el siguiente problema:
        </p>

        <!-- Caja de Observación Destacada -->
        <div style="background-color: #FFF1F2; border-left: 4px solid #E11D48; border-radius: 6px; padding: 14px 18px; margin-bottom: 20px;">
          <p style="font-size: 14px; line-height: 1.6; color: #9F1239; margin: 0; font-weight: 600;">
            <strong>{{ $observacion }}</strong>
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
          Por favor, entra a la aplicación y vuelve a subir tus documentos corrigiendo este detalle.
        </p>

        <!-- Botón de acción -->
        <div style="text-align: center; margin: 28px 0 14px;">
          <a href="{{ config('app.url') }}" style="display: inline-block; background-color: #8C1515; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(140,21,21,0.3);">
            Abrir App y Subir Documentos
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F1F5F9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
        <p style="margin: 0 0 4px;">
          Este es un correo automático generado por el Sistema de Verificación KYC de <strong>ULEAM Rental</strong>.
        </p>
        <p style="margin: 0;">
          Universidad Laica Eloy Alfaro de Manabí &copy; {{ date('Y') }}. Todos los derechos reservados.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
