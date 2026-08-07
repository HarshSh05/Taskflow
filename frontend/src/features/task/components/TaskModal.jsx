import React, { useState, useEffect } from 'react';
import { taskService } from 'features/task/services/taskService'

const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];
const PRI_STYLE  = { CRITICAL: 'bg-rose-100 text-rose-700', HIGH: 'bg-red-100 text-red-700', MEDIUM: 'bg-amber-100 text-amber-700', LOW: 'bg-green-100 text-green-700' };

export default function TaskModal({ task, projectId, members, columns, defaultColumnId, onSave, onDelete, onClose }) {
  const isNew = !task;
  const [form, setForm] = useState({
    title: '', description: '', columnId: defaultColumnId || columns?.[0]?.id || '',
    priority: 'MEDIUM', deadline: '', assigneeId: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) setForm({
      title: task.title || '', description: task.description || '',
      columnId: task.columnId || '', priority: task.priority || 'MEDIUM',
      deadline: task.deadline || '', assigneeId: task.assignee?.id || '',
    });
  }, [task]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { ...form, columnId: Number(form.columnId), assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        deadline: form.deadline || null, ...(isNew ? {} : { version: task.version }) };
      const saved = isNew
        ? await taskService.create(projectId, payload)
        : await taskService.update(task.id, payload);
      onSave(saved, isNew);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save task.');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) { setConfirmDel(true); return; }
    setDeleting(true);
    try { await taskService.remove(task.id); onDelete(task.id); }
    catch { setError('Only admin can delete the task. '); setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{isNew ? 'Create task' : 'Edit task'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
            <input type="text" required maxLength={200} value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What needs to be done?" autoFocus={isNew} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Add more details..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Column</label>
              <select value={form.columnId} onChange={e => setForm({ ...form, columnId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {(columns || []).map(column => <option key={column.id} value={column.id}>{column.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0)+p.slice(1).toLowerCase()}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deadline</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Assignee</label>
              <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Unassigned</option>
                {(members || []).map(m => <option key={m.userId} value={m.userId}>{m.username}</option>)}
              </select>
            </div>
          </div>

          {/* Priority preview */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Preview:</span>
            <span className={`px-2 py-0.5 rounded-full font-medium ${PRI_STYLE[form.priority]}`}>
              {form.priority.charAt(0)+form.priority.slice(1).toLowerCase()}
            </span>
            <span className="text-gray-400">→ {(columns || []).find(c => String(c.id) === String(form.columnId))?.name}</span>
          </div>

          {!isNew && task && (
            <div className="pt-2 border-t border-gray-100 text-xs text-gray-400 space-y-0.5">
              <p>Created by <span className="text-gray-500 font-medium">{task.createdBy?.username}</span></p>
              <p>Created {task.createdAt ? new Date(task.createdAt).toLocaleString() : ''}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
          {!isNew && (
            <button type="button" onClick={handleDelete} disabled={deleting}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors disabled:opacity-60 ${confirmDel ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-600 border border-red-200 hover:bg-red-50'}`}>
              {deleting ? 'Deleting...' : confirmDel ? 'Confirm delete?' : 'Delete'}
            </button>
          )}
          <div className="flex gap-3 ml-auto">
            <button type="button" onClick={() => { setConfirmDel(false); onClose(); }}
              className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60">
              {saving ? 'Saving...' : isNew ? 'Create task' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

