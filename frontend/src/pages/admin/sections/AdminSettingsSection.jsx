import { useState, useEffect } from 'react';
import api from '../../../services/api';
import authService from '../../../services/auth';

const AdminSettingsSection = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Profile
  const [profileData, setProfileData] = useState({ name: '', email: '' });

  // Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfileData({ name: res.data.user.name, email: res.data.user.email });
    } catch {
      const user = authService.getCurrentUser();
      setProfileData({ name: user?.name || '', email: user?.email || '' });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.put('/users/profile', { name: profileData.name, email: profileData.email });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setProfileData({ name: res.data.user.name, email: res.data.user.email });
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
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas nao coincidem' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'A nova senha deve ter no minimo 8 caracteres' });
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

  const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
    </svg>
  );

  const tabStyle = (isActive) => ({
    padding: '10px 20px',
    border: 'none',
    background: isActive ? '#1E4BA0' : 'transparent',
    color: isActive ? '#fff' : '#64748b',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s',
  });

  const inputWrapperStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const toggleBtnStyle = {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    color: '#94a3b8',
  };

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <div className="admin-table-title">Configuracao da Conta Admin</div>
      </div>

      <div style={{ padding: '28px' }}>
        {message && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 500,
            background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
            color: message.type === 'success' ? '#065f46' : '#991b1b',
          }}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <button style={tabStyle(activeTab === 'profile')} onClick={() => { setActiveTab('profile'); setMessage(null); }}>
            Perfil
          </button>
          <button style={tabStyle(activeTab === 'password')} onClick={() => { setActiveTab('password'); setMessage(null); }}>
            Senha
          </button>
        </div>

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} style={{ maxWidth: '480px' }}>
            <div className="admin-phrase-edit-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-phrase-edit-field">
                <label>Nome</label>
                <input
                  className="admin-input"
                  value={profileData.name}
                  onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>
              <div className="admin-phrase-edit-field">
                <label>E-mail</label>
                <input
                  className="admin-input"
                  type="email"
                  value={profileData.email}
                  onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button className="admin-btn admin-btn-primary" type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alteracoes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '480px' }}>
            <div className="admin-phrase-edit-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-phrase-edit-field">
                <label>Senha atual</label>
                <div style={inputWrapperStyle}>
                  <input
                    className="admin-input"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    placeholder="Digite sua senha atual"
                    style={{ paddingRight: '40px' }}
                  />
                  <button type="button" style={toggleBtnStyle} onClick={() => setShowCurrentPassword(!showCurrentPassword)} tabIndex={-1}>
                    {showCurrentPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
              <div className="admin-phrase-edit-field">
                <label>Nova senha</label>
                <div style={inputWrapperStyle}>
                  <input
                    className="admin-input"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    placeholder="Minimo 8 caracteres"
                    style={{ paddingRight: '40px' }}
                  />
                  <button type="button" style={toggleBtnStyle} onClick={() => setShowNewPassword(!showNewPassword)} tabIndex={-1}>
                    {showNewPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <small style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
                  Minimo 8 caracteres, 1 maiuscula, 1 numero
                </small>
              </div>
              <div className="admin-phrase-edit-field">
                <label>Confirmar nova senha</label>
                <div style={inputWrapperStyle}>
                  <input
                    className="admin-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    placeholder="Digite novamente"
                    style={{ paddingRight: '40px' }}
                  />
                  <button type="button" style={toggleBtnStyle} onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex={-1}>
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <button className="admin-btn admin-btn-primary" type="submit" disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsSection;
