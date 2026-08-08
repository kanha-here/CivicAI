import { useTheme } from "next-themes";

/**
 * Returns whether the app is currently in dark mode, backed by the same
 * next-themes provider used everywhere else in the app (see
 * app/components/theme-provider.tsx). Only used for small JS-driven bits
 * (e.g. swapping the Sun/Moon icon) — actual section styling uses
 * Tailwind's `dark:` variant classes directly, same convention as the
 * rest of the app, since those are driven by the DOM's `dark` class and
 * don't have the hydration-timing race a JS boolean read does.
 */
export function useIsDark() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark";
}
