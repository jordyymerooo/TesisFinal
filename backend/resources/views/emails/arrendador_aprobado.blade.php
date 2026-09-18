<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cuenta Aprobada - ULEAM Rental</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 30px 15px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
    <!-- Header -->
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

    <!-- Content -->
    <tr>
      <td style="padding: 32px 28px; color: #1E293B;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background-color: #ECFDF5; color: #059669; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #A7F3D0;">
            ✓ Verificación de Identidad Aprobada
          </span>
        </div>

        <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 14px;">
          ¡Hola, {{ $usuario->nombres }}!
        </h2>

        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 16px;">
          Nos complace informarte que tu documentación de identidad (cédula, selfie y comprobante de servicios básicos) ha sido <strong>revisada y aprobada exitosamente</strong> por el equipo administrativo de la ULEAM.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px;">
          A partir de este momento, tu cuenta de <strong>Arrendador</strong> está completamente activa y habilitada para:
        </p>

        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px; background-color: #F8FAFC; border-radius: 8px; padding: 14px 18px;">
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #334155;">
              🔹 <strong>Publicar nuevos alojamientos</strong> (habitaciones, departamentos, suites).
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #334155;">
              🔹 <strong>Recibir solicitudes de reserva</strong> de estudiantes universitarios verificados.
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 14px; color: #334155;">
              🔹 <strong>Chatear en tiempo real</strong> para coordinar visitas seguras.
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin: 30px 0 15px;">
          <a href="{{ config('app.url') }}" style="display: inline-block; background-color: #8C1515; color: #FFFFFF; font-weight: 700; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 6px rgba(140,21,21,0.3);">
            Ir a la Aplicación
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #F1F5F9; padding: 18px 24px; text-align: center; border-top: 1px solid #E2E8F0;">
        <p style="font-size: 12px; color: #64748B; margin: 0 0 6px;">
          Universidad Laica Eloy Alfaro de Manabí (ULEAM) — Manta, Ecuador
        </p>
        <p style="font-size: 11px; color: #94A3B8; margin: 0;">
          Este correo fue generado automáticamente para notificar la aprobación de tu cuenta de arrendador.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
