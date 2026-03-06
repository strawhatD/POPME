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
  completedAt?: Date
}

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface HistoryScreenProps {
  completedTasks: Task[]
  onClose: () => void
  onRestore: (taskId: string) => void
}

const priorityColorMap: Record<string, string> = {
  low: '#b2dfdb',
  medium: '#80cbc4',
  high: '#4db8a8',
}

export default function HistoryScreen({ completedTasks, onClose, onRestore }: HistoryScreenProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50 animate-slide-in-right">
      <div className="w-full md:w-96 h-full bg-white rounded-t-3xl md:rounded-3xl p-6 overflow-y-auto font-rounded">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Completed Tasks</h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 hover:text-gray-700 font-bold"
          >
            ×
          </button>
        </div>

        {completedTasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No completed tasks yet!</p>
        ) : (
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl opacity-75 hover:opacity-100 transition flex items-center justify-between"
                style={{
                  backgroundColor: task.color || priorityColorMap[task.priority],
                }}
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{task.title}</h3>
                  <p className="text-sm text-white text-opacity-80 mt-1">
                    Completed {task.completedAt ? formatDate(task.completedAt) : 'recently'}
                  </p>
                </div>
                <button
                  onClick={() => onRestore(task.id)}
                  className="ml-4 px-3 py-1 bg-white text-gray-800 rounded-lg font-semibold text-sm hover:bg-gray-100 transition whitespace-nowrap"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
