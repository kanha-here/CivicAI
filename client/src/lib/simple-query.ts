import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type QueryKey = readonly unknown[];
type QueryKeyInput = QueryKey | string;

type QueryOptions<TData> = {
  queryKey: QueryKeyInput;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  refetchInterval?: number | false;
};

type QueryEntry<TData> = {
  queryKey: QueryKey;
  data?: TData;
  error?: unknown;
  isFetching: boolean;
  dataUpdatedAt: number;
  promise?: Promise<TData>;
};

type MutationOptions<TData, TVariables, TContext> = {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onMutate?: (variables: TVariables) => TContext | Promise<TContext>;
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void | Promise<void>;
  onError?: (error: unknown, variables: TVariables, context: TContext | undefined) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: unknown,
    variables: TVariables,
    context: TContext | undefined,
  ) => void | Promise<void>;
};

const queryCache = new Map<string, QueryEntry<unknown>>();
const listeners = new Set<() => void>();
let invalidationVersion = 0;
let clearVersion = 0;

function normalizeQueryKey(queryKey: QueryKeyInput): QueryKey {
  return Array.isArray(queryKey) ? queryKey : [queryKey];
}

function queryKeyToString(queryKey: QueryKeyInput) {
  return JSON.stringify(normalizeQueryKey(queryKey));
}

function queryKeysMatch(queryKey: QueryKey, partial: QueryKey) {
  if (partial.length > queryKey.length) return false;
  return partial.every((part, index) => JSON.stringify(part) === JSON.stringify(queryKey[index]));
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getEntry<TData>(queryKey: QueryKeyInput): QueryEntry<TData> | undefined {
  return queryCache.get(queryKeyToString(queryKey)) as QueryEntry<TData> | undefined;
}

async function runQuery<TData>(options: QueryOptions<TData>) {
  const queryKey = normalizeQueryKey(options.queryKey);
  const cacheKey = queryKeyToString(queryKey);
  const current = getEntry<TData>(queryKey);

  if (current?.promise) return current.promise;

  const promise = options.queryFn();
  queryCache.set(cacheKey, {
    queryKey,
    data: current?.data,
    error: undefined,
    isFetching: true,
    dataUpdatedAt: current?.dataUpdatedAt ?? 0,
    promise,
  });
  emitChange();

  try {
    const data = await promise;
    queryCache.set(cacheKey, {
      queryKey,
      data,
      error: undefined,
      isFetching: false,
      dataUpdatedAt: Date.now(),
    });
    emitChange();
    return data;
  } catch (error) {
    queryCache.set(cacheKey, {
      queryKey,
      data: current?.data,
      error,
      isFetching: false,
      dataUpdatedAt: current?.dataUpdatedAt ?? 0,
    });
    emitChange();
    throw error;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useQuery<TData>(options: QueryOptions<TData>) {
  const enabled = options.enabled ?? true;
  const queryKey = useMemo(() => normalizeQueryKey(options.queryKey), [queryKeyToString(options.queryKey)]);
  const cacheKey = useMemo(() => queryKeyToString(queryKey), [queryKey]);
  const [, forceRender] = useState(0);
  const lastRunRef = useRef("");
  const entry = getEntry<TData>(queryKey);

  useEffect(() => subscribe(() => forceRender((value) => value + 1)), []);

  const refetch = useCallback(() => runQuery(options), [cacheKey, options.queryFn]);

  useEffect(() => {
    if (!enabled) return;

    const runKey = `${cacheKey}:${invalidationVersion}:${clearVersion}`;
    if (lastRunRef.current === runKey && entry?.data !== undefined) return;
    lastRunRef.current = runKey;

    runQuery(options).catch(() => {
      // Consumers read the error state from the hook result.
    });
  }, [cacheKey, enabled, invalidationVersion, clearVersion]);

  useEffect(() => {
    if (!enabled || !options.refetchInterval) return;
    const interval = window.setInterval(() => {
      runQuery(options).catch(() => {
        // Consumers read the error state from the hook result.
      });
    }, options.refetchInterval);
    return () => window.clearInterval(interval);
  }, [cacheKey, enabled, options.refetchInterval]);

  return {
    data: entry?.data,
    error: entry?.error,
    isLoading: enabled && entry?.data === undefined && Boolean(entry?.isFetching),
    isFetching: enabled && Boolean(entry?.isFetching),
    dataUpdatedAt: entry?.dataUpdatedAt ?? 0,
    refetch,
  };
}

export function useMutation<TData = unknown, TVariables = void, TContext = unknown>(
  options: MutationOptions<TData, TVariables, TContext>,
) {
  const [isPending, setIsPending] = useState(false);
  const [variables, setVariables] = useState<TVariables | undefined>(undefined);

  const mutateAsync = useCallback(
    async (nextVariables: TVariables) => {
      setIsPending(true);
      setVariables(nextVariables);
      let context: TContext | undefined;
      let data: TData | undefined;
      let caughtError: unknown;

      try {
        context = await options.onMutate?.(nextVariables);
        data = await options.mutationFn(nextVariables);
        await options.onSuccess?.(data, nextVariables, context);
        return data;
      } catch (error) {
        caughtError = error;
        await options.onError?.(error, nextVariables, context);
        throw error;
      } finally {
        await options.onSettled?.(data, caughtError, nextVariables, context);
        setIsPending(false);
      }
    },
    [options],
  );

  const mutate = useCallback(
    (nextVariables: TVariables) => {
      mutateAsync(nextVariables).catch((error) => {
        console.error("Mutation failed:", error);
      });
    },
    [mutateAsync],
  );

  return { mutate, mutateAsync, isPending, variables };
}

export function useQueryClient() {
  return useMemo(
    () => ({
      invalidateQueries: ({ queryKey }: { queryKey: QueryKeyInput }) => {
        const partial = normalizeQueryKey(queryKey);
        queryCache.forEach((entry, cacheKey) => {
          if (queryKeysMatch(entry.queryKey, partial)) {
            queryCache.set(cacheKey, { ...entry, isFetching: false, promise: undefined });
          }
        });
        invalidationVersion += 1;
        emitChange();
      },
      setQueryData: <TData,>(queryKey: QueryKeyInput, updater: TData | ((oldData: TData | undefined) => TData)) => {
        const normalizedKey = normalizeQueryKey(queryKey);
        const cacheKey = queryKeyToString(normalizedKey);
        const current = getEntry<TData>(normalizedKey);
        const data = typeof updater === "function" ? (updater as (oldData: TData | undefined) => TData)(current?.data) : updater;

        queryCache.set(cacheKey, {
          queryKey: normalizedKey,
          data,
          error: undefined,
          isFetching: false,
          dataUpdatedAt: Date.now(),
        });
        emitChange();
      },
      clear: () => {
        queryCache.clear();
        clearVersion += 1;
        emitChange();
      },
    }),
    [],
  );
}
