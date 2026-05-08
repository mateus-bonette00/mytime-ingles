import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/shared/Button';
import './Auth.css';

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token não fornecido. Link inválido.');
        setValidating(false);
        return;
      }

      try {
        const response = await api.get('/auth/validate-set-password-token', {
          params: { token }
        });

        setUserData(response.data);
        setValidating(false);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Token inválido ou expirado';
        setError(errorMsg);
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.password) {
        setError('Digite uma senha');
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError('A senha deve ter no mínimo 8 caracteres');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não conferem');
        setLoading(false);
        return;
      }

      const response = await api.post('/auth/set-password', {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      window.location.href = '/meus-cursos';
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao definir senha. Tente novamente.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <p>Validando token...</p>
        </div>
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <img src="/mytime_logo.jpeg" alt="MyTime Inglês" className="auth-logo" />
          <h1>Link inválido</h1>
          <div className="error-message">{error}</div>
          <p className="auth-link">
            <a href="/">Voltar para o início</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src="/mytime_logo.jpeg" alt="MyTime Inglês" className="auth-logo" />

        <h1>Defina sua senha</h1>
        <p className="auth-subtitle">Crie uma senha segura para acessar o curso</p>

        {userData && (
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Bem-vindo(a), <strong>{userData.name}</strong>!
          </p>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nova senha</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirme a senha</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Digite a mesma senha"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'DEFININDO SENHA...' : 'DEFINIR SENHA'}
          </Button>
        </form>

        <p className="auth-link">
          Já tem uma conta? <a href="/login">Faça login</a>
        </p>
      </div>
    </div>
  );
};

export default SetPassword;
