const SPEECH_API_URL =
  import.meta.env.VITE_SPEECH_API_URL || "https://kanhacoderx-speechtext.hf.space";
const VERIFY_API_URL =
  import.meta.env.VITE_VERIFY_API_URL || "https://kanhacoderx-image-text-verify.hf.space";

// Free Hugging Face Docker Spaces sleep after inactivity. Waking one up (and,
// for the image-verify Space, actually loading its model into memory) can
// take anywhere from several seconds to a couple of minutes. Calling this
// once when the submit page mounts means that work happens in the
// background while the citizen is still filling in the classification step,
// instead of only starting once they've already uploaded a photo or hit
// record \u2014 shrinking the wait right when it matters.
//
// This is best-effort: failures are swallowed for the caller (a warm-up
// ping failing just means the first *real* request pays the cold-start
// cost, handled separately with its own error message) but are logged to
// the console so a flaky warm-up isn't silently invisible when diagnosing
// "verification isn't coming back" reports.
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
      // Brief backoff before retrying — covers a cold Space's first
      // request being dropped while its container is still starting.
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  return false;
}

export function warmUpModelServices() {
  void pingWithRetry(`${SPEECH_API_URL}/health`, { method: "GET" });

  // The verify API loads its (larger) model lazily on first use, but
  // exposes a dedicated endpoint to trigger that ahead of time.
  void pingWithRetry(`${VERIFY_API_URL}/load-model`, { method: "POST" });
}
