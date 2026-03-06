import { useState, useRef } from 'react'
import TaskBubble from './TaskBubble'
import '../styles/TaskInput.css'

interface TaskInputProps {
  onAddTask: (title: string, priority?: 'low' | 'medium' | 'high', dueDate?: string) => void
}

export default function TaskInput({ onAddTask }: TaskInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [showModal, setShowModal] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleExpand = () => {
    setShowModal(true)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onAddTask(inputValue, 'medium', undefined)
      setInputValue('')
      setShowModal(false)
    }
  }

  const handleCloseModal = () => {
    setInputValue('')
    setShowModal(false)
  }

  // Create a preview task object
  const previewTask = {
    id: 'preview',
    title: inputValue || 'Task preview...',
    priority: 'medium' as const,
    subtasks: [],
    createdAt: new Date(),
  }

  return (
    <>
      <div className="task-input-container">
        <div className="task-input-bubble" onClick={handleExpand}>
          <span className="bubble-text">Add a new task...</span>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit} className="task-input-form">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter a task..."
                className="task-input"
                autoFocus
              />
              
              <div className="preview-section">
                <label className="preview-label">Preview</label>
                <div className="preview-bubble">
                  {inputValue.trim() ? (
                    <TaskBubble
                      task={previewTask}
                      onDelete={() => {}}
                      onEdit={() => {}}
                      onAddSubtask={() => {}}
                      onToggleSubtask={() => {}}
                      isEditing={false}
                      onUpdate={() => {}}
                      onStopEditing={() => {}}
                    />
                  ) : (
                    <div className="empty-preview">Start typing to see preview...</div>
                  )}
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={!inputValue.trim()}>
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
