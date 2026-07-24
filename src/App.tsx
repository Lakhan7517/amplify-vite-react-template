import { type FormEvent, useState } from "react";
import outputs from "../amplify_outputs.json";
import "./App.css";

type TodoItem = {
  id: string;
  content: string;
};

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "demo-1", content: "Set up the project" },
    { id: "demo-2", content: "Run the app" },
    { id: "demo-3", content: "View it in the browser" },
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const endpoint = outputs.data?.url;
  const apiKey = outputs.data?.api_key;

  async function addTodo(event?: FormEvent) {
    event?.preventDefault();
    const value = newTodo.trim();
    if (!value) return;

    setIsSubmitting(true);

    const mutation = `mutation CreateTodo($input: CreateTodoInput!) { createTodo(input: $input) { id content createdAt updatedAt } }`;

    try {
      const res = await fetch(endpoint!, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey ?? "",
        },
        body: JSON.stringify({ query: mutation, variables: { input: { content: value } } }),
      });

      const json = await res.json();
      if (json.errors) {
        throw new Error(json.errors[0]?.message ?? "Failed to save item");
      }

      const created = json.data?.createTodo;
      if (created) {
        setTodos((current) => [{ id: created.id, content: created.content ?? value }, ...current]);
      }
      setNewTodo("");
    } catch (err) {
      console.error(err);
      alert("Failed to save the task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function removeTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  return (
    <main className="app-shell">
      <section className="app-card">
        <div className="hero">
          <div>
            <p className="eyebrow">AWS Amplify + React</p>
            <h1>Stay on top of your day</h1>
            <p className="subtitle">Capture ideas, tasks, and plans in one polished workspace.</p>
          </div>
          <div className="status-pill">Cloud connected</div>
        </div>

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
          <span>Live sync ready</span>
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
