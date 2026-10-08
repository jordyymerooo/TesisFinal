import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Asignar Pusher a window para Laravel Echo en navegador
(window as any).Pusher = Pusher;

const getSavedToken = () =>
  sessionStorage.getItem('auth_token') ||
  sessionStorage.getItem('uleam_auth_token') ||
  sessionStorage.getItem('token') ||
  localStorage.getItem('auth_token') ||
  localStorage.getItem('uleam_auth_token') ||
  localStorage.getItem('token') ||
  localStorage.getItem('sanctum_token');

const REVERB_KEY = import.meta.env.VITE_REVERB_APP_KEY || 'o2jxqqwjvgy5woej1uqv';
const REVERB_HOST = import.meta.env.VITE_REVERB_HOST || window.location.hostname || '192.168.1.7';
const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT || 8080);
const AUTH_URL = `http://${REVERB_HOST}:8000/api/broadcasting/auth`;

export const echo = new Echo({
  broadcaster: 'reverb',
  key: REVERB_KEY,
  wsHost: REVERB_HOST,
  wsPort: REVERB_PORT,
  wssPort: REVERB_PORT,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  authEndpoint: AUTH_URL,
  authorizer: (channel: any) => {
    return {
      authorize: (socketId: string, callback: Function) => {
        const token = getSavedToken();
        fetch(AUTH_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
          body: JSON.stringify({
            socket_id: socketId,
            channel_name: channel.name,
          }),
        })
          .then(async (response) => {
            const data = await response.json();
            if (!response.ok) {
              return callback(new Error(data.message || 'Error autenticando WebSocket'), data);
            }
            callback(null, data);
          })
          .catch((error) => {
            callback(error);
          });
      },
    };
  },
  auth: {
    headers: {
      get Authorization() {
        const token = getSavedToken();
        return token ? `Bearer ${token}` : '';
      },
    },
  },
});

export default echo;
