import {
  ArrowRight,
  CheckCircle2,
  Layout,
  Search,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

const TASKS = {
  todos: [
    { id: 1, title: "Plan weekend trip", due: "Apr 25" },
    { id: 2, title: "Buy groceries", due: "Apr 22" },
    { id: 3, title: "Review monthly budget", due: null },
  ],
  inProgress: [
    { id: 1, title: "Finish Reading Book", due: "Apr 30" },
    { id: 2, title: "Organize home office" },
  ],
  done: [
    { id: 1, title: "Call Dentist", due: "Apr 20" },
    { id: 2, title: "Pay utility bills", due: "Apr 19" },
    { id: 3, title: "Send birthday card", due: "Apr 18" },
  ],
};

export default function App() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full mb-4 sm:mb-6">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">
            Your Visual Task Manager
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
          Organize Your Work,
          <br />
          Visualize Your Progress
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          A powerful, intuitive Trello-style task board that helps you manage
          projects with drag-and-drop simplicity.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium">
            Start Organizing <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600 font-medium">
            View Demo
          </button>
        </div>

        <div className="mt-10 sm:mt-12 lg:mt-16 relative perspective-[2000px]">
          <div className="absolute inset-0 bg-linear-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl"></div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 transform lg:rotate-x-2">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/60 dark:border-gray-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-linear-to-br from-gray-400 to-gray-600"></div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                    To Do
                  </h3>
                </div>
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                  {TASKS.todos.length}
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {TASKS.todos.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-md border border-white/40 dark:border-gray-600/40 hover:shadow-lg transition-shadow flex justify-between"
                  >
                    <p className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                      {task.title}
                    </p>
                    {task.due ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                        Due: {task.due}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No due date
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/60 dark:border-gray-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-linear-to-br from-blue-400 to-blue-600"></div>
                  <h3 className="font-semibold text-sm sm:text-base text-blue-800 dark:text-blue-300">
                    In Progress
                  </h3>
                </div>
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-blue-100/80 dark:bg-blue-900/80 backdrop-blur-sm rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                  {TASKS.inProgress.length}
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {TASKS.inProgress.map((task) => (
                  <div
                    key={task.id}
                    className="bg-linear-to-br from-white/95 to-blue-50/95 dark:from-gray-700/95 dark:to-blue-900/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-md border border-blue-200/40 dark:border-blue-800/40 hover:shadow-lg transition-shadow flex justify-between"
                  >
                    <p className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-100">
                      {task.title}
                    </p>
                    {task.due ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
                        Due: {task.due}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        No due date
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/60 dark:border-gray-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transform hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-linear-to-br from-green-400 to-green-600"></div>
                  <h3 className="font-semibold text-sm sm:text-base text-green-800 dark:text-green-300">
                    Done
                  </h3>
                </div>
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-100/80 dark:bg-green-900/80 backdrop-blur-sm rounded-full text-xs font-medium text-green-700 dark:text-green-300">
                  {TASKS.done.length}
                </span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {TASKS.done.map((task) => (
                  <div
                    key={task.id}
                    className="bg-linear-to-br from-white/95 to-green-50/95 dark:from-gray-700/95 dark:to-green-900/30 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-md border border-green-200/40 dark:border-green-800/40 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-xs sm:text-sm text-gray-800 dark:text-gray-100 line-through opacity-60">
                        {task.title}
                      </p>
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 dark:text-green-400 shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white">
            Everything You Need
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base lg:text-lg">
            Powerful features to keep your projects on track
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">
              Drag & Drop Interface
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Effortlessly move tasks between columns and reorder them with
              smooth, intuitive drag-and-drop functionality.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">
              Smart Search & Filter
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Quickly find tasks with powerful search and filter options by
              column, title, or due date.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">
              Data Persistence
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Your work is automatically saved and restored, so you never lose
              progress even after closing the browser.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Layout className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">
              Flexible Columns
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Create, rename, and delete columns to match your workflow.
              Customize your board to fit any project.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">
              Rich Task Details
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Add titles, descriptions, and due dates to tasks. Keep all
              important information in one place.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="font-semibold text-lg sm:text-xl mb-2 text-gray-900 dark:text-white">
              Clean & Modern UI
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
              Beautiful, responsive design that works seamlessly on desktop and
              mobile devices.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-linear-to-r from-blue-600 to-purple-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            Ready to Get Organized?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Join thousands of users managing their tasks with TaskBoard
          </p>
          <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium inline-flex items-center justify-center gap-2">
            Start Using TaskBoard{" "}
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </section>

      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          <p>© 2026 TaskBoard. Built with React and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
