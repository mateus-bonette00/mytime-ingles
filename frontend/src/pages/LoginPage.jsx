import { useState, useEffect } from 'react';
import authService from '../services/auth';
import Button from '../components/shared/Button';
import './Auth.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedLogin = localStorage.getItem('savedLogin');
    if (savedLogin) {
      try {
        const { email, password } = JSON.parse(savedLogin);
        setFormData({ email, password });
        setRememberMe(true);
      } catch {
        localStorage.removeItem('savedLogin');
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(formData.email, formData.password);

      if (rememberMe) {
        localStorage.setItem('savedLogin', JSON.stringify({
          email: formData.email,
          password: formData.password,
        }));
      } else {
        localStorage.removeItem('savedLogin');
      }

      const user = authService.getCurrentUser();

      // Redirecionar baseado no role do usuario
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/meus-cursos';
      }
    } catch (err) {
      const status = err.response?.status;
      const serverMessage = String(err.response?.data?.error || '').toLowerCase();

      if (status === 401 || serverMessage.includes('credenciais')) {
        setError('E-mail ou senha incorretos. Verifique seus dados e tente novamente.');
      } else if (status === 400) {
        setError(err.response?.data?.error || 'Preencha todos os campos corretamente.');
      } else {
        setError('Erro ao fazer login. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src="/mytime_logo.jpeg" alt="MyTime Inglês" className="auth-logo" />

        <h1>Entrar na sua conta</h1>
        <p className="auth-subtitle">Acesse o curso e continue aprendendo</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>E-mail</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="seu@email.com"
              className={error ? 'input-error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Sua senha"
                className={error ? 'input-error' : ''}
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

          <div className="remember-me">
            <label className="remember-me-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="remember-me-checkmark"></span>
              Salvar Login
            </label>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'ENTRANDO...' : 'ENTRAR'}
          </Button>
        </form>

        <p className="auth-link">
          Não tem uma conta? <a href="/">Compre o curso</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
