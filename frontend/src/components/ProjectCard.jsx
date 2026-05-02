import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
  const memberCount = project.members?.length || 0;

  return (
    <Link to={`/project/${project._id}`} className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
        <h3 className="text-base font-semibold text-slate-800 dark:text-white">{project.name}</h3>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">by {project.admin?.name || 'Unknown'}</p>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-slate-500 dark:text-gray-400">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
          <span className="text-sm text-blue-600 dark:text-blue-400">Open →</span>
        </div>
      </div>
    </Link>
  );
}
