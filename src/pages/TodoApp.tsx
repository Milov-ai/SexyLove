import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import AuthScreen from "../features/auth/components/AuthScreen";
import { notificationService } from "@/services/NotificationService";

const TodoApp = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "¡Bienvenido a tu nueva app de notas!", completed: false },
    {
      id: 2,
      text: "Puedes añadir tareas, completarlas o eliminarlas.",
      completed: false,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleAddTask = () => {
    if (inputValue.trim()) {
      setTasks([
        ...tasks,
        { id: Date.now(), text: inputValue, completed: false },
      ]);
      setInputValue("");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleTitleClick = () => {
    const now = Date.now();
    // Reset if clicks are too far apart (e.g., > 500ms)
    if (now - lastClickTime > 500) {
      setClickCount(1);
    } else {
      setClickCount(clickCount + 1);
    }
    setLastClickTime(now);

    if (clickCount + 1 >= 3) {
      setShowAuthScreen(true);
      setClickCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-8 font-sans">
      <AuthScreen open={showAuthScreen} onOpenChange={setShowAuthScreen} />

      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1
            onClick={handleTitleClick}
            className="cursor-pointer text-4xl font-bold text-slate-100 select-none"
          >
            Notas
          </h1>
          <p className="text-slate-400">
            Tu espacio privado para pensamientos y tareas.
          </p>
        </header>

        <div className="flex gap-2 mb-6">
          <Input
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              setInputValue(val);
              notificationService.checkKeyword(val);
            }}
            placeholder="Escribe una nota o un comando..."
            onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            className="bg-slate-800 border-slate-700 placeholder:text-slate-500 focus:ring-slate-600"
          />
          <Button
            onClick={handleAddTask}
            className="bg-slate-700 hover:bg-slate-600"
          >
            <Plus size={16} />
          </Button>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg shadow-md transition-all hover:bg-slate-700/50"
            >
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                className="border-slate-700 data-[state=checked]:bg-slate-600 data-[state=checked]:border-slate-500"
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`flex-1 text-slate-300 ${task.completed ? "line-through text-slate-500" : ""}`}
              >
                {task.text}
              </label>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteTask(task.id)}
                className="text-slate-500 hover:text-red-500"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;
