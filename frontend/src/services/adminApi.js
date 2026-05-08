import api from './api';

const adminApi = {
  getStats: () => api.get('/admin/dashboard'),
  getPhrases: () => api.get('/admin/phrases'),
  createPhrase: (data) => api.post('/admin/phrases', data),
  updatePhrase: (phraseNumber, data) => api.put(`/admin/phrases/${phraseNumber}`, data),
  deletePhrase: (phraseNumber) => api.delete(`/admin/phrases/${phraseNumber}`),
  reorderPhrases: (items) => api.put('/admin/phrases/reorder', { items }),
  uploadAudio: (phraseNumber, file, variant = '', onProgress) => {
    const formData = new FormData();
    formData.append('audio', file);
    return api.post(
      `/admin/phrases/${phraseNumber}/audio${variant ? '?variant=b' : ''}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress
          ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
          : undefined,
      }
    );
  },
  deleteAudio: (phraseNumber) => api.delete(`/admin/phrases/${phraseNumber}/audio`),
  deleteAllAudios: () => api.delete('/admin/audios'),
  getStudents: () => api.get('/admin/students'),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  createStudent: (data) => api.post('/admin/create-student', data),
  getPurchases: (params) => api.get('/admin/purchases', { params }),
  getSales: (days = 30) => api.get('/admin/sales', { params: { days } }),
  // Modules
  getModules: () => api.get('/admin/modules'),
  createModule: (data) => api.post('/admin/modules', data),
  updateModule: (id, data) => api.put(`/admin/modules/${id}`, data),
  deleteModule: (id) => api.delete(`/admin/modules/${id}`),
  uploadModuleImage: (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/admin/modules/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default adminApi;
