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
// This is best-effort: failures are swallowed on purpose. A warm-up ping
// failing just means the first *real* request pays the cold-start cost
// (handled separately, with its own error message) \u2014 it isn't itself
// something to alarm the citizen about.
export function warmUpModelServices() {
  fetch(`${SPEECH_API_URL}/health`).catch(() => undefined);

  // The verify API loads its (larger) model lazily on first use, but
  // exposes a dedicated endpoint to trigger that ahead of time.
  fetch(`${VERIFY_API_URL}/load-model`, { method: "POST" }).catch(() => undefined);
}
