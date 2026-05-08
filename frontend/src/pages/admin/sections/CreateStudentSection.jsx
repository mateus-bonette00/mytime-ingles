import { useState } from 'react';
import adminApi from '../../../services/adminApi';

const CreateStudentSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await adminApi.createStudent(formData);
      const roleLabel = formData.role === 'admin' ? 'Admin' : 'Aluno';
      setMessage({ type: 'success', text: `${roleLabel} "${res.data.user.name}" criado com sucesso!` });
      setFormData({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro ao criar usuario' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <div className="admin-table-title">Criar Usuario</div>
      </div>

      <div style={{ padding: '28px' }}>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          Crie uma conta com acesso liberado. Selecione a role do usuario abaixo.
        </p>

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

        <form onSubmit={handleSubmit} style={{ maxWidth: '480px' }}>
          <div className="admin-phrase-edit-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-phrase-edit-field">
              <label>Nome completo</label>
              <input
                className="admin-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Maria Silva"
                required
              />
            </div>
            <div className="admin-phrase-edit-field">
              <label>E-mail</label>
              <input
                className="admin-input"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ex: maria@email.com"
                required
              />
            </div>
            <div className="admin-phrase-edit-field">
              <label>Senha</label>
              <input
                className="admin-input"
                type="text"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimo 8 caracteres, 1 maiuscula, 1 numero"
                required
                minLength={8}
              />
            </div>
            <div className="admin-phrase-edit-field">
              <label>Tipo de usuario (Role)</label>
              <select
                className="admin-input"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Aluno</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {formData.role === 'admin' && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              marginTop: '12px',
              fontSize: '13px',
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fde68a',
            }}>
              Este usuario tera acesso total ao painel administrativo.
            </div>
          )}

          <div style={{ marginTop: '20px' }}>
            <button className="admin-btn admin-btn-primary" type="submit" disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              {loading ? 'Criando...' : `Criar ${formData.role === 'admin' ? 'Admin' : 'Aluno'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudentSection;
