import api from 'common/services/api'
export const authService = {
  signup: async (data) => { const r = await api.post('/auth/register', data); return r.data.data; },
  login:  async (data) => { const r = await api.post('/auth/login', data);  return r.data.data; },
  refresh: async () => { const r = await api.post('/auth/refresh', {}); return r.data.data; },
  logout: async () => { await api.post('/auth/logout'); },
};

