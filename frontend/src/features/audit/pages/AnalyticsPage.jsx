import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from 'features/project/services/projectService'
import Navbar from 'common/components/Navbar'

const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const actionIcon = (a) => ({
  TASK_CREATED: '✅', TASK_MOVED: '↕️', TASK_UPDATED: '✏️',
  TASK_DELETED: '🗑️', PROJECT_CREATED: '🚀',
}[a] || '📋');

const actionText = (log) => {
  const value = log.newValue || log.oldValue || {};
  const task = value.title ? ` “${value.title}”` : '';
  const column = value.columnName ? ` → ${value.columnName}` : '';
  return `${log.action.replaceAll('_', ' ').toLowerCase()}${task}${column}`;
};

export default function AnalyticsPage() {
  const { id: projectId } = useParams();
  const [project,   setProject]   = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activity,  setActivity]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [proj, stats, logs] = await Promise.all([
          projectService.getById(projectId),
          projectService.getAnalytics(projectId),
          projectService.getActivity(projectId),
        ]);
        setProject(proj); setAnalytics(stats); setActivity(logs || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, [projectId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  const total = analytics?.totalTasks || 0;
  const done  = analytics?.doneTasks  || 0;
  const rate  = analytics?.completionRate || 0;

  const statCards = [
    { label: 'Total Tasks',   value: total,                        bg: 'bg-gray-100',   text: 'text-gray-700' },
    { label: 'To Do',         value: analytics?.todoTasks || 0,    bg: 'bg-gray-100',   text: 'text-gray-600' },
    { label: 'In Progress',   value: analytics?.inProgressTasks||0,bg: 'bg-blue-100',   text: 'text-blue-700' },
    { label: 'Review',        value: analytics?.reviewTasks || 0,   bg: 'bg-amber-100',  text: 'text-amber-700' },
    { label: 'Done',          value: done,                          bg: 'bg-emerald-100',text: 'text-emerald-700' },
  ];

  const bars = [
    { label: 'To Do',       count: analytics?.todoTasks||0,       color: 'bg-gray-400' },
    { label: 'In Progress', count: analytics?.inProgressTasks||0, color: 'bg-blue-500' },
    { label: 'Review',      count: analytics?.reviewTasks||0,      color: 'bg-amber-500' },
    { label: 'Done',        count: done,                           color: 'bg-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-8">
          <Link to={`/projects/${projectId}`} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-500 text-sm">{project?.name}</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {statCards.map(({ label, value, bg, text }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <span className={`text-lg font-bold ${text}`}>{value}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Completion rate */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-4">Completion Rate</h2>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-bold text-gray-900">{rate}%</span>
              <span className="text-sm text-gray-400 pb-1">{done} of {total} tasks done</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min(rate, 100)}%` }} />
            </div>
            <div className="space-y-2.5">
              {bars.map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24">{label}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: total ? `${(count/total)*100}%` : '0%' }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-4">
              Team · {analytics?.totalMembers || 0} members
            </h2>
            <div className="space-y-3">
              {(project?.members || []).map(member => (
                <div key={member.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-bold">
                      {member.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.username}</p>
                      <p className="text-xs text-gray-400">{member.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    member.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>{member.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity log */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Activity Log</h2>
          {activity.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">No activity recorded yet</p>
            : (
              <div className="space-y-0.5">
                {activity.map(log => (
                  <div key={log.id} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                    <span className="text-base flex-shrink-0 mt-0.5">{actionIcon(log.action)}</span>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 capitalize">{actionText(log)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        <span className="font-medium text-gray-500">{log.username}</span>
                        {' · '}{timeAgo(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </main>
    </div>
  );
}

