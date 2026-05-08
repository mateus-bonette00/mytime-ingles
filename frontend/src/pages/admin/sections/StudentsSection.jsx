import { useState, useEffect, useCallback } from 'react';
import adminApi from '../../../services/adminApi';

const StudentsSection = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '' });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await adminApi.getStudents();
      setStudents(res.data.students || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const showToast = useCallback((type, text) => {
    setToast({ id: Date.now(), type, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(current => (current?.id === toast.id ? null : current));
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditData({
      name: student.name || '',
      email: student.email || '',
    });
  };

  const handleCloseEditModal = () => {
    setEditingStudent(null);
    setEditData({ name: '', email: '' });
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;

    const name = editData.name.trim();
    const email = editData.email.trim();

    if (!name || !email) {
      showToast('error', 'Nome e e-mail sao obrigatorios.');
      return;
    }

    setSavingId(editingStudent.id);
    try {
      await adminApi.updateStudent(editingStudent.id, { name, email });
      showToast('success', `Aluno "${name}" atualizado com sucesso.`);
      handleCloseEditModal();
      await fetchStudents();
    } catch (err) {
      showToast('error', 'Erro ao atualizar aluno: ' + (err.response?.data?.error || err.message));
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (student) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir o aluno "${student.name}"?\n\nEssa acao nao pode ser desfeita.`
    );
    if (!confirmed) return;

    setDeletingId(student.id);
    try {
      await adminApi.deleteStudent(student.id);
      if (editingStudent?.id === student.id) {
        handleCloseEditModal();
      }
      showToast('success', `Aluno "${student.name}" excluido com sucesso.`);
      await fetchStudents();
    } catch (err) {
      showToast('error', 'Erro ao excluir aluno: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  const renderProgress = (student) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="admin-progress-cell">
      <div style={{
        width: '80px',
        height: '6px',
        background: '#e2e8f0',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${student.completion_percentage || 0}%`,
          height: '100%',
          background: 'linear-gradient(135deg, #1E4BA0, #E3242B)',
          borderRadius: '3px',
        }} />
      </div>
      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
        {Number(student.completion_percentage || 0).toFixed(0)}%
      </span>
    </div>
  );

  if (loading) return <div className="admin-loading">Carregando alunos...</div>;

  return (
    <div className="admin-table-wrap">
      <div className="admin-table-header">
        <div className="admin-table-title">Alunos ({students.length})</div>
      </div>

      {students.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          </svg>
          <p>Nenhum aluno cadastrado ainda</p>
        </div>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table admin-table-mobile admin-table-students">
            <thead>
              <tr>
                <th>#</th>
                <th>Nome</th>
                <th>Email</th>
                <th>Cadastro</th>
                <th>Progresso</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td data-label="#">{index + 1}</td>
                  <td data-label="Nome"><strong>{student.name}</strong></td>
                  <td data-label="Email" style={{ color: '#64748b' }}>{student.email}</td>
                  <td data-label="Cadastro">{new Date(student.created_at).toLocaleDateString('pt-BR')}</td>
                  <td data-label="Progresso">{renderProgress(student)}</td>
                  <td data-label="Acoes">
                    <div className="admin-actions">
                      <button
                        className="admin-action-btn edit"
                        onClick={() => handleEdit(student)}
                        title="Editar aluno"
                        aria-label={`Editar ${student.name}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      <button
                        className="admin-action-btn delete"
                        onClick={() => handleDelete(student)}
                        title="Excluir aluno"
                        aria-label={`Excluir ${student.name}`}
                        disabled={deletingId === student.id}
                        style={deletingId === student.id ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingStudent && (
        <div className="admin-modal-overlay" onClick={() => (savingId ? null : handleCloseEditModal())}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2 className="admin-modal-title">Editar Aluno</h2>
            <div className="admin-phrase-edit-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-phrase-edit-field">
                <label>Nome</label>
                <input
                  className="admin-input"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div className="admin-phrase-edit-field">
                <label>E-mail</label>
                <input
                  className="admin-input"
                  type="email"
                  value={editData.email}
                  onChange={e => setEditData({ ...editData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
            <div className="admin-modal-actions">
              <button
                className="admin-btn admin-btn-secondary"
                onClick={handleCloseEditModal}
                disabled={Boolean(savingId)}
              >
                Cancelar
              </button>
              <button
                className="admin-btn admin-btn-success"
                onClick={handleSaveEdit}
                disabled={savingId === editingStudent.id}
              >
                {savingId === editingStudent.id ? 'Salvando...' : 'Salvar Alteracoes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="admin-toast-stack" role="status" aria-live="polite">
          <div className={`admin-toast ${toast.type}`}>
            <div className="admin-toast-icon" aria-hidden="true">
              {toast.type === 'success' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>
            <span>{toast.text}</span>
            <button className="admin-toast-close" onClick={() => setToast(null)} aria-label="Fechar notificacao">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsSection;
