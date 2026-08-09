// Default is the standard Hugging Face Spaces embed URL for
// kanhacoderx/Image-Text-verify
// (https://huggingface.co/spaces/kanhacoderx/Image-Text-verify).
// Override with VITE_VERIFY_API_URL if the Space ever moves or is renamed.
const VERIFY_API_URL =
  import.meta.env.VITE_VERIFY_API_URL || "https://kanhacoderx-image-text-verify.hf.space";

// Same reasoning as the speech API: free Docker Spaces cold-start slowly.
const VERIFY_TIMEOUT_MS = 90_000;

export type ImageVerificationResult = {
  complaint_text: string;
  image_match_score: number;
  verification_status: "strong_match" | "partial_match" | "weak_match";
  image_supports_complaint: boolean;
  strong_threshold: number;
  partial_threshold: number;
  method: string;
  model: string;
};

export type ImageVerificationOutcome =
  | { ok: true; result: ImageVerificationResult }
  | { ok: false; error: string };

/**
 * Verifies that a photo actually shows what the complaint describes, using
 * multimodal (Qwen3-VL) text/image embedding similarity.
 *
 * This calls the Space directly from the browser (its CORS policy already
 * allows any origin) rather than proxying through our own backend, so a
 * multi-MB photo only has to travel once.
 */
export async function verifyImageEvidence(
  complaintText: string,
  file: File,
): Promise<ImageVerificationOutcome> {
  try {
    const form = new FormData();
    form.append("complaint_text", complaintText);
    form.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);

    const response = await fetch(`${VERIFY_API_URL}/verify-image-evidence`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const detail = await response.json().catch(() => null);
      return { ok: false, error: detail?.detail || `Verification service returned ${response.status}` };
    }

    const result: ImageVerificationResult = await response.json();
    return { ok: true, result };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      error: timedOut
        ? "Image verification is taking longer than expected \u2014 the model may still be starting up."
        : "Couldn't reach the image verification service.",
    };
  }
}
