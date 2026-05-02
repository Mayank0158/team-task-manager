import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

export default function Project() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
  const [filter, setFilter] = useState('all');
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { fetchData(); }, [id]);

  const isAdmin = project?.admin?._id === currentUser._id;

  const fetchData = async () => {
    try {
      const [pRes, tRes] = await Promise.all([API.get(`/projects/${id}`), API.get(`/tasks/project/${id}`)]);
      setProject(pRes.data);
      setTasks(tRes.data);
    } catch { toast.error('Failed to load project'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = { ...form, project: id };
      if (!payload.assignedTo) delete payload.assignedTo;
      const { data } = await API.post('/tasks', payload);
      setTasks([data, ...tasks]);
      setForm({ title: '', description: '', dueDate: '', priority: 'medium', assignedTo: '' });
      setShowForm(false);
      toast.success('Task created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create task'); }
    finally { setCreating(false); }
  };

  const handleStatusUpdate = (taskId, newStatus) => {
    setTasks(tasks.map((t) => t._id === taskId ? { ...t, status: newStatus } : t));
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    try {
      const { data } = await API.post(`/projects/${id}/members`, { email: memberEmail });
      setProject(data);
      setMemberEmail('');
      toast.success('Member added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add member'); }
    finally { setAddingMember(false); }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const { data } = await API.delete(`/projects/${id}/members/${userId}`);
      setProject(data);
      toast.success('Member removed');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to remove member'); }
  };

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
  const counts = { all: tasks.length, todo: tasks.filter((t) => t.status === 'todo').length, 'in-progress': tasks.filter((t) => t.status === 'in-progress').length, done: tasks.filter((t) => t.status === 'done').length };

  const inputCls = "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-white p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950"><Navbar />
      <div className="flex items-center justify-center h-[70vh]"><p className="text-slate-500 dark:text-gray-400">Loading...</p></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <Link to="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">{project?.name}</h1>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                {tasks.length} task{tasks.length !== 1 ? 's' : ''} · Admin: {project?.admin?.name}
                {isAdmin && <span className="ml-2 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">Admin</span>}
                {!isAdmin && <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">Member</span>}
              </p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium cursor-pointer">
                {showForm ? 'Cancel' : '+ Add Task'}
              </button>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5 mb-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-3">Team Members</h3>
            <div className="space-y-2 mb-4">
              {project?.members?.map((m) => (
                <div key={m._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <span className="text-sm text-slate-700 dark:text-gray-300">{m.name}</span>
                    <span className="text-xs text-slate-400 dark:text-gray-500 ml-2">{m.email}</span>
                    {m._id === project.admin._id && <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">(Admin)</span>}
                  </div>
                  {m._id !== project.admin._id && (
                    <button onClick={() => handleRemoveMember(m._id)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Remove</button>
                  )}
                </div>
              ))}
            </div>
            <form onSubmit={handleAddMember} className="flex gap-2">
              <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="Add member by email" required className={`${inputCls} flex-1 text-sm`} />
              <button type="submit" disabled={addingMember} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer">{addingMember ? 'Adding...' : 'Add'}</button>
            </form>
          </div>
        )}

        {showForm && isAdmin && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5 mb-6">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-3">New Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <input type="text" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className={inputCls} />
              <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={`${inputCls} resize-none`} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputCls}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-gray-400 mb-1">Assign To</label>
                  <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className={inputCls}>
                    <option value="">Self</option>
                    {project?.members?.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={creating} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 cursor-pointer">{creating ? 'Creating...' : 'Create Task'}</button>
            </form>
          </div>
        )}

        <div className="flex gap-2 mb-4">
          {[['all', 'All'], ['todo', 'To Do'], ['in-progress', 'In Progress'], ['done', 'Done']].map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer ${filter === key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-slate-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((task) => <TaskCard key={task._id} task={task} onStatusUpdate={handleStatusUpdate} />)}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-slate-500 dark:text-gray-400">{!isAdmin ? 'No tasks assigned to you yet.' : `No tasks ${filter !== 'all' ? `with status "${filter}"` : 'yet'}. Click "Add Task" to create one.`}</p>
          </div>
        )}
      </main>
    </div>
  );
}
