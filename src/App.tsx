import { useState, useReducer, useEffect, useRef } from 'react'
import FloatingBubble from './components/FloatingBubble'
import EditMode from './components/EditMode'
import HistoryScreen from './components/HistoryScreen'
import './App.css'

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
  completed?: boolean
  completedAt?: Date
}

interface SubTask {
  id: string
  title: string
  completed: boolean
}

type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'COMPLETE_TASK'; payload: string }
  | { type: 'RESTORE_TASK'; payload: string }
  | { type: 'ADD_SUBTASK'; payload: { taskId: string; subtask: SubTask } }
  | { type: 'TOGGLE_SUBTASK'; payload: { taskId: string; subtaskId: string } }

function tasksReducer(state: Task[], action: TaskAction): Task[] {
  switch (action.type) {
    case 'ADD_TASK':
      return [...state, action.payload]
    case 'UPDATE_TASK':
      return state.map((task) => (task.id === action.payload.id ? { ...task, ...action.payload.updates } : task))
    case 'DELETE_TASK':
      return state.filter((task) => task.id !== action.payload)
    case 'COMPLETE_TASK':
      return state.map((task) =>
        task.id === action.payload ? { ...task, completed: true, completedAt: new Date() } : task,
      )
    case 'RESTORE_TASK':
      return state.map((task) => (task.id === action.payload ? { ...task, completed: false, completedAt: undefined } : task))
    case 'ADD_SUBTASK':
      return state.map((task) =>
        task.id === action.payload.taskId ? { ...task, subtasks: [...task.subtasks, action.payload.subtask] } : task,
      )
    case 'TOGGLE_SUBTASK':
      return state.map((task) =>
        task.id === action.payload.taskId
          ? {
              ...task,
              subtasks: task.subtasks.map((st) =>
                st.id === action.payload.subtaskId ? { ...st, completed: !st.completed } : st,
              ),
            }
          : task,
      )
    default:
      return state
  }
}

function App() {
  const [tasks, dispatch] = useReducer(tasksReducer, [])
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [newTaskInput, setNewTaskInput] = useState('')
  const [isInputActive, setIsInputActive] = useState(false)
  const [bubblePhysics, setBubblePhysics] = useState<Record<string, { x: number; y: number; vx: number; vy: number }>>({})
  const floatingContainerRef = useRef<HTMLDivElement>(null)

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  // track cursor position relative to container center for avoidance behavior
  const [cursorPos, setCursorPos] = useState<{x:number,y:number}|null>(null)
  const editingTask = tasks.find((t) => t.id === editingTaskId)

  // Initialize physics for new tasks and run collision detection
  useEffect(() => {
    // Initialize physics for any new tasks; try to place them above the input line
    activeTasks.forEach((task) => {
      if (!bubblePhysics[task.id]) {
        const containerRect = floatingContainerRef.current?.getBoundingClientRect()
        const inputRect = document.getElementById('task-input-container')?.getBoundingClientRect()
        const containerHeight = containerRect?.height || window.innerHeight || 600
        const containerCenter = containerHeight / 2

        // compute line where input top sits relative to container center
        let lineY = containerCenter
        if (containerRect && inputRect) {
          const inputTopOffset = inputRect.top - containerRect.top
          lineY = inputTopOffset - containerCenter
        }

        const radius = 60 / 2
        const x = Math.random() * 300 - 150
        // generate random y in a range avoiding the bottom line
        let y = Math.random() * containerHeight - containerCenter
        // account for hover scaling (≈1.1) and add a small buffer
        const hoverScale = 1.1
        const margin = radius * (hoverScale - 1) + 4
        if (y + radius + margin > lineY) {
          y = lineY - radius - margin
        }

        setBubblePhysics((prev) => ({
          ...prev,
          [task.id]: {
            x,
            y,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
          },
        }))
      }
    })
  }, [activeTasks.length])

  // Physics simulation loop with collision detection
  useEffect(() => {
    let animationFrameId: number

    const updatePhysics = () => {
      setBubblePhysics((prevPhysics) => {
        const newPhysics = { ...prevPhysics }

        // measure container and input boundaries once per frame
        const containerRect = floatingContainerRef.current?.getBoundingClientRect()
        const inputRect = document.getElementById('task-input-container')?.getBoundingClientRect()
        const containerHeight = containerRect?.height || window.innerHeight || 600
        const containerCenter = containerHeight / 2

        // compute lineY relative to container center where input top lies
        let lineY = containerCenter
        if (containerRect && inputRect) {
          const inputTopOffset = inputRect.top - containerRect.top
          lineY = inputTopOffset - containerCenter
        }

        activeTasks.forEach((task) => {
          const physics = newPhysics[task.id]
          if (!physics) return

          const importance = task.importance || (task.priority === 'high' ? 8 : task.priority === 'medium' ? 5 : 2)
          const bubbleSize = 60 + importance * 8
          const radius = bubbleSize / 2

          let { x, y, vx, vy } = physics
          const padding = 40
          const height = containerHeight
          const constraintFactor = importance / 10
          const maxRoamDistance = 300 * (1 - constraintFactor * 0.7)

          // Apply gentle gravity for floating
          vy += 0.02

          // apply cursor avoidance if available
          // if (cursorPos) {
          //   const dxC = x - cursorPos.x
          //   const dyC = y - cursorPos.y
          //   const distC = Math.sqrt(dxC*dxC + dyC*dyC)
          //   const avoidRadius = 100
          //   if (distC < avoidRadius && distC > 0) {
          //     const force = (avoidRadius - distC) * 0.02
          //     vx += (dxC/distC) * force
          //     vy += (dyC/distC) * force
          //   }
          // }

          // Update position
          x += vx
          y += vy

          // Center attraction for high importance
          if (importance > 5) {
            const centerAttractionStrength = (importance - 5) * 0.01
            x *= 1 - centerAttractionStrength
            y *= 1 - centerAttractionStrength
          }

          // Soft boundary containment (gentle floating, not bouncing)
          if (x - radius < -maxRoamDistance) {
            x = -maxRoamDistance + radius
            vx = Math.abs(vx) * 0.3
          }
          if (x + radius > maxRoamDistance) {
            x = maxRoamDistance - radius
            vx = -Math.abs(vx) * 0.3
          }
          if (y - radius < -height / 2 + padding) {
            y = -height / 2 + radius + padding
            vy = Math.abs(vy) * 0.3
          }

          // enforce hard bottom line with buffer taking hover scale into account
          const hoverScale = 1.1
          const margin = radius * (hoverScale - 1) + 4
          if (y + radius + margin > lineY) {
            y = lineY - radius - margin
            vy = -Math.abs(vy) * 0.3
          }

          // Collision detection with other bubbles (soft repulsion and hard separation)
          activeTasks.forEach((otherTask) => {
            if (task.id === otherTask.id) return

            const otherPhysics = newPhysics[otherTask.id] || prevPhysics[otherTask.id]
            if (!otherPhysics) return

            const otherImportance = otherTask.importance || (otherTask.priority === 'high' ? 8 : otherTask.priority === 'medium' ? 5 : 2)
            const otherBubbleSize = 60 + otherImportance * 8
            const otherRadius = otherBubbleSize / 2

            let dx = otherPhysics.x - x
            let dy = otherPhysics.y - y
            let distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < 0.01) distance = 0.01
            const minDistance = radius + otherRadius + 40 // larger gap

            if (distance < minDistance) {
              // immediate positional correction
              const overlap = minDistance - distance
              const nx = dx / distance
              const ny = dy / distance

              // push this bubble away
              x -= nx * (overlap / 2)
              y -= ny * (overlap / 2)
              // and the other one as well so they never sit on top of each other
              otherPhysics.x += nx * (overlap / 2)
              otherPhysics.y += ny * (overlap / 2)

              // apply a stronger repulsion velocity
              const repulsionForce = overlap * 0.05
              vx -= nx * repulsionForce
              vy -= ny * repulsionForce
              otherPhysics.vx += nx * repulsionForce
              otherPhysics.vy += ny * repulsionForce
            }
          })

          // Air resistance (maintain momentum for floating effect)
          vx *= 0.98
          vy *= 0.98

          newPhysics[task.id] = { x, y, vx, vy }
        })

        return newPhysics
      })

      animationFrameId = requestAnimationFrame(updatePhysics)
    }

    animationFrameId = requestAnimationFrame(updatePhysics)
    return () => cancelAnimationFrame(animationFrameId)
  }, [activeTasks])

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskInput.trim()) {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          id: Date.now().toString(),
          title: newTaskInput,
          priority: 'medium',
          subtasks: [],
          createdAt: new Date(),
        },
      })
      setNewTaskInput('')
      setIsInputActive(false)
    }
  }

  const handleUpdateTask = (updates: Partial<Task>) => {
    if (editingTaskId) {
      dispatch({ type: 'UPDATE_TASK', payload: { id: editingTaskId, updates } })
    }
  }

  const handleDeleteTask = () => {
    if (editingTaskId) {
      dispatch({ type: 'DELETE_TASK', payload: editingTaskId })
      setEditingTaskId(null)
    }
  }

  const handleAddSubtask = (subtaskTitle: string) => {
    if (editingTaskId) {
      dispatch({
        type: 'ADD_SUBTASK',
        payload: {
          taskId: editingTaskId,
          subtask: {
            id: Date.now().toString(),
            title: subtaskTitle,
            completed: false,
          },
        },
      })
    }
  }

  const handleToggleSubtask = (subtaskId: string) => {
    if (editingTaskId) {
      dispatch({
        type: 'TOGGLE_SUBTASK',
        payload: { taskId: editingTaskId, subtaskId },
      })
    }
  }

  const handleRestoreTask = (taskId: string) => {
    dispatch({ type: 'RESTORE_TASK', payload: taskId })
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-gradient-to-br from-mint-light to-mint">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10">
        <div>
          <h1 className="text-4xl font-bold text-white font-rounded">PopMe</h1>
          <p className="text-white text-opacity-70 font-rounded">Your floating tasks</p>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="text-2xl cursor-pointer hover:text-white transition opacity-70 hover:opacity-100"
        >
          🕐
        </button>
      </div>

      {/* Floating Bubbles */}
      <div
        ref={floatingContainerRef}
        className="floating-container absolute inset-0 top-20"
        style={{ paddingBottom: 200 }}
        onMouseMove={(e) => {
          const rect = floatingContainerRef.current?.getBoundingClientRect()
          if (rect) {
            const x = e.clientX - rect.left - rect.width/2
            const y = e.clientY - rect.top - rect.height/2
            setCursorPos({x,y})
          }
        }}
        // onMouseLeave={() => setCursorPos(null)}
      >
        {activeTasks.map((task) => (
          <FloatingBubble
            key={task.id}
            task={task}
            onEdit={(id) => setEditingTaskId(id)}
            onDelete={(id) => dispatch({ type: 'COMPLETE_TASK', payload: id })}
            physics={bubblePhysics[task.id] || { x: 0, y: 0 }}
          />
        ))}
      </div>

      {/* Empty State */}
      {activeTasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-center">
          <div className="font-rounded">
            <p className="text-2xl font-bold mb-2">No tasks yet</p>
            <p className="text-opacity-70">Add one to get started →</p>
          </div>
        </div>
      )}

      {/* Add Task Input - Half Bubble */}
      <div id="task-input-container" className="fixed bottom-0 left-0 right-0 z-20 flex justify-center pb-6 font-rounded">
        {!isInputActive ? (
          <button
            onClick={() => setIsInputActive(true)}
            className="w-48 h-24 rounded-t-full transition-all hover:scale-110 hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, #4db8a8 0%, #2a9b84 100%)',
              boxShadow: '0 -4px 12px rgba(77, 184, 168, 0.3)',
            }}
          >
            <span className="text-white font-semibold text-sm">Add a task...</span>
          </button>
        ) : (
          <div
            className="w-80 rounded-t-3xl p-6 transition-all"
            style={{
              background: 'white',
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
            }}
          >
            <form onSubmit={handleAddTask} className="space-y-4">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Enter a task..."
                autoFocus
                className="w-full px-4 py-3 border-2 border-mint rounded-lg focus:outline-none focus:border-lavender bg-mint-light text-gray-800"
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewTaskInput('')
                    setIsInputActive(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-400 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskInput.trim()}
                  className="flex-1 px-4 py-2 bg-lavender text-white rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Edit Mode */}
      {editingTask && (
        <EditMode
          task={editingTask}
          onUpdate={handleUpdateTask}
          onClose={() => setEditingTaskId(null)}
          onDelete={handleDeleteTask}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
        />
      )}

      {/* History Screen */}
      {showHistory && (
        <HistoryScreen
          completedTasks={completedTasks}
          onClose={() => setShowHistory(false)}
          onRestore={handleRestoreTask}
        />
      )}
    </div>
  )
}

export default App
