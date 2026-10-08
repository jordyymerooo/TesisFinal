/**
 * update-ip.js
 * Detecta automáticamente la dirección IP local de la red Wi-Fi / LAN
 * y actualiza el archivo .env para Expo (EXPO_PUBLIC_API_URL).
 *
 * Uso: node update-ip.js
 * El package.json lo ejecuta antes de iniciar Expo en todos los scripts.
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

function getLocalIp() {
  const nets      = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      const isIpv4 = net.family === 'IPv4' || net.family === 4;

      if (isIpv4 && !net.internal) {
        // Descartar adaptadores virtuales:
        //   - VirtualBox host-only → 192.168.56.x o nombre "VirtualBox"
        //   - VMware, WSL (vEthernet), adaptadores "Local Area Connection*" desconectados
        //   - Apipa (169.254.x.x)
        const isVirtual =
          /virtual|vbox|vmware|vethernet|local area connection\*/i.test(name) ||
          net.address.startsWith('192.168.56.') ||
          net.address.startsWith('169.254.');

        candidates.push({ name, address: net.address, isVirtual });
      }
    }
  }

  // Mostrar todas las candidatas detectadas para depuración
  if (candidates.length > 0) {
    console.log('\n🔍 Interfaces de red detectadas:');
    candidates.forEach(c =>
      console.log(`   ${c.isVirtual ? '⚪' : '🟢'} [${c.name}] → ${c.address}${c.isVirtual ? ' (virtual, ignorada)' : ''}`)
    );
  }

  // Prioridad: Wi-Fi real → Ethernet físico → cualquier no-virtual
  // Windows nombra la interfaz Wi-Fi como "Wi-Fi" en inglés o contiene "Wi" en español
  const preferred =
    candidates.find((c) => !c.isVirtual && /wi.fi|wlan|wireless|inalámb/i.test(c.name)) ||
    candidates.find((c) => !c.isVirtual && /ethernet|eth/i.test(c.name))                ||
    candidates.find((c) => !c.isVirtual)                                                 ||
    candidates[0];

  return preferred ? preferred.address : '127.0.0.1';
}

// ── Detección y escritura del .env ─────────────────────────────────────────
const detectedIp = getLocalIp();
const envPath    = path.join(__dirname, '.env');
const apiUrl     = `http://${detectedIp}:8000/api/v1`;

const envContent = [
  '# Generado automáticamente por update-ip.js — NO editar a mano',
  `EXPO_PUBLIC_API_URL=${apiUrl}`,
  `EXPO_PUBLIC_LOCAL_IP=${detectedIp}`,
  'EXPO_PUBLIC_BACKEND_PORT=8000',
  'EXPO_PUBLIC_REVERB_APP_KEY=o2jxqqwjvgy5woej1uqv',
  'EXPO_PUBLIC_REVERB_PORT=8080',
  '',
].join('\n');

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log(`\n📡 IP Local detectada  : ${detectedIp}`);
  console.log(`🌐 EXPO_PUBLIC_API_URL : ${apiUrl}`);
  console.log(`💾 .env actualizado correctamente.\n`);
} catch (err) {
  console.error('❌ Error al escribir el .env:', err.message);
  process.exit(1);
}
