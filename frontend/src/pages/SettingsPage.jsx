import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import authService from '../services/auth';
import Button from '../components/shared/Button';
import './SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [user] = useState(authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile state
  const [profileData, setProfileData] = useState({ name: '', email: '' });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Purchase state (for cancellation)
  const [purchase, setPurchase] = useState(null);
  const [loadingPurchase, setLoadingPurchase] = useState(true);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPurchaseInfo();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfileData({ name: res.data.user.name, email: res.data.user.email });
    } catch {
      setProfileData({ name: user?.name || '', email: user?.email || '' });
    }
  };

  const fetchPurchaseInfo = async () => {
    try {
      const res = await api.get('/users/purchase-info');
      setPurchase(res.data.purchase);
    } catch {
      setPurchase(null);
    } finally {
      setLoadingPurchase(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/users/profile', profileData);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setLoading(false);
      return;
    }

    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCourse = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/users/cancel-course');
      setMessage({ type: 'success', text: 'Curso cancelado. O reembolso será processado em até 5 dias úteis.' });
      setCancelConfirm(false);
      fetchPurchaseInfo();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao cancelar curso' });
    } finally {
      setLoading(false);
    }
  };

  const getDaysRemaining = () => {
    if (!purchase?.created_at) return 0;
    const purchaseDate = new Date(purchase.created_at);
    const now = new Date();
    const diffMs = now - purchaseDate;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - diffDays);
  };

  const canCancel = purchase?.payment_status === 'approved' && getDaysRemaining() > 0;

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

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <button className="settings-back" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Voltar
          </button>
          <h1>Configurações</h1>
        </div>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setMessage({ type: '', text: '' }); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Perfil
          </button>
          <button
            className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => { setActiveTab('password'); setMessage({ type: '', text: '' }); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Senha
          </button>
          <button
            className={`settings-tab ${activeTab === 'course' ? 'active' : ''}`}
            onClick={() => { setActiveTab('course'); setMessage({ type: '', text: '' }); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Curso
          </button>
          <button
            className={`settings-tab ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => { setActiveTab('support'); setMessage({ type: '', text: '' }); }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            Suporte
          </button>
        </div>

        <div className="settings-content">
          {/* Aba Perfil */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <h2>Dados do Perfil</h2>
              <div className="settings-form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>
              <div className="settings-form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="readonly"
                />
                <small>O e-mail não pode ser alterado</small>
              </div>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
              </Button>
            </form>
          )}

          {/* Aba Senha */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <h2>Alterar Senha</h2>
              <div className="settings-form-group">
                <label>Senha atual</label>
                <div className="password-wrapper">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    placeholder="Digite sua senha atual"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)} tabIndex={-1}>
                    {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className="settings-form-group">
                <label>Nova senha</label>
                <div className="password-wrapper">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <small>Mínimo 8 caracteres, 1 maiúscula, 1 número</small>
              </div>
              <div className="settings-form-group">
                <label>Confirmar nova senha</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    placeholder="Digite novamente"
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'ALTERANDO...' : 'ALTERAR SENHA'}
              </Button>
            </form>
          )}

          {/* Aba Curso */}
          {activeTab === 'course' && (
            <div className="settings-form">
              <h2>Meu Curso</h2>

              {loadingPurchase ? (
                <p className="settings-loading-text">Carregando informações...</p>
              ) : purchase ? (
                <>
                  <div className="settings-course-info">
                    <div className="settings-info-row">
                      <span className="settings-info-label">Curso</span>
                      <span className="settings-info-value">Inglês na Mala com Teacher Ediane</span>
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Status</span>
                      <span className={`settings-status ${purchase.payment_status}`}>
                        {purchase.payment_status === 'approved' ? 'Ativo' : purchase.payment_status === 'refunded' ? 'Cancelado' : 'Pendente'}
                      </span>
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Data da compra</span>
                      <span className="settings-info-value">
                        {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="settings-info-row">
                      <span className="settings-info-label">Valor pago</span>
                      <span className="settings-info-value">
                        R$ {parseFloat(purchase.amount).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {canCancel && (
                    <div className="settings-cancel-section">
                      <div className="settings-cancel-warning">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <div>
                          <strong>Garantia de 7 dias</strong>
                          <p>Você ainda tem {getDaysRemaining()} dia(s) restante(s) para solicitar o cancelamento com reembolso total.</p>
                        </div>
                      </div>

                      {!cancelConfirm ? (
                        <button className="settings-cancel-btn" onClick={() => setCancelConfirm(true)}>
                          Cancelar curso e solicitar reembolso
                        </button>
                      ) : (
                        <div className="settings-cancel-confirm">
                          <p>Tem certeza? Esta ação não pode ser desfeita. Você perderá o acesso ao curso.</p>
                          <div className="settings-cancel-actions">
                            <button className="settings-cancel-confirm-btn" onClick={handleCancelCourse} disabled={loading}>
                              {loading ? 'Processando...' : 'Sim, cancelar curso'}
                            </button>
                            <button className="settings-cancel-back-btn" onClick={() => setCancelConfirm(false)}>
                              Não, manter curso
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {purchase.payment_status === 'refunded' && (
                    <div className="settings-refunded-info">
                      Curso cancelado. O reembolso foi solicitado.
                    </div>
                  )}
                </>
              ) : (
                <p className="settings-no-purchase">Nenhuma compra encontrada.</p>
              )}
            </div>
          )}

          {/* Aba Suporte */}
          {activeTab === 'support' && (
            <div className="settings-form">
              <h2>Suporte</h2>
              <p className="settings-support-text">
                Precisa de ajuda? Entre em contato com nosso suporte pelo WhatsApp.
              </p>
              <a
                href="https://wa.me/5535998183459?text=Gostaria%20de%20falar%20com%20o%20Suporte%20Mateus%20Bonette"
                target="_blank"
                rel="noopener noreferrer"
                className="settings-whatsapp-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Falar com o suporte via WhatsApp
              </a>
              <div className="settings-support-info">
                <p><strong>Horário de atendimento:</strong> Segunda a Sexta, 9h às 18h</p>
                <p><strong>E-mail:</strong> mateus.bonette00@gmail.com</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
