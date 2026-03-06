import { useState } from 'react'
import '../styles/TaskBubble.css'

interface SubTask {
  id: string
  title: string
  completed: boolean
}

interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  subtasks: SubTask[]
  createdAt: Date
}

interface TaskBubbleProps {
  task: Task
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  onAddSubtask: (taskId: string, subtaskTitle: string) => void
  onToggleSubtask: (taskId: string, subtaskId: string) => void
  isEditing: boolean
  onUpdate: (id: string, updates: Partial<Task>) => void
  onStopEditing: () => void
}

export default function TaskBubble({
  task,
  onDelete,
  onEdit,
  onAddSubtask,
  onToggleSubtask,
  isEditing,
  onUpdate,
  onStopEditing,
}: TaskBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [newSubtask, setNewSubtask] = useState('')
  const [editTitle, setEditTitle] = useState(task.title)
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>(task.priority)
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '')

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSubtask.trim()) {
      onAddSubtask(task.id, newSubtask)
      setNewSubtask('')
    }
  }

  const handleSaveEdit = () => {
    onUpdate(task.id, {
      title: editTitle,
      priority: editPriority,
      dueDate: editDueDate || undefined,
    })
    onStopEditing()
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FFB5B5'
      case 'medium': return '#B5D6FF'
      case 'low': return '#B5FFB5'
      default: return '#B5D6FF'
    }
  }

  const completedSubtasks = task.subtasks.filter(st => st.completed).length
  const completionPercentage = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0

  return (
    <div className="task-bubble-wrapper">
      <div
        className={`task-bubble ${isExpanded ? 'expanded' : ''}`}
        style={{ backgroundColor: getPriorityColor(task.priority) }}
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        {!isExpanded && !isEditing && (
          <div className="bubble-content">
            <div className="bubble-title">{task.title}</div>
            {task.dueDate && <div className="bubble-due-date">Due: {task.dueDate}</div>}
            {task.subtasks.length > 0 && (
              <div className="bubble-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <div className="progress-text">{completedSubtasks}/{task.subtasks.length}</div>
              </div>
            )}
          </div>
        )}

        {isExpanded && !isEditing && (
          <div className="bubble-expanded">
            <div className="expanded-header">
              <h3>{task.title}</h3>
              <div className="expanded-actions">
                <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onEdit(task.id) }}>
                  ✏️
                </button>
                <button className="btn-icon delete" onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}>
                  🗑️
                </button>
              </div>
            </div>

            {task.dueDate && <p className="expanded-due-date">Due: {task.dueDate}</p>}

            <div className="priority-badge">Priority: {task.priority}</div>

            <div className="subtasks-section">
              <h4>Subtasks</h4>
              {task.subtasks.length === 0 ? (
                <p className="no-subtasks">No subtasks yet</p>
              ) : (
                <ul className="subtasks-list">
                  {task.subtasks.map(st => (
                    <li key={st.id} className={`subtask-item ${st.completed ? 'completed' : ''}`}>
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => onToggleSubtask(task.id, st.id)}
                      />
                      <span>{st.title}</span>
                    </li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleAddSubtask} className="add-subtask-form">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a subtask..."
                  className="subtask-input"
                />
                <button type="submit" className="btn-add-subtask">+</button>
              </form>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="bubble-edit">
            <h3>Edit Task</h3>
            <div className="edit-form">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="edit-input"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="edit-select"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="edit-input"
                />
              </div>

              <div className="edit-actions">
                <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
                <button className="btn btn-secondary" onClick={() => { setEditTitle(task.title); setEditPriority(task.priority); setEditDueDate(task.dueDate || ''); onStopEditing() }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
