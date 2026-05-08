import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import authService from '../services/auth';
import Button from '../components/shared/Button';
import './Auth.css';

const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [userData, setUserData] = useState({ name: '', email: '' });
  const [formData, setFormData] = useState({ verificationCode: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [validating, setValidating] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token não fornecido');
      setValidating(false);
      return;
    }

    authService.validateSignupToken(token)
      .then((data) => {
        setUserData({ name: data.name, email: data.email });
        setCodeSent(false);
        setValidating(false);
      })
      .catch(() => {
        setError('Token inválido ou expirado');
        setValidating(false);
      });
  }, [token]);

  const handleSendVerificationCode = async () => {
    setError('');
    setInfo('');
    setSendingCode(true);

    try {
      const response = await authService.sendSignupVerificationCode(token);
      setCodeSent(true);
      setInfo(response.message || 'Código enviado para seu e-mail');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao enviar código de verificação');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const sanitizedCode = formData.verificationCode.trim();
    if (!/^\d{6}$/.test(sanitizedCode)) {
      setError('Digite o código de verificação de 6 dígitos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await authService.signup(token, formData.password, formData.confirmPassword, sanitizedCode);
      navigate('/meus-cursos');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    </svg>
  );

  if (validating) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <p>Validando token...</p>
        </div>
      </div>
    );
  }

  if (error && !userData.email) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <h1>Erro</h1>
          <p className="error-message">{error}</p>
          <Button onClick={() => navigate('/')}>Voltar ao início</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-brand">Teacher Ediane</h2>

        <h1>Crie sua conta</h1>
        <p className="auth-subtitle">Complete seu cadastro para acessar o curso</p>

        {error && <div className="error-message">{error}</div>}
        {info && <div className="success-message">{info}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nome</label>
            <input type="text" value={userData.name} readOnly />
          </div>

          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={userData.email} readOnly />
          </div>

          <div className="form-group">
            <label>Código de verificação</label>
            <input
              type="text"
              value={formData.verificationCode}
              onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              placeholder="Digite os 6 dígitos"
              required
            />
            <small>Enviamos este código para o e-mail da compra. Não compartilhe.</small>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleSendVerificationCode}
              disabled={sendingCode}
              className="send-code-button"
            >
              {sendingCode ? 'ENVIANDO...' : codeSent ? 'REENVIAR CÓDIGO' : 'ENVIAR CÓDIGO'}
            </Button>
          </div>

          <div className="form-group">
            <label>Criar senha</label>
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
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <small>Mínimo 8 caracteres, 1 maiúscula, 1 número</small>
          </div>

          <div className="form-group">
            <label>Confirmar senha</label>
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Digite a senha novamente"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA E ACESSAR O CURSO'}
          </Button>
        </form>

        <p className="auth-link">
          Já tenho uma conta, <a href="/login">fazer login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
