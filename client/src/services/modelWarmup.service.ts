const SPEECH_API_URL =
  import.meta.env.VITE_SPEECH_API_URL || "https://kanhacoderx-speechtext.hf.space";
const VERIFY_API_URL =
  import.meta.env.VITE_VERIFY_API_URL || "https://kanhacoderx-image-text-verify.hf.space";

export type VerifyModelStatus = "unknown" | "warming" | "ready" | "unavailable";

// Free Hugging Face Docker Spaces sleep after a short period of inactivity
// and go back to sleep again just as quickly — so "ping it once on page
// load" isn't enough; the wait has to be an actual poll loop that keeps
// checking until the container is really up and the model is loaded, not a
// fire-and-forget request that we just hope worked.
const WARMUP_POLL_INTERVAL_MS = 4000;
const WARMUP_MAX_WAIT_MS = 100_000;

async function pingWithRetry(url: string, init: RequestInit, attempts = 2) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(url, init);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return true;
    } catch (err) {
      const isLastAttempt = attempt === attempts;
      console.warn(`[modelWarmup] ${url} failed (attempt ${attempt}/${attempts})`, err);
      if (isLastAttempt) return false;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return false;
}

// The Space's /health route replies with e.g.
// {"status":"running","model_name":"...","model_loaded":true,"device":"cpu"}
// once it's actually ready to serve /verify-image-evidence requests. A
// non-OK response, a network error, or model_loaded !== true all mean "not
// ready yet" — that last case matters because the container can be up and
// answering /health before the (large, CPU-loaded) model has finished
// loading into memory.
async function isVerifyModelReady(): Promise<boolean> {
  try {
    const res = await fetch(`${VERIFY_API_URL}/health`, { method: "GET" });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return data?.model_loaded === true || data?.status === "running";
  } catch {
    return false;
  }
}

/**
 * Wakes the image-verification Space and waits until it's actually ready
 * to serve requests, instead of firing a single ping and hoping. Sleeping
 * free-tier Spaces wake on a plain GET to their root page (the same thing
 * that happens when a person opens the Space in a browser tab), so that's
 * step one; then this polls /health until the model reports loaded, or
 * gives up after ~100s.
 *
 * Safe to call multiple times — e.g. once on page mount, and again as a
 * manual "retry" after a failed verification attempt.
 */
export async function waitForVerifyModelReady(
  onStatusChange?: (status: VerifyModelStatus) => void,
): Promise<boolean> {
  onStatusChange?.("warming");

  await pingWithRetry(`${VERIFY_API_URL}/`, { method: "GET" }, 1);

  const deadline = Date.now() + WARMUP_MAX_WAIT_MS;
  while (Date.now() < deadline) {
    if (await isVerifyModelReady()) {
      onStatusChange?.("ready");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, WARMUP_POLL_INTERVAL_MS));
  }

  console.warn("[modelWarmup] verify model did not report ready within", WARMUP_MAX_WAIT_MS, "ms");
  onStatusChange?.("unavailable");
  return false;
}

// Best-effort fire-and-forget entry point for pages that just want the
// warm-up to happen in the background without tracking its outcome.
export function warmUpModelServices() {
  void pingWithRetry(`${SPEECH_API_URL}/health`, { method: "GET" });
  void waitForVerifyModelReady();
}
