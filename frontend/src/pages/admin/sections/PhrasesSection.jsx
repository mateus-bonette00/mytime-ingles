import { useState, useEffect, useRef, useCallback } from 'react';
import adminApi from '../../../services/adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const CircularProgress = ({ percent }) => {
  const size = 36;
  const stroke = 3.5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="#22c55e" strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.2s ease' }}
        />
      </svg>
      <span style={{
        position: 'absolute', fontSize: '9px', fontWeight: 700, color: '#22c55e',
      }}>{percent}%</span>
    </div>
  );
};

const DragHandle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="#94a3b8" style={{ cursor: 'grab' }}>
    <circle cx="5" cy="3" r="1.5"/>
    <circle cx="11" cy="3" r="1.5"/>
    <circle cx="5" cy="8" r="1.5"/>
    <circle cx="11" cy="8" r="1.5"/>
    <circle cx="5" cy="13" r="1.5"/>
    <circle cx="11" cy="13" r="1.5"/>
  </svg>
);

const PhrasesSection = ({ filterModule, onBack }) => {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPhrase, setNewPhrase] = useState({ text_en: '', text_pt: '', category: 'general', duration_seconds: 0, module_id: filterModule?.id || '' });
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [modules, setModules] = useState([]);

  // Drag-and-drop state
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const fetchPhrases = async () => {
    try {
      const [phrasesRes, modulesRes] = await Promise.all([
        adminApi.getPhrases(),
        adminApi.getModules(),
      ]);
      setPhrases(phrasesRes.data.phrases || []);
      setModules(modulesRes.data.modules || []);
    } catch {
      setPhrases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhrases(); }, []);

  let filteredPhrases = phrases;
  if (filterModule) {
    filteredPhrases = filteredPhrases.filter(p => p.module_id === filterModule.id);
  }
  if (filter) {
    filteredPhrases = filteredPhrases.filter(p => String(p.module_id) === filter);
  }

  // Drag-and-drop handlers
  const handleDragStart = useCallback((e, index) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    // Make the dragged row semi-transparent
    requestAnimationFrame(() => {
      e.target.style.opacity = '0.4';
    });
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  }, [dragOverIndex]);

  const handleDrop = useCallback(async (e, dropIndex) => {
    e.preventDefault();
    const fromIndex = dragIndex;
    setDragIndex(null);
    setDragOverIndex(null);

    if (fromIndex === null || fromIndex === dropIndex) return;

    // Reorder the filtered list
    const reordered = [...filteredPhrases];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Collect the original phrase_numbers from the filtered list (sorted)
    const originalNumbers = filteredPhrases.map(p => p.phrase_number).sort((a, b) => a - b);

    // Assign the sorted phrase_numbers to the new order
    const items = reordered.map((phrase, i) => ({
      id: phrase.id,
      phrase_number: originalNumbers[i],
    }));

    // Optimistic update
    const updatedPhrases = phrases.map(p => {
      const item = items.find(it => it.id === p.id);
      return item ? { ...p, phrase_number: item.phrase_number } : p;
    }).sort((a, b) => a.phrase_number - b.phrase_number);
    setPhrases(updatedPhrases);

    try {
      await adminApi.reorderPhrases(items);
    } catch (err) {
      alert('Erro ao reordenar: ' + (err.response?.data?.error || err.message));
      fetchPhrases(); // revert
    }
  }, [dragIndex, filteredPhrases, phrases]);

  const handlePlay = (phrase) => {
    if (playingId === phrase.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(`${BASE_URL}${phrase.audio_url}`);
    audio.preload = 'auto';
    audioRef.current = audio;
    setPlayingId(phrase.id);
    audio.play().catch(err => {
      console.error('Erro ao reproduzir audio:', err);
      setPlayingId(null);
    });
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => {
      console.error('Erro ao carregar audio:', phrase.audio_url);
      setPlayingId(null);
    };
  };

  const handleEdit = (phrase) => {
    setEditingId(phrase.id);
    setEditData({
      text_en: phrase.text_en,
      text_pt: phrase.text_pt,
      category: phrase.category,
      duration_seconds: phrase.duration_seconds,
      module_id: phrase.module_id || '',
    });
  };

  const handleSave = async (phraseNumber) => {
    try {
      await adminApi.updatePhrase(phraseNumber, editData);
      setEditingId(null);
      fetchPhrases();
    } catch (err) {
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (phraseNumber) => {
    if (!window.confirm(`Deseja realmente excluir a frase ${phraseNumber}?`)) return;
    try {
      await adminApi.deletePhrase(phraseNumber);
      fetchPhrases();
    } catch (err) {
      alert('Erro ao excluir: ' + (err.response?.data?.error || err.message));
    }
  };

  const getNextPhraseNumber = () => {
    if (phrases.length === 0) return 1;
    const usedNumbers = new Set(phrases.map(p => p.phrase_number));
    for (let i = 1; i <= 50; i++) {
      if (!usedNumbers.has(i)) return i;
    }
    return null;
  };

  const handleCreate = async () => {
    const nextNumber = getNextPhraseNumber();
    if (!nextNumber) {
      alert('Limite de 50 frases atingido. Exclua uma frase antes de criar outra.');
      return;
    }
    try {
      await adminApi.createPhrase({
        ...newPhrase,
        phrase_number: nextNumber,
        duration_seconds: parseFloat(newPhrase.duration_seconds) || 0,
        audio_url: '',
        module_id: newPhrase.module_id ? parseInt(newPhrase.module_id) : null,
      });
      setShowNewForm(false);
      setNewPhrase({ text_en: '', text_pt: '', category: 'general', duration_seconds: 0, module_id: filterModule?.id || '' });
      fetchPhrases();
    } catch (err) {
      alert('Erro ao criar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUploadClick = (phraseNumber) => {
    setUploadTarget(phraseNumber);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;
    const target = uploadTarget;
    setUploadProgress({ phraseNumber: target, percent: 0 });
    try {
      await adminApi.uploadAudio(target, file, '', (percent) => {
        setUploadProgress({ phraseNumber: target, percent });
      });
      fetchPhrases();
    } catch (err) {
      alert('Erro ao enviar audio: ' + (err.response?.data?.error || err.message));
    }
    setUploadProgress(null);
    e.target.value = '';
    setUploadTarget(null);
  };

  const handleDeleteAudio = async (phraseNumber) => {
    if (!window.confirm(`Remover audio da frase ${phraseNumber}?`)) return;
    try {
      await adminApi.deleteAudio(phraseNumber);
      fetchPhrases();
    } catch (err) {
      alert('Erro ao remover audio: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteAllAudios = async () => {
    if (!window.confirm('Tem certeza que deseja remover TODOS os audios? Esta acao nao pode ser desfeita.')) return;
    try {
      await adminApi.deleteAllAudios();
      alert('Todos os audios foram removidos.');
      fetchPhrases();
    } catch (err) {
      alert('Erro ao remover audios: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) return <div className="admin-loading">Carregando frases...</div>;

  const canCreate = getNextPhraseNumber() !== null;

  return (
    <div>
      <input
        type="file"
        accept=".mp3,.m4a,.aac,.ogg,.wav,.webm,.flac,audio/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="admin-table-wrap">
        <div className="admin-table-header">
          <div className="admin-table-header-main" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBack && (
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={onBack}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Voltar
              </button>
            )}
            <div className="admin-table-title">
              {filterModule ? `Frases - ${filterModule.name}` : 'Gerenciar Frases'} ({filteredPhrases.length})
            </div>
          </div>
          <div className="admin-table-header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {!filterModule && (
              <div className="admin-filters">
                <button
                  className={`admin-filter-btn ${!filter ? 'active' : ''}`}
                  onClick={() => setFilter('')}
                >Todas</button>
                {modules.map(m => (
                  <button
                    key={m.id}
                    className={`admin-filter-btn ${filter === String(m.id) ? 'active' : ''}`}
                    onClick={() => setFilter(String(m.id))}
                  >{m.name}</button>
                ))}
              </div>
            )}
            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={handleDeleteAllAudios} title="Remover todos os audios">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Remover Todos Audios
            </button>
            <button className="admin-btn admin-btn-primary" onClick={() => setShowNewForm(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova Frase
            </button>
          </div>
        </div>

        <div className="admin-table-scroll">
          <table className="admin-table admin-table-mobile admin-table-phrases">
            <thead>
              <tr>
                <th style={{ width: '36px' }}></th>
                <th>#</th>
                <th>Ingles</th>
                <th>Portugues</th>
                <th>Modulo</th>
                <th>Audio</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredPhrases.map((phrase, index) => (
                editingId === phrase.id ? (
                  <tr key={phrase.id} style={{ background: '#f8fafc' }}>
                    <td data-label="Mover"></td>
                    <td data-label="#"><strong>{index + 1}</strong></td>
                    <td data-label="Ingles">
                      <input
                        className="admin-input"
                        value={editData.text_en}
                        onChange={e => setEditData({ ...editData, text_en: e.target.value })}
                      />
                    </td>
                    <td data-label="Portugues">
                      <input
                        className="admin-input"
                        value={editData.text_pt}
                        onChange={e => setEditData({ ...editData, text_pt: e.target.value })}
                      />
                    </td>
                    <td data-label="Modulo">
                      <select
                        className="admin-select"
                        value={editData.module_id || ''}
                        onChange={e => setEditData({ ...editData, module_id: e.target.value ? parseInt(e.target.value) : null })}
                      >
                        <option value="">Sem modulo</option>
                        {modules.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Audio">
                      <button
                        className={`admin-audio-btn ${playingId === phrase.id ? 'playing' : ''}`}
                        onClick={() => handlePlay(phrase)}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          {playingId === phrase.id
                            ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                            : <path d="M8 5v14l11-7z"/>
                          }
                        </svg>
                      </button>
                    </td>
                    <td data-label="Acoes">
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleSave(phrase.phrase_number)}>
                          Salvar
                        </button>
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setEditingId(null)}>
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={phrase.id}
                    draggable
                    onDragStart={e => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={e => handleDragOver(e, index)}
                    onDrop={e => handleDrop(e, index)}
                    style={{
                      transition: 'background 0.15s, border-color 0.15s',
                      ...(dragOverIndex === index && dragIndex !== index
                        ? { borderTop: '3px solid #1e3a5f', background: '#f0f4ff' }
                        : {}),
                      ...(dragIndex === index ? { opacity: 0.4 } : {}),
                    }}
                  >
                    <td data-label="Mover" style={{ padding: '8px 4px', textAlign: 'center' }}>
                      <DragHandle />
                    </td>
                    <td data-label="#"><strong>{index + 1}</strong></td>
                    <td data-label="Ingles">{phrase.text_en}</td>
                    <td data-label="Portugues" style={{ color: '#64748b' }}>{phrase.text_pt}</td>
                    <td data-label="Modulo">
                      <span className="admin-badge admin-badge-info">
                        {modules.find(m => m.id === phrase.module_id)?.name || 'Sem modulo'}
                      </span>
                    </td>
                    <td data-label="Audio">
                      {uploadProgress && uploadProgress.phraseNumber === phrase.phrase_number ? (
                        <CircularProgress percent={uploadProgress.percent} />
                      ) : phrase.audio_url ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            className={`admin-audio-btn ${playingId === phrase.id ? 'playing' : ''}`}
                            onClick={() => handlePlay(phrase)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              {playingId === phrase.id
                                ? <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>
                                : <path d="M8 5v14l11-7z"/>
                              }
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAudio(phrase.phrase_number)}
                            title="Remover audio"
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer',
                              color: '#ef4444', opacity: 0.6, padding: '2px',
                              display: 'flex', alignItems: 'center', transition: 'opacity 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleUploadClick(phrase.phrase_number)}
                          title="Enviar audio"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: '#fef3c7', border: '1px dashed #f59e0b',
                            borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
                            color: '#92400e', fontSize: '11px', fontWeight: 500,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          Sem audio
                        </button>
                      )}
                    </td>
                    <td data-label="Acoes">
                      <div className="admin-actions">
                        <button className="admin-action-btn edit" onClick={() => handleEdit(phrase)} title="Editar">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="admin-action-btn upload" onClick={() => handleUploadClick(phrase.phrase_number)} title={phrase.audio_url ? 'Trocar Audio' : 'Enviar Audio'}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                        </button>
                        <button className="admin-action-btn delete" onClick={() => handleDelete(phrase.phrase_number)} title="Excluir Frase">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewForm && (
        <div className="admin-modal-overlay" onClick={() => setShowNewForm(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h2 className="admin-modal-title">Nova Frase</h2>
            {!canCreate && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px',
                padding: '10px 14px', marginBottom: '16px', color: '#991b1b', fontSize: '14px', fontWeight: 500,
              }}>
                Limite de 50 frases atingido. Exclua uma frase para liberar espaco.
              </div>
            )}
            <div className="admin-phrase-edit-grid">
              <div className="admin-phrase-edit-field">
                <label>Modulo</label>
                <select
                  className="admin-select"
                  value={newPhrase.module_id}
                  onChange={e => setNewPhrase({ ...newPhrase, module_id: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="">Sem modulo</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="admin-phrase-edit-field">
                <label>Texto em Ingles</label>
                <input
                  className="admin-input"
                  value={newPhrase.text_en}
                  onChange={e => setNewPhrase({ ...newPhrase, text_en: e.target.value })}
                  placeholder="Where is the gate?"
                />
              </div>
              <div className="admin-phrase-edit-field">
                <label>Traducao (Portugues)</label>
                <input
                  className="admin-input"
                  value={newPhrase.text_pt}
                  onChange={e => setNewPhrase({ ...newPhrase, text_pt: e.target.value })}
                  placeholder="Onde fica o portao?"
                />
              </div>
              <div className="admin-phrase-edit-field">
                <label>Duracao (segundos)</label>
                <input
                  className="admin-input"
                  type="number"
                  step="0.1"
                  value={newPhrase.duration_seconds}
                  onChange={e => setNewPhrase({ ...newPhrase, duration_seconds: e.target.value })}
                />
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowNewForm(false)}>Cancelar</button>
              <button className="admin-btn admin-btn-primary" onClick={handleCreate} disabled={!canCreate}>Criar Frase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhrasesSection;
