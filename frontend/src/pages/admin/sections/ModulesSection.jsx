import { useState, useEffect, useRef } from 'react';
import adminApi from '../../../services/adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const ModulesSection = ({ onSelectModule }) => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newModule, setNewModule] = useState({ name: '', sort_order: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);

  const fetchModules = async () => {
    try {
      const res = await adminApi.getModules();
      setModules(res.data.modules || []);
    } catch {
      setModules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModules(); }, []);

  const handleCreate = async () => {
    if (!newModule.name.trim()) return alert('Nome e obrigatorio');
    try {
      const res = await adminApi.createModule(newModule);
      if (imageFile && res.data.module?.id) {
        await adminApi.uploadModuleImage(res.data.module.id, imageFile);
      }
      setShowNewForm(false);
      setNewModule({ name: '', sort_order: 0 });
      setImageFile(null);
      fetchModules();
    } catch (err) {
      alert('Erro ao criar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSave = async (id) => {
    try {
      await adminApi.updateModule(id, editData);
      setEditingId(null);
      fetchModules();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Excluir o modulo "${name}"? As frases nao serao excluidas, apenas desassociadas.`)) return;
    try {
      await adminApi.deleteModule(id);
      fetchModules();
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUploadClick = (moduleId) => {
    setUploadTarget(moduleId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;
    try {
      await adminApi.uploadModuleImage(uploadTarget, file);
      fetchModules();
    } catch (err) {
      alert('Erro ao enviar imagem: ' + (err.response?.data?.error || err.message));
    }
    e.target.value = '';
    setUploadTarget(null);
  };

  const getImageUrl = (mod) => {
    if (!mod.image_url) return null;
    if (mod.image_url.startsWith('/uploads')) return `${BASE_URL}${mod.image_url}`;
    return mod.image_url;
  };

  if (loading) return <div className="admin-loading">Carregando modulos...</div>;

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div className="admin-table-title">Modulos ({modules.length})</div>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowNewForm(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Modulo
          </button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {modules.length === 0 ? (
            <div className="admin-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <p>Nenhum modulo criado ainda</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {modules.map(mod => (
                <div key={mod.id} style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                }}>
                  {/* Imagem */}
                  <div style={{
                    height: '140px',
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                    onClick={() => handleUploadClick(mod.id)}
                    title="Clique para trocar a imagem"
                  >
                    {getImageUrl(mod) ? (
                      <img src={getImageUrl(mod)} alt={mod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p style={{ fontSize: '12px', margin: '4px 0 0' }}>Clique para adicionar imagem</p>
                      </div>
                    )}
                    <div style={{
                      position: 'absolute', top: '8px', right: '8px',
                      background: '#1e293b', color: '#fff', padding: '2px 8px',
                      borderRadius: '12px', fontSize: '11px', fontWeight: 700,
                    }}>
                      {mod.phrase_count || 0} frases
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '14px 16px' }}>
                    {editingId === mod.id ? (
                      <div>
                        <input
                          className="admin-input"
                          value={editData.name}
                          onChange={e => setEditData({ ...editData, name: e.target.value })}
                          style={{ marginBottom: '8px' }}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <input
                            className="admin-input"
                            type="number"
                            value={editData.sort_order}
                            onChange={e => setEditData({ ...editData, sort_order: parseInt(e.target.value) || 0 })}
                            placeholder="Ordem"
                            style={{ width: '80px' }}
                          />
                          <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleSave(mod.id)}>Salvar</button>
                          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setEditingId(null)}>Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>{mod.name}</h3>
                        <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#94a3b8' }}>Ordem: {mod.sort_order}</p>
                        <div className="admin-actions">
                          <button
                            className="admin-btn admin-btn-primary admin-btn-sm"
                            onClick={() => onSelectModule && onSelectModule(mod)}
                          >
                            Ver Frases
                          </button>
                          <button
                            className="admin-action-btn edit"
                            onClick={() => { setEditingId(mod.id); setEditData({ name: mod.name, sort_order: mod.sort_order }); }}
                            title="Editar"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => handleDelete(mod.id, mod.name)}
                            title="Excluir"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal novo modulo */}
      {showNewForm && (
        <div className="admin-modal-overlay" onClick={() => setShowNewForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2 className="admin-modal-title">Novo Modulo</h2>
            <div className="admin-phrase-edit-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="admin-phrase-edit-field">
                <label>Nome do Modulo</label>
                <input
                  className="admin-input"
                  value={newModule.name}
                  onChange={e => setNewModule({ ...newModule, name: e.target.value })}
                  placeholder="Ex: Aeroporto e Imigração"
                />
              </div>
              <div className="admin-phrase-edit-field">
                <label>Ordem de exibição</label>
                <input
                  className="admin-input"
                  type="number"
                  value={newModule.sort_order}
                  onChange={e => setNewModule({ ...newModule, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="admin-phrase-edit-field">
                <label>Imagem de Capa</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => setImageFile(e.target.files[0])}
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => { setShowNewForm(false); setImageFile(null); }}>Cancelar</button>
              <button className="admin-btn admin-btn-primary" onClick={handleCreate}>Criar Modulo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesSection;
