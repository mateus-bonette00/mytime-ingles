import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/shared/Icon';
import { getAudioUrl } from '../utils/helpers';
import './LessonPage.css';

const LessonPage = () => {
  const { phraseNumber } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const autoCompleteInFlightRef = useRef(false);

  const [phrase, setPhrase] = useState(null);
  const [totalPhrases, setTotalPhrases] = useState(25);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fetchPhrase = useCallback(async () => {
    try {
      const [phraseRes, phrasesRes] = await Promise.all([
        api.get(`/progress/phrases/${phraseNumber}`),
        api.get('/progress/phrases')
      ]);
      setPhrase(phraseRes.data.phrase);
      setTotalPhrases(phrasesRes.data.phrases.length);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar frase:', error);
      setLoading(false);
    }
  }, [phraseNumber]);

  useEffect(() => {
    fetchPhrase();
  }, [fetchPhrase]);

  useEffect(() => {
    // Reset audio when phrase changes
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [phraseNumber]);

  const handlePlayPause = () => {
    if (playing) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setPlaying(!playing);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePrevious = () => {
    if (parseInt(phraseNumber) > 1) {
      navigate(`/lessons/${parseInt(phraseNumber) - 1}`);
    }
  };

  const handleNext = () => {
    if (parseInt(phraseNumber) < totalPhrases) {
      navigate(`/lessons/${parseInt(phraseNumber) + 1}`);
    }
  };

  const handleRepeat = () => {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
  };

  const markAsCompleted = async () => {
    if (!phrase || phrase.user_completed || autoCompleteInFlightRef.current) return;

    autoCompleteInFlightRef.current = true;
    try {
      await api.post(`/progress/phrases/${phraseNumber}/complete`);
      setPhrase((current) => (
        current
          ? { ...current, user_completed: true, user_completed_at: new Date().toISOString() }
          : current
      ));
    } catch (error) {
      console.error('Erro ao marcar frase como concluida:', error);
    } finally {
      autoCompleteInFlightRef.current = false;
    }
  };

  const toggleCompleted = async () => {
    try {
      if (!phrase) return;

      if (phrase.user_completed) {
        await api.post(`/progress/phrases/${phraseNumber}/incomplete`);
        setPhrase((current) => (
          current
            ? { ...current, user_completed: false, user_completed_at: null }
            : current
        ));
      } else {
        await api.post(`/progress/phrases/${phraseNumber}/complete`);
        setPhrase((current) => (
          current
            ? { ...current, user_completed: true, user_completed_at: new Date().toISOString() }
            : current
        ));
      }
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  const handleAudioEnded = async () => {
    setPlaying(false);
    await markAsCompleted();
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryInfo = () => {
    if (phrase?.module_name) {
      return { name: phrase.module_name, icon: 'headphones', color: '#1E4BA0' };
    }
    const categories = {
      airport: { name: 'Aeroporto e Imigração', icon: 'plane', color: '#3b82f6' },
      hotel: { name: 'Hotel', icon: 'hotel', color: '#8b5cf6', svgSrc: '/hotel-svgrepo-com.svg' },
      restaurant: { name: 'Restaurante', icon: 'restaurant', color: '#ec4899' },
      shopping: { name: 'Compras', icon: 'shopping', color: '#f59e0b' },
      transport: { name: 'Transporte', icon: 'taxi', color: '#10b981', svgSrc: '/transport-svgrepo-com.svg' },
      emergency: { name: 'Emergências', icon: 'emergency', color: '#ef4444', svgSrc: '/emergency-kit-svgrepo-com.svg' }
    };
    return categories[phrase?.category] || categories.airport;
  };

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!phrase) {
    return (
      <div className="lesson-error">
        <p>Frase não encontrada</p>
        <button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</button>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo();
  const progressPercent = (currentTime / duration) * 100 || 0;

  return (
    <div className="lesson-page">
      <header className="lesson-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <Icon name="arrowLeft" size={20} />
          <span>Dashboard</span>
        </button>
        <div className="lesson-brand-pill">
          <h2 className="lesson-brand-title">Inglês na Mala</h2>
          <p className="lesson-brand-sub">com Teacher Ediane</p>
        </div>
        <img src="/mytime_logo.jpeg" alt="MyTime Inglês" className="lesson-logo" />
      </header>

      <div className="lesson-container">
        <img
          src="/lets-start.png"
          alt="Let's Start"
          className="lesson-side-image"
        />
        <div className="lesson-card-wrapper">
          <div className="lesson-card">
            {/* Category Badge */}
            <div className="category-badge" style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}>
              {categoryInfo.svgSrc ? (
                <img src={categoryInfo.svgSrc} alt={categoryInfo.name} className="category-svg-icon" style={{ filter: `brightness(0) saturate(100%)` }} />
              ) : (
                <Icon name={categoryInfo.icon} size={20} color={categoryInfo.color} />
              )}
              <span>{categoryInfo.name}</span>
            </div>

            {/* Phrase Counter */}
            <div className="phrase-counter">
              <span className="counter-text">Frase</span>
              <span className="counter-number">{phraseNumber}</span>
              <span className="counter-total">de {totalPhrases}</span>
            </div>

            {/* English Text */}
            <div className="phrase-content">
              <h1 className="phrase-text-en">{phrase.text_en}</h1>
              {phrase.text_pt && <p className="phrase-text-pt">{phrase.text_pt}</p>}
            </div>

            {/* Audio Player */}
            <div className="audio-player">
              <audio
                ref={audioRef}
                src={getAudioUrl(phrase.audio_url)}
                preload="auto"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
                onError={(e) => console.error('Erro ao carregar audio:', e.target.error)}
              />

              <button className="play-button" onClick={handlePlayPause}>
                <Icon name={playing ? 'pause' : 'play'} size={32} color="white" />
              </button>

              {/* Progress Bar */}
              <div className="player-controls">
                <span className="time-display">{formatTime(currentTime)}</span>
                <div className="progress-track" onClick={handleSeek}>
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <span className="time-display">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                className="action-btn secondary"
                disabled={parseInt(phraseNumber) === 1}
                onClick={handlePrevious}
              >
                <Icon name="back" size={20} />
                <span>Anterior</span>
              </button>

              <button className="action-btn primary" onClick={handleRepeat}>
                <Icon name="repeat" size={20} />
                <span>Repetir</span>
              </button>

              <button
                className="action-btn secondary"
                disabled={parseInt(phraseNumber) >= totalPhrases}
                onClick={handleNext}
              >
                <span>Próxima</span>
                <Icon name="skip" size={20} />
              </button>
            </div>

            {/* Checkbox */}
            <label className="completed-checkbox">
              <input
                type="checkbox"
                checked={phrase.user_completed}
                onChange={toggleCompleted}
              />
              <div className="checkbox-custom">
                {phrase.user_completed && <Icon name="check" size={16} color="white" />}
              </div>
              <span>Marcada automaticamente ao fim do áudio</span>
            </label>
          </div>
        </div>

        {/* Teacher Footer */}
        <div className="lesson-teacher-footer">
          <a href="https://www.instagram.com/teacher.ediane/" target="_blank" rel="noopener noreferrer" className="lesson-instagram-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            <span>@teacher.ediane</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
