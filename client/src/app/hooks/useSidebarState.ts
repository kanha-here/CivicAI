import { useEffect, useState } from "react";

const STORAGE_KEY = "officer-sidebar-collapsed";

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  return { isCollapsed, setIsCollapsed };
}
