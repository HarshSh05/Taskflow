import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'features/auth/context/AuthContext'
import { projectService } from 'features/project/services/projectService'
import Navbar from 'common/components/Navbar'

const COLORS = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-teal-500','bg-indigo-500'];
const getColor = (id) => COLORS[(id || 0) % COLORS.length];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || "" );
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { if (!successMsg) return;
    const timer = setTimeout(() => {
     setSuccessMsg("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [successMsg]);
  useEffect(() => {
    if (location.state?.message) {
        window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchProjects = async () => {
    try { setProjects(await projectService.getAll()); }
    catch { setError('Failed to load projects.'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError('');
    try {
      const p = await projectService.create(form);
      setProjects(prev => [p, ...prev]);
      setShowModal(false); setForm({ name: '', description: '' });
      navigate(`/projects/${p.id}`, {
        state: {
          message: `"${p.name}" created successfully`
       }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally { setCreating(false); }
  };
  
  const handleDelete = async (id) => {
  if (!window.confirm("Delete this project?")) return;

  try {
    await projectService.remove(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  } catch (err) {
    alert(err.response?.data?.message || "Failed to delete project.");
  }
};

const handleArchive = async (project) => {
  try {
    await projectService.archive(project.id, !project.archived);

    setProjects(prev =>
      prev.map(p =>
        p.id === project.id
          ? { ...p, archived: !p.archived }
          : p
      )
    );
  } catch (err) {
    alert(err.response?.data?.message || "Failed to archive project.");
  }
};

const handleUpdate = async (e) => {
  e.preventDefault();

  try {
    const updated = await projectService.update(editingProject.id, {
      name: editingProject.name,
      description: editingProject.description
    });

    setProjects(prev =>
      prev.map(p => p.id === updated.id ? updated : p)
    );

    setEditingProject(null);
  } catch (err) {
    alert(err.response?.data?.message || "Failed to update project.");
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good to see you, {user?.username} 👋</h1>
            <p className="text-gray-500 mt-0.5 text-sm">Manage your projects and tasks</p>
            {successMsg && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 shadow-sm">
                <span className="text-lg">✅</span>
                <span>{successMsg}</span>
              </div>
            )}
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">No projects yet</h2>
            <p className="text-gray-500 text-sm mb-6">Create your first project to get started</p>
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-all">
              Create project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <Link  key={project.id} to={`/projects/${project.id}`} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-200 transition-all">
                <div className={`w-10 h-10 ${getColor(project.id)} rounded-xl mb-4 flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold">{project.name?.charAt(0).toUpperCase()}</span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 truncate">{project.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{project.description || 'No description'}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                    </svg>
                    {project.taskCount || 0} tasks
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857" />
                    </svg>
                    {project.members?.length || 1} members
                  </span>
                  <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : ''}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create new project</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project name *</label>
                <input type="text" required maxLength={100} value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My awesome project" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What is this project about?" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

