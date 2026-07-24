import { type FormEvent, useEffect, useState } from "react";
import "./App.css";

type TodoItem = {
  id: string;
  content: string;
};

const STORAGE_KEY = "taskboard-items";

const defaultTodos: TodoItem[] = [
  { id: "demo-1", content: "Set up the project" },
  { id: "demo-2", content: "Run the app" },
  { id: "demo-3", content: "View it in the browser" },
];

function App() {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    if (typeof window === "undefined") {
      return defaultTodos;
    }

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as TodoItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fall back to the built-in starter tasks when storage is unavailable.
    }

    return defaultTodos;
  });
  const [newTodo, setNewTodo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  async function addTodo(event?: FormEvent) {
    event?.preventDefault();
    const value = newTodo.trim();
    if (!value) return;

    setIsSubmitting(true);
    setMessage("");

    const newItem: TodoItem = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`,
      content: value,
    };

    setTodos((current) => [newItem, ...current]);
    setNewTodo("");
    setMessage("Task saved locally.");
    setIsSubmitting(false);
  }

  function removeTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
    setMessage("Task removed.");
  }

  return (
    <main className="app-shell">
      <section className="app-card">
        <div className="hero">
          <div>
            <p className="eyebrow">Task Board</p>
            <h1>Stay on top of your day</h1>
            <p className="subtitle">Capture ideas, tasks, and plans in one polished workspace.</p>
          </div>
          <div className="status-pill">Local save ready</div>
        </div>

        {message && <p className="message">{message}</p>}

        <form className="task-form" onSubmit={addTodo}>
          <input
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Add a new task"
            aria-label="Add a new task"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Add task"}
          </button>
        </form>

        <div className="meta-row">
          <span>{todos.length} tasks</span>
          <span>Saved in this browser</span>
        </div>

        <ul className="todo-list">
          {todos.length === 0 ? (
            <li className="empty-state">No tasks yet. Add one above.</li>
          ) : (
            todos.map((todo) => (
              <li key={todo.id} className="todo-item">
                <div className="todo-main">
                  <span className="todo-check">✓</span>
                  <span>{todo.content}</span>
                </div>
                <button type="button" className="delete-btn" onClick={() => removeTodo(todo.id)}>
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}

export default App;
