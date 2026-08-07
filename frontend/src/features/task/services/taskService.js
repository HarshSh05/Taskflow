import api from 'common/services/api'
export const taskService = {
  getForProject: async (pid)       => { const r = await api.get(`/projects/${pid}/tasks`);    return r.data.data; },
  create:        async (pid, data) => { const r = await api.post(`/projects/${pid}/tasks`, data); return r.data.data; },
  update:        async (id, data)  => { const r = await api.patch(`/tasks/${id}`, data);       return r.data.data; },
  move:          async (id, data)  => { const r = await api.patch(`/tasks/${id}/move`, data);  return r.data.data; },
  remove:        async (id)        => { await api.delete(`/tasks/${id}`); },
};

