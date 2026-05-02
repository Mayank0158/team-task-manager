import { useState } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const priorityColors = {
  low: 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400',
  high: 'text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors = {
  'todo': 'text-gray-500 dark:text-gray-400',
  'in-progress': 'text-blue-600 dark:text-blue-400',
  'done': 'text-green-600 dark:text-green-400',
};

export default function TaskCard({ task, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'done';

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      await API.patch(`/tasks/${task._id}/status`, { status: newStatus });
      onStatusUpdate(task._id, newStatus);
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">{task.title}</h4>
          {task.description && (
            <p className="text-sm text-slate-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${priorityColors[task.priority] || priorityColors.medium}`}>
          {task.priority}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-3 text-sm text-slate-500 dark:text-gray-400">
        <span className={isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : ''}>
          {formatDate(task.dueDate)}{isOverdue ? ' (Overdue)' : ''}
        </span>
        {task.assignedTo && (
          <span>· {task.assignedTo.name}</span>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          className={`text-sm border border-gray-300 dark:border-gray-600 p-1.5 rounded bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[task.status] || ''} disabled:opacity-50`}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}
