import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { projectService } from 'features/project/services/projectService'
import { taskService } from 'features/task/services/taskService'
import { useWebSocket } from 'features/realtime/hooks/useWebSocket'
import Navbar from 'common/components/Navbar'
import TaskModal from 'features/task/components/TaskModal'
import MembersPanel from 'features/project/components/MembersPanel'
import DeleteProjectModal from 'features/project/components/DeleteProjectModal'
import EditProjectModal from 'features/project/components/EditProjectModal'
import ArchiveProjectModal from "features/project/components/ArchiveProjectModal"
import { useAuth } from 'features/auth/context/AuthContext';

const DOTS = ['bg-gray-400', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'];

const PRI = {
  HIGH:   'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  LOW:    'bg-green-100 text-green-700 border border-green-200',
};

export default function ProjectPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [selectedTask, setSelectedTask]   = useState(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [createColumnId, setCreateColumnId] = useState(null);
  const [showMembers, setShowMembers]     = useState(false);
  const [liveMsg, setLiveMsg]             = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [editForm, setEditForm] = useState({
     name: '',
     description: ''
  });

  // ── WebSocket handler ───────────────────────────────────────
  const handleWs = useCallback((msg) => {
    const { type, payload } = msg;

    const flash = (text) => { setLiveMsg(text); setTimeout(() => setLiveMsg(''), 2500); };

    switch (type) {
      case 'TASK_CREATED':
        setTasks(prev => prev.find(t => t.id === payload.id) ? prev : [payload, ...prev]);
        flash(`✚ ${payload.createdBy?.username} created "${payload.title}"`);
        break;
      case 'TASK_UPDATED':
        setTasks(prev => prev.map(t => t.id === payload.id ? payload : t));
        flash(`✎ Task updated`);
        break;
      case 'TASK_MOVED':
        setTasks(prev => prev.map(t => t.id === payload.id ? payload : t));
        flash(`↕ ${payload.actor || 'Someone'} moved a task`);
        break;
      case 'TASK_DELETED':
        setTasks(prev => prev.filter(t => t.id !== payload.taskId));
        flash(`✕ A task was deleted`);
        break;
      case 'USER_JOINED':
        flash(`${msg.actor || 'A collaborator'} is viewing this board`);
        break;
      default: break;
    }
  }, []);

  useWebSocket(projectId, handleWs);

  useEffect(() => { fetchData(); }, [projectId]);

  const fetchData = async () => {
    try {
      const [proj, taskList] = await Promise.all([
        projectService.getById(projectId),
        taskService.getForProject(projectId),
      ]);
      setProject(proj);
      setTasks(taskList);
    } catch { setError('Failed to load project.'); }
    finally   { setLoading(false); }
  };

  const colTasks = (columnId) => tasks.filter(t => String(t.columnId) === String(columnId))
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // ── Drag and drop ───────────────────────────────────────────
  const onDragEnd = async ({ destination, source, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    const columnId = Number(destination.droppableId);
    const taskId    = parseInt(draggableId);

    // Optimistic update
    const original = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId, position: destination.index } : t));

    try {
      const saved = await taskService.move(taskId, { columnId, position: destination.index, version: original.version });
      setTasks(prev => prev.map(t => t.id === taskId ? saved : t));
    } catch (err) {
      setTasks(prev => prev.map(t => t.id === taskId ? original : t));
      if (err.response?.status === 409) {
        await fetchData();
        setLiveMsg('Conflict detected - the latest saved task was loaded.');
      }
    }
  };

  const handleSaved = (saved, isNew) => {
    if (isNew) setTasks(prev => [saved, ...prev.filter(t => t.id !== saved.id)]);
    else       setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
    setSelectedTask(null); setShowCreate(false);
  };

  const handleDeleted = (id) => { setTasks(prev => prev.filter(t => t.id !== id)); setSelectedTask(null); };

  // ── Render guards ───────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="text-center py-20">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/dashboard" className="text-blue-600 text-sm">← Dashboard</Link>
      </div>
    </div>
  );
  
  const { user } = useAuth();

  const handleEdit = () => {
    setEditForm({
        name: project.name,
        description: project.description || ''
    });
    setShowEdit(true);
};

const saveProject = async () => {
    try {
        const updated = await projectService.update(projectId, editForm);
        setProject(updated);
        setShowEdit(false);
        fetchData();
        setLiveMsg("✏️ Project updated successfully");
        setTimeout(() => setLiveMsg(""), 2500);
    } catch (err) {
      console.error(err);
        alert("Unable to update project.");
    }
};

const archiveProject = async () => {

    const wasArchived = project.archived;

    await projectService.archive(projectId, !wasArchived);

    setProject(prev => ({
        ...prev,
        archived: !prev.archived
    }));

    setShowArchive(false);

    setLiveMsg(
        wasArchived
            ? `✅ Project "${project.name}" restored successfully`
            : `📦 Project "${project.name}" archived successfully`
    );

    setTimeout(() => {
        setLiveMsg("");
    }, 3000);

};

const deleteProject = async () => {
    try {

        const deletedProjectName = project.name;

        await projectService.remove(projectId);

        setShowDelete(false);

        navigate("/dashboard", {
            replace: true,
            state: {
                message: `🗑 Project "${deletedProjectName}" deleted successfully`
            }
        });

    } catch (err) {
        console.error(err);
    }
};

  const isOwner = project?.owner?.id === user?.id;
  const currentMember = project?.members?.find(m => m.user?.id === user?.id);
  const isManager = isOwner || currentMember?.role === 'MANAGER' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Project toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-base font-bold text-gray-900">{project?.name}</h1>
              {project?.description && <p className="text-xs text-gray-400">{project.description}</p>}
            </div>

            {/* Live indicator */}
            {liveMsg ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {liveMsg}
              </span>
            ) : (
              project?.archived ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-600">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  Archived
                </span>
              ) : (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Live
                  </span>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {isManager && (
              <>
                <button onClick={handleEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                    ✏️ Edit
                </button>

                <button onClick={() => setShowArchive(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors" >
                    {project?.archived ? "📂 Restore" : "📦 Archive"}
                </button>

                <button onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors">
                    🗑 Delete
                </button>
              </>
            )}

            <button onClick={() => setShowMembers(!showMembers)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
              Members ({project?.members?.length || 0})
            </button>

            <Link to={`/projects/${projectId}/analytics`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </Link>

            <button onClick={() => { setCreateColumnId(project?.columns?.[0]?.id); setShowCreate(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 pb-8">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 min-w-max max-w-7xl mx-auto">
            {(project?.columns || []).map((column, columnIndex) => {
              const cards = colTasks(column.id);
              return (
                <div key={column.id} className="w-72 flex flex-col">
                  {/* Column header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${DOTS[columnIndex % DOTS.length]}`} />
                      <span className="text-sm font-bold text-gray-700">{column.name}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-semibold">{cards.length}</span>
                    </div>
                    <button onClick={() => { setCreateColumnId(column.id); setShowCreate(true); }}
                      className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition-colors" title={`Add to ${column.name}`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Droppable column */}
                  <Droppable droppableId={String(column.id)}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className={`flex-1 rounded-2xl p-2 min-h-32 transition-all ${
                          snapshot.isDraggingOver ? 'bg-blue-50 ring-2 ring-blue-200 ring-inset' : 'bg-gray-100/80'
                        }`}>
                        {cards.map((task, index) => (
                          <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                onClick={() => setSelectedTask(task)}
                                className={`bg-white rounded-xl border p-3 mb-2 cursor-pointer transition-all ${
                                  snapshot.isDragging
                                    ? 'shadow-xl rotate-1 border-blue-300 scale-105'
                                    : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'
                                }`}>
                                {/* Priority + deadline row */}
                                <div className="flex items-start justify-between mb-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRI[task.priority]}`}>
                                    {task.priority?.charAt(0) + task.priority?.slice(1).toLowerCase()}
                                  </span>
                                  {task.deadline && (
                                    <span className={`text-xs flex items-center gap-0.5 ${
                                      new Date(task.deadline) < new Date() && task.columnName !== 'Done'
                                        ? 'text-red-500 font-medium' : 'text-gray-400'
                                    }`}>
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      {new Date(task.deadline).toLocaleDateString('en', { month:'short', day:'numeric' })}
                                    </span>
                                  )}
                                </div>

                                <h4 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-2">{task.title}</h4>
                                {task.description && (
                                  <p className="text-xs text-gray-400 mb-2 line-clamp-1">{task.description}</p>
                                )}

                                {/* Assignee */}
                                {task.assignee ? (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold">
                                      {task.assignee.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-xs text-gray-400">{task.assignee.username}</span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-300">Unassigned</span>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {cards.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-10">
                            <p className="text-xs text-gray-400">No tasks</p>
                            <p className="text-xs text-gray-300">Drop here or click +</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Panels & Modals */}
      {showMembers && (
        <MembersPanel project={project} onClose={() => setShowMembers(false)} onUpdate={fetchData} />
      )}
      {selectedTask && (
        <TaskModal task={selectedTask} projectId={projectId} members={project?.members || []} columns={project?.columns || []}
          onSave={handleSaved} onDelete={handleDeleted} onClose={() => setSelectedTask(null)} />
      )}
      {showCreate && (
        <TaskModal task={null} projectId={projectId} members={project?.members || []}
          columns={project?.columns || []} defaultColumnId={createColumnId} onSave={(t) => handleSaved(t, true)} onClose={() => setShowCreate(false)} />
      )}
      <EditProjectModal open={showEdit} form={editForm} setForm={setEditForm} onClose={() => setShowEdit(false)} onSave={saveProject} />
      <ArchiveProjectModal open={showArchive} project={project} onClose={() => setShowArchive(false)} onConfirm={archiveProject} />
      <DeleteProjectModal open={showDelete} project={project} onClose={() => setShowDelete(false)} onConfirm={deleteProject} />
    </div>
  );
}

