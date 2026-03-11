import { useRef } from 'react'

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

interface FloatingBubbleProps {
  task: Task
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
  physics: { x: number; y: number }
}

const priorityColorMap: Record<string, string> = {
  low: '#b2dfdb',
  medium: '#80cbc4',
  high: '#4db8a8',
}

export default function FloatingBubble({ task, onEdit, onDelete, physics }: FloatingBubbleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  // setTimeout in browser returns a number
  const pressTimer = useRef<number | null>(null)

  // Use importance to determine size, defaulting to priority if importance isn't set
  const importance = task.importance || (task.priority === 'high' ? 8 : task.priority === 'medium' ? 5 : 2)
  const effort = task.effort || 5
  const bubbleSize = 60 + importance * 8
  
  // Base color from task color or priority
  const baseColor = task.color || priorityColorMap[task.priority]
  
  // Calculate color and opacity based on effort
  // Higher effort (towards 10) = shifts to warm orange/coral (#f4a97d)
  // Lower effort (towards 1) = becomes fainter
  const effortFactor = effort / 10
  const warmorange = '#f4a97d'
  const opacity = 0.4 + effortFactor * 0.6 // 0.4 at effort 1, 1.0 at effort 10
  
  // Interpolate between base color and warm orange based on effort
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const c1 = parseInt(color1.slice(1), 16)
    const c2 = parseInt(color2.slice(1), 16)
    
    const r1 = (c1 >> 16) & 255
    const g1 = (c1 >> 8) & 255
    const b1 = c1 & 255
    
    const r2 = (c2 >> 16) & 255
    const g2 = (c2 >> 8) & 255
    const b2 = c2 & 255
    
    const r = Math.round(r1 + (r2 - r1) * factor)
    const g = Math.round(g1 + (g2 - g1) * factor)
    const b = Math.round(b1 + (b2 - b1) * factor)
    
    return `rgb(${r}, ${g}, ${b})`
  }
  
  const bubbleColor = interpolateColor(baseColor, warmorange, effortFactor * 0.5)

  const handleMouseEnter = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = 'scale(1.1)'
    }
  }

  const handleMouseLeave = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = 'scale(1)'
    }
    cancelPress()
  }

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    pressTimer.current = window.setTimeout(() => {
      onDelete(task.id)
    }, 700)
  }

  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  return (
    <div
      ref={containerRef}
      // gestures
      onDoubleClick={() => onEdit(task.id)}
      onMouseDown={startPress}
      onTouchStart={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      className="absolute cursor-pointer transition-transform duration-200"
      style={{
        left: `calc(50% + ${physics.x}px)`,
        top: `calc(50% + ${physics.y}px)`,
        transform: `translate(-50%, -50%)`,
        width: bubbleSize,
        height: bubbleSize,
        opacity: opacity,
        // bubbling stacking: near‑top bubbles should appear above lower ones, but keep
        // all bubbles beneath the input component (z-index 20).
        // compute a small range and clamp it so we never exceed 10.
        zIndex: (() => {
          const raw = Math.round(100 - physics.y)
          return Math.max(1, Math.min(10, raw))
        })(),
      }}
      onMouseEnter={handleMouseEnter}
      // onMouseLeave already handles cancelPress
    >
      {/* render subtasks without connecting lines, orbiting just outside the parent */}
      {/* no svg lines required since subtasks sit on perimeter */}

      {/* Main bubble */}
      <div
        className="w-full h-full rounded-full flex items-center justify-center p-4 text-center text-white font-rounded font-semibold shadow-lg overflow-hidden"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), ${bubbleColor})`,
          boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)`,
        }}
      >
        <span className="text-sm line-clamp-3">{task.title}</span>
      </div>

      {/* Subtask bubbles orbiting */}
      {task.subtasks.map((subtask, index) => {
        const angle = (index / task.subtasks.length) * Math.PI * 2
        const subtaskSize = 32
        // position the subtask so it hugs the parent circumference (distance = parent radius + half subtask)
        const distance = bubbleSize / 2 + subtaskSize / 2
        const subtaskX = Math.cos(angle) * distance
        const subtaskY = Math.sin(angle) * distance

        return (
          <div
            key={subtask.id}
            className="absolute flex items-center justify-center rounded-full transition-opacity"
            style={{
              left: `calc(50% + ${subtaskX}px)`,
              top: `calc(50% + ${subtaskY}px)`,
              transform: `translate(-50%, -50%)`,
              width: subtaskSize,
              height: subtaskSize,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), ${bubbleColor})`,
              boxShadow: `0 4px 16px 0 rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)`,
              opacity: subtask.completed ? 0.5 : 0.9,
              cursor: 'pointer',
              pointerEvents: 'auto',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task.id)
            }}
            title={subtask.title}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              {subtask.completed ? (
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              )}
            </svg>
          </div>
        )
      })}
    </div>
  )
}
