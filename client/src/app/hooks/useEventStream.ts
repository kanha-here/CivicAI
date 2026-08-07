import { useEffect, useRef } from "react";

type EventStreamHandler<T> = (payload: T) => void;

interface EventStreamOptions<T> {
  url?: string;
  enabled?: boolean;
  onMessage?: EventStreamHandler<T>;
  onError?: (error: unknown) => void;
}

export function useEventStream<T>({
  url,
  enabled = true,
  onMessage,
  onError,
}: EventStreamOptions<T>) {
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!url || !enabled) {
      return;
    }

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onmessage = (event) => {
      if (!onMessage) {
        return;
      }

      try {
        const parsed = JSON.parse(event.data) as T;
        onMessage(parsed);
      } catch (error) {
        if (onError) {
          onError(error);
        }
      }
    };

    source.onerror = (event) => {
      if (onError) {
        onError(event);
      }
      source.close();
    };

    return () => {
      source.close();
    };
  }, [url, enabled, onMessage, onError]);
}
