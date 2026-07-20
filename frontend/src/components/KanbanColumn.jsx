import TaskCard from './TaskCard';

const KanbanColumn = ({ title, status, tasks, onEdit, onDelete, onDrop, accentClass }) => {
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    onDrop(taskId, status);
  };
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('taskId', task._id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex min-h-[300px] flex-1 flex-col rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-900/50"
    >
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${accentClass}`} />
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
            Drop tasks here
          </p>
        )}
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            draggable
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
