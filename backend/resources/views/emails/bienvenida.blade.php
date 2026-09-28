<x-mail::message>
{{-- ── Header ── --}}
# ¡Hola, {{ $usuario->nombres }}! 👋

Bienvenido a **ULEAM Alojamiento Estudiantil**, la plataforma oficial para la gestión y búsqueda de alojamientos cerca del campus universitario.

Tu cuenta ha sido creada exitosamente como **{{ $rol }}**. Ya puedes:

@if ((int) $usuario->id_rol === 1)
- 🔍 Explorar inmuebles verificados cerca del campus
- 💬 Contactar directamente a los arrendadores
- ❤️ Guardar tus alojamientos favoritos
- 📋 Gestionar tus solicitudes de reserva
@else
- 🏠 Publicar tus inmuebles para estudiantes
- 📩 Recibir y gestionar solicitudes de interesados
- 💬 Chatear con potenciales inquilinos
- 📊 Ver estadísticas de tus publicaciones
@endif

{{-- ── Botón CTA ── --}}
<x-mail::button url="{{ $appUrl }}" color="success">
Ir a la Aplicación
</x-mail::button>

---

> **Importante:** Antes de poder iniciar sesión, debes verificar tu correo electrónico. Revisa tu bandeja de entrada (o la carpeta SPAM) y haz clic en el enlace de confirmación que te enviamos por separado.

Si tienes alguna pregunta o necesitas ayuda, puedes contactarnos respondiendo a este correo.

Atentamente,<br>
El equipo de {{ config('app.name') }}
</x-mail::message>
