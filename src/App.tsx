import { type FormEvent, useEffect, useState } from "react";
import { signIn, signOut, signUp, getCurrentUser } from "aws-amplify/auth";
import outputs from "../amplify_outputs.json";
import "./App.css";

type TodoItem = {
  id: string;
  content: string;
};

type AuthMode = "signIn" | "signUp";

type AuthUser = {
  username?: string;
};

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([
    { id: "demo-1", content: "Set up the project" },
    { id: "demo-2", content: "Run the app" },
    { id: "demo-3", content: "View it in the browser" },
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [message, setMessage] = useState("");
  const endpoint = outputs.data?.url;
  const apiKey = outputs.data?.api_key;

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser({ username: currentUser.username });
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

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

  async function handleAuth(event: FormEvent) {
    event.preventDefault();
    setMessage("");

    try {
      if (authMode === "signUp") {
        await signUp({
          username,
          password,
          options: { autoSignIn: true, userAttributes: { email } },
        });
        setMessage("Account created. Please sign in.");
      } else {
        const response = await signIn({ username, password });
        if (response.isSignedIn) {
          setUser({ username });
          setMessage("Signed in successfully.");
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("Authentication failed. Check your details and try again.");
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setMessage("Signed out successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Could not sign out right now.");
    }
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
          <div className="status-pill">{user ? `Hello, ${user.username}` : "Cloud connected"}</div>
        </div>

        {!user ? (
          <form className="auth-form" onSubmit={handleAuth}>
            <div className="auth-toggle">
              <button type="button" className={authMode === "signIn" ? "active" : ""} onClick={() => setAuthMode("signIn")}>
                Sign In
              </button>
              <button type="button" className={authMode === "signUp" ? "active" : ""} onClick={() => setAuthMode("signUp")}>
                Sign Up
              </button>
            </div>

            <input type="text" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
            {authMode === "signUp" && <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />}
            <input type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button type="submit" className="auth-submit">
              {authMode === "signIn" ? "Sign In" : "Create Account"}
            </button>
            {message && <p className="message">{message}</p>}
          </form>
        ) : (
          <div className="auth-logged-in">
            <p className="message">You are signed in.</p>
            <button type="button" className="auth-submit" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}

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
