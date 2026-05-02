import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ProjectCard from '../components/ProjectCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([API.get('/projects'), API.get('/tasks/dashboard')]);
      setProjects(pRes.data);
      setStats(sRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setCreating(true);
    try {
      const { data } = await API.post('/projects', { name: projectName });
      setProjects([data, ...projects]);
      setProjectName('');
      setShowModal(false);
      toast.success('Project created!');
    } catch { toast.error('Failed to create project'); }
    finally { setCreating(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-slate-500 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Hello, {user.name || 'User'}</h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Here&apos;s your task overview</p>
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {[
                { label: 'Total Tasks', value: stats.totalTasks },
                { label: 'To Do', value: stats.todoTasks },
                { label: 'In Progress', value: stats.inProgressTasks },
                { label: 'Done', value: stats.doneTasks },
                { label: 'Overdue', value: stats.overdueTasks },
              ].map((s) => (
                <div key={s.label} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
                  <p className="text-2xl font-semibold text-slate-800 dark:text-white">{s.value}</p>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {stats.tasksPerUser && stats.tasksPerUser.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5 mb-8">
                <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-3">Tasks Per User</h3>
                <div className="space-y-2">
                  {stats.tasksPerUser.map((u) => (
                    <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <span className="text-sm text-slate-700 dark:text-gray-300">{u.name || 'Unassigned'}</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{u.count} task{u.count !== 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Your Projects</h2>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium cursor-pointer">+ New Project</button>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-slate-500 dark:text-gray-400 mb-4">No projects yet. Create your first project to get started.</p>
            <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium cursor-pointer">Create Project</button>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md relative">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreate}>
              <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" required autoFocus className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-slate-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm cursor-pointer">Cancel</button>
                <button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer">{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
