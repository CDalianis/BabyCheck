import type { UserTodo } from "@babycheck/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as todosApi from "../api/todos";

export type TodoItem = UserTodo;

const QUERY_KEY = ["todos"] as const;

export function useUserTodos(enabled: boolean) {
  const queryClient = useQueryClient();

  const { data: todos = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await todosApi.listTodos();
      return res.data;
    },
    enabled,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const addMutation = useMutation({
    mutationFn: (text: string) => todosApi.createTodo({ text }),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosApi.updateTodo(id, { completed }),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => todosApi.deleteTodo(id),
    onSuccess: invalidate,
  });

  const clearMutation = useMutation({
    mutationFn: () => todosApi.clearCompletedTodos(),
    onSuccess: invalidate,
  });

  function addTodo(text: string) {
    const trimmed = text.trim();
    if (!trimmed || !enabled) return false;
    addMutation.mutate(trimmed);
    return true;
  }

  function toggleTodo(id: string) {
    const todo = todos.find((item) => item.id === id);
    if (!todo) return;
    toggleMutation.mutate({ id, completed: !todo.completed });
  }

  function removeTodo(id: string) {
    removeMutation.mutate(id);
  }

  function clearCompleted() {
    clearMutation.mutate();
  }

  const isSaving =
    addMutation.isPending ||
    toggleMutation.isPending ||
    removeMutation.isPending ||
    clearMutation.isPending;

  return {
    todos,
    isLoading,
    isError,
    isSaving,
    addTodo,
    toggleTodo,
    removeTodo,
    clearCompleted,
  };
}
