import api from './api';

const authService = {
  // Login
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Validar token de cadastro
  async validateSignupToken(token) {
    const response = await api.get(`/auth/validate-token?token=${token}`);
    return response.data;
  },

  // Enviar código de verificação de cadastro
  async sendSignupVerificationCode(token) {
    const response = await api.post('/auth/signup/send-code', { token });
    return response.data;
  },

  // Cadastro com token
  async signup(token, password, confirmPassword, verificationCode) {
    const response = await api.post('/auth/signup', {
      token,
      password,
      confirmPassword,
      verificationCode,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Cadastro direto por compra aprovada
  async claimPurchaseAccess({ purchaseId, email, cpf, password, confirmPassword }) {
    const response = await api.post('/auth/claim-purchase', {
      purchaseId,
      email,
      cpf,
      password,
      confirmPassword,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Verificar autenticação
  async verifyAuth() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Solicitar reset de senha
  async requestPasswordReset(email) {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  },

  // Resetar senha
  async resetPassword(token, newPassword, confirmPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Obter usuário do localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar se está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  // Verificar se é admin
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  },
};

export default authService;
