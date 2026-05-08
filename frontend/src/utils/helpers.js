export const getAudioUrl = (audioPath) => {
  if (!audioPath) return '';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  // Remove /api do final da URL para obter a base do servidor
  const base = apiUrl.replace(/\/api\/?$/, '');
  return `${base}${audioPath}`;
};
