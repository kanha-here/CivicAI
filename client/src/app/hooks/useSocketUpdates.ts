import { useEffect } from "react";
import { io } from "socket.io-client";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const socketUrl =
  import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");

export function useSocketUpdates(scope = "operations", onInvalidate?: () => void) {
  useEffect(() => {
    const socket = io(socketUrl, {
      withCredentials: true,
      reconnectionAttempts: 5,
    });

    socket.emit("join:dashboard", scope);

    const invalidate = () => {
      if (onInvalidate) {
        onInvalidate();
      }
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('data:invalidated', { detail: { scope } }));
    };

    socket.on("ai:queued", invalidate);
    socket.on("ai:processing", invalidate);
    socket.on("ai:completed", invalidate);
    socket.on("ai:failed", invalidate);
    socket.on("complaint:updated", invalidate);
    socket.on("complaint:feedback", invalidate);

    return () => {
      socket.disconnect();
    };
  }, [scope, onInvalidate]);
}
