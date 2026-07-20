import { Calendar, Trash2, Pencil } from 'lucide-react';

const priorityStyles = {
  High: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Done') return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
};

const TaskCard = ({ task, onEdit, onDelete, draggable, onDragStart }) => {
  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => onDragStart(e, task)}
      className="group card cursor-grab space-y-2.5 p-3.5 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>
      )}

      <div className="flex items-center justify-between pt-1">
        {task.dueDate ? (
          <span
            className={`flex items-center gap-1 text-xs ${
              overdue ? 'font-medium text-red-600 dark:text-red-400' : 'text-slate-400'
            }`}
          >
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            {overdue && ' · overdue'}
          </span>
        ) : (
          <span />
        )}

        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800"
            aria-label="Edit task"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
