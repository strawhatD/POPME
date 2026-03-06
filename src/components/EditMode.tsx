import { useState } from 'react'

interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  subtasks: SubTask[]
  color?: string
  effort?: number
  importance?: number
  createdAt: Date
}

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface EditModeProps {
  task: Task
  onUpdate: (updates: Partial<Task>) => void
  onClose: () => void
  onDelete: () => void
  onAddSubtask: (subtaskTitle: string) => void
  onToggleSubtask: (subtaskId: string) => void
}

const priorityColorMap: Record<string, string> = {
  low: '#b2dfdb',
  medium: '#80cbc4',
  high: '#4db8a8',
}

const colorOptions = ['#b2dfdb', '#80cbc4', '#4db8a8', '#a1d8a8', '#f4a97d', '#d4a5ff', '#7c6fcd']

export default function EditMode({
  task,
  onUpdate,
  onClose,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
}: EditModeProps) {
  const [title, setTitle] = useState(task.title)
  const [dueDate, setDueDate] = useState(task.dueDate || '')
  const [importance, setImportance] = useState(task.importance || 5)
  const [effort, setEffort] = useState(task.effort || 5)
  const [color, setColor] = useState(task.color || priorityColorMap[task.priority])
  const [newSubtask, setNewSubtask] = useState('')

  const handleSave = () => {
    onUpdate({
      title: title || task.title,
      dueDate,
      importance,
      effort,
      color,
    })
    onClose()
  }

  const calculateDaysUntilDue = () => {
    if (!dueDate) return null
    const today = new Date()
    const due = new Date(dueDate)
    const days = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  const daysUntilDue = calculateDaysUntilDue()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto font-rounded">
        {daysUntilDue !== null && (
          <div className="text-sm text-lavender font-semibold mb-4">
            {daysUntilDue > 0
              ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`
              : daysUntilDue === 0
              ? 'Due today!'
              : `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Task</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Task Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border-2 border-mint rounded-lg focus:outline-none focus:border-lavender"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-mint rounded-lg focus:outline-none focus:border-lavender"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Importance: {importance}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Effort: {effort}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={effort}
              onChange={(e) => setEffort(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-transform ${color === c ? 'ring-2 ring-lavender scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {task.subtasks.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subtasks</label>
              <div className="space-y-2">
                {task.subtasks.map((subtask) => (
                  <label key={subtask.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => onToggleSubtask(subtask.id)}
                      className="w-4 h-4"
                    />
                    <span className={subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                      {subtask.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Add Subtask</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="New subtask..."
                className="flex-1 px-4 py-2 border-2 border-mint rounded-lg focus:outline-none focus:border-lavender"
              />
              <button
                onClick={() => {
                  if (newSubtask.trim()) {
                    onAddSubtask(newSubtask)
                    setNewSubtask('')
                  }
                }}
                className="px-4 py-2 bg-mint text-white rounded-lg font-semibold hover:bg-opacity-80 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-lavender text-white rounded-lg font-semibold hover:bg-opacity-80 transition"
          >
            Save
          </button>
        </div>

        <button
          onClick={onDelete}
          className="w-full mt-3 px-4 py-2 bg-red-400 text-white rounded-lg font-semibold hover:bg-red-500 transition"
        >
          Delete
        </button>
      </div>
    </div>
  )
}
