import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { setAuthToken } from '../services/api';

const WINE = '#8C1515';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/login`,
        { correo: email, clave: password }
      );

      const token = response.data?.token || response.data?.access_token;
      if (token) {
        setAuthToken(token);
        navigate('/', { replace: true });
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err: any) {
      console.log('Login Error Response:', err.response?.data);
      const data = err.response?.data;
      
      if (data?.errors) {
        const firstErrorKey = Object.keys(data.errors)[0];
        setError(data.errors[firstErrorKey][0]);
      } else if (data?.message) {
        setError(data.message);
      } else if (err.response?.status === 401) {
        setError('Credenciales incorrectas.');
      } else {
        setError('Ocurrió un error. Verifica tu conexión o intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 400, background: '#FFFFFF', borderRadius: 24, padding: 40, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: WINE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 16px ${WINE}40` }}>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>U</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.5px' }}>
            ULEAM Rental
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280', fontWeight: 500 }}>
            Panel Administrativo
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 20, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
              Correo Institucional
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="admin@uleam.edu.ec"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8 }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 12, border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              background: WINE,
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'background 0.2s',
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
