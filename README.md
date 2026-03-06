# PopMe - Bubble Todo Planner

A beautiful, interactive mobile-first to-do list application built with React and TypeScript. Features a unique bubble-based UI design for managing tasks and subtasks.

## Features

✨ **Interactive Bubble UI** - Click bubbles to expand and see task details
📋 **Task Management** - Create, edit, and delete tasks with ease
🎯 **Priority Levels** - Set task priority (Low, Medium, High) with color coding
📅 **Due Dates** - Add optional due dates to your tasks
✅ **Subtasks** - Add and track subtasks within each task
🎨 **Beautiful Design** - Gradient background with smooth animations
📱 **Mobile-Responsive** - Optimized for mobile and desktop devices
⚡ **Fast & Lightweight** - Built with Vite for optimal performance

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

### Adding a Task
1. Type your task in the input field at the bottom
2. Click the settings icon (⚙️) to set priority and due date (optional)
3. Click "Add Task" to create your task

### Managing Tasks
- **View Details**: Click any bubble to expand it
- **Edit**: Click the pencil icon (✏️) to edit task details
- **Delete**: Click the trash icon (🗑️) to remove a task
- **Add Subtasks**: In the expanded view, add subtasks and track completion

## Project Structure

```
src/
├── components/
│   ├── TaskBubble.tsx    # Individual task bubble component
│   └── TaskInput.tsx     # Task input form component
├── styles/
│   ├── TaskBubble.css    # Bubble styling
│   └── TaskInput.css     # Input form styling
├── App.tsx               # Main app component
├── App.css               # App styling
├── index.css            # Global styles
└── main.tsx             # React entry point
```

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **CSS3** - Styling with gradients, animations, and grid layout

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Color Scheme

- **High Priority**: Light Red (#FFB5B5)
- **Medium Priority**: Light Blue (#B5D6FF)
- **Low Priority**: Light Green (#B5FFB5)
- **Primary Gradient**: Purple (#667eea to #764ba2)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for your own purposes!

## Future Enhancements

- 💾 Local storage persistence
- ☁️ Cloud sync with Firebase
- 🔔 Task notifications and reminders
- 🌓 Dark mode
- 📤 Export/Import tasks
- 🏷️ Task categories and tags
- 🎯 Goal tracking and analytics
