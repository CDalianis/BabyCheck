import { useState, type FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { useUserTodos, type TodoItem } from "../../hooks/useUserTodos";
import StickySidebar from "../layout/StickySidebarPanel";
import { btnPrimaryClass, inputClass } from "../ui/form";

interface TodoPanelProps {
  todos: TodoItem[];
  addTodo: (text: string) => boolean;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearCompleted: () => void;
  signedIn: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isSaving?: boolean;
}

function TodoPanel({
  todos,
  addTodo,
  toggleTodo,
  removeTodo,
  clearCompleted,
  signedIn,
  isLoading,
  isError,
  isSaving,
}: TodoPanelProps) {
  const [text, setText] = useState("");

  const pending = todos.filter((todo) => !todo.completed);
  const completed = todos.filter((todo) => todo.completed);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (addTodo(text)) {
      setText("");
    }
  }

  if (!signedIn) {
    return (
      <p className="px-1 text-sm text-theme-muted">Sign in to save your to-do list.</p>
    );
  }

  if (isLoading) {
    return <p className="px-1 text-sm text-theme-muted">Loading tasks...</p>;
  }

  if (isError) {
    return (
      <p className="px-1 text-sm text-red-600">Could not load your to-do list.</p>
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task..."
          className={inputClass}
          maxLength={200}
        />
        <button
          type="submit"
          className={btnPrimaryClass + " py-2 text-xs"}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Add task"}
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="px-1 text-sm text-theme-muted">No tasks yet.</p>
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <ul className="space-y-1.5">
              {pending.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-start gap-2 rounded-xl border border-theme bg-theme-surface-elevated px-2.5 py-2"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="mt-0.5 rounded border-theme"
                    aria-label={`Mark "${todo.text}" complete`}
                  />
                  <span className="min-w-0 flex-1 text-sm text-theme-body">
                    {todo.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTodo(todo.id)}
                    className="shrink-0 text-xs text-theme-muted hover:text-red-600"
                    aria-label={`Remove "${todo.text}"`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          {completed.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between px-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-theme-muted">
                  Done
                </p>
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="text-[10px] font-medium text-theme-muted hover:text-theme-body"
                >
                  Clear
                </button>
              </div>
              <ul className="space-y-1.5">
                {completed.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-start gap-2 rounded-xl border border-theme bg-theme-surface-elevated/70 px-2.5 py-2 opacity-80"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="mt-0.5 rounded border-theme"
                      aria-label={`Mark "${todo.text}" incomplete`}
                    />
                    <span className="min-w-0 flex-1 text-sm text-theme-muted line-through">
                      {todo.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTodo(todo.id)}
                      className="shrink-0 text-xs text-theme-muted hover:text-red-600"
                      aria-label={`Remove "${todo.text}"`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface UserTodoListProps {
  mobileOpen: boolean;
  onMobileOpen: () => void;
  onMobileClose: () => void;
}

export default function UserTodoList({
  mobileOpen,
  onMobileOpen,
  onMobileClose,
}: UserTodoListProps) {
  const { user } = useAuth();
  const todoApi = useUserTodos(!!user);
  const pendingCount = todoApi.todos.filter((todo) => !todo.completed).length;

  const panel = (
    <TodoPanel
      todos={todoApi.todos}
      addTodo={todoApi.addTodo}
      toggleTodo={todoApi.toggleTodo}
      removeTodo={todoApi.removeTodo}
      clearCompleted={todoApi.clearCompleted}
      signedIn={!!user}
      isLoading={todoApi.isLoading}
      isError={todoApi.isError}
      isSaving={todoApi.isSaving}
    />
  );

  return (
    <div className="lg:flex lg:h-full lg:flex-col">
      <button
        type="button"
        onClick={onMobileOpen}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-theme bg-theme-surface-95 px-4 py-2.5 text-sm font-medium text-theme-body lg:hidden"
      >
        <span>☑</span>
        To-do list
        {pendingCount > 0 && (
          <span className="rounded-full bg-theme-brand px-2 py-0.5 text-xs text-white">
            {pendingCount}
          </span>
        )}
      </button>

      <StickySidebar title="To-do list">{panel}</StickySidebar>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-label="Close to-do list"
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(88vw,18rem)] flex-col border-l border-theme bg-theme-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-theme px-4 py-3">
              <h2 className="text-sm font-bold text-theme-body">To-do list</h2>
              <button
                type="button"
                onClick={onMobileClose}
                className="rounded-lg px-2 py-1 text-xl text-theme-muted hover:bg-theme-surface-hover"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">{panel}</div>
          </aside>
        </div>
      )}
    </div>
  );
}
