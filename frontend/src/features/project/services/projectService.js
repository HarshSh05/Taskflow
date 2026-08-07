import api from 'common/services/api'
export const projectService = {
  getAll:       async ()       => { const r = await api.get('/projects');                 return r.data.data; },
  getById:      async (id)     => { const r = await api.get(`/projects/${id}`);           return r.data.data; },
  create:       async (data)   => { const r = await api.post('/projects', data);          return r.data.data; },
  update:       async (id, d)  => { const r = await api.put(`/projects/${id}`, d);        return r.data.data; },
  remove:       async (id)     => { await api.delete(`/projects/${id}`); },
  archive:      async (id, archived) => { await api.patch(`/projects/${id}/archived?archived=${archived}`);},
  addMember:    async (id, email) => { const r = await api.post(`/projects/${id}/members`, { email }); return r.data.data; },
  removeMember: async (pid, uid)  => { await api.delete(`/projects/${pid}/members/${uid}`); },
  getAnalytics: async (id)     => { const r = await api.get(`/projects/${id}/analytics`); return r.data.data; },
  getActivity:  async (id, pg=0, sz=20) => { const r = await api.get(`/projects/${id}/activity?page=${pg}&size=${sz}`); return r.data.data; },
};

