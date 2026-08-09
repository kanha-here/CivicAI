import { useRef, useState } from "react";
import toast from "react-hot-toast";

// Default is the standard Hugging Face Spaces embed URL for
// kanhacoderx/SpeechText (https://huggingface.co/spaces/kanhacoderx/SpeechText).
// Override with VITE_SPEECH_API_URL if the Space ever moves or is renamed.
const SPEECH_API_URL =
  import.meta.env.VITE_SPEECH_API_URL || "https://kanhacoderx-speechtext.hf.space";

// The UI's language dropdown uses Azure-style locale codes (e.g. "hi-IN").
// The Whisper API just wants the short language code.
function toWhisperLanguage(azureLocale: string): string {
  return azureLocale.split("-")[0] || "en";
}

// Docker Spaces on the free tier "sleep" after inactivity and can take
// well over a minute to cold-start (loading a Whisper model on CPU isn't
// instant). Give it real room rather than failing a legitimate first call.
const TRANSCRIBE_TIMEOUT_MS = 90_000;

type UseVoiceTranscriptionOptions = {
  language: string; // Azure-style locale, e.g. "hi-IN"
  onText: (text: string) => void;
};

export function useVoiceTranscription({ language, onText }: UseVoiceTranscriptionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const transcribe = async (blob: Blob) => {
    setIsTranscribing(true);
    const toastId = toast.loading("Transcribing voice note\u2026 this can take a little while on first use.");

    try {
      const form = new FormData();
      form.append("file", blob, "complaint-voice-note.webm");
      form.append("language", toWhisperLanguage(language));

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TRANSCRIBE_TIMEOUT_MS);

      const response = await fetch(`${SPEECH_API_URL}/transcribe`, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Transcription service returned ${response.status}`);
      }

      const data: { transcribed_text?: string } = await response.json();
      const text = data.transcribed_text?.trim();

      if (text) {
        onText(text);
        toast.success("Voice note transcribed.", { id: toastId });
      } else {
        toast.error("Didn't catch any speech in that recording.", { id: toastId });
      }
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === "AbortError"
          ? "Transcription is taking longer than expected. The model may still be starting up \u2014 please try again shortly."
          : "Couldn't reach the voice transcription service. Please try again.";
      toast.error(message, { id: toastId });
    } finally {
      setIsTranscribing(false);
    }
  };

  const startListening = async () => {
    if (!window.isSecureContext) {
      toast.error("Voice recording requires a secure (HTTPS) connection.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Voice recording isn't supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        cleanupStream();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        if (blob.size > 0) transcribe(blob);
      };

      recorder.start();
      setIsListening(true);
      toast.success("Listening\u2026 tap again to stop and transcribe.");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      const messages: Record<string, string> = {
        NotAllowedError: "Microphone permission was denied. Allow microphone access for this site, then try again.",
        NotFoundError: "No microphone was found on this device.",
        NotReadableError: "The microphone is already in use by another app or tab.",
      };
      toast.error(messages[name] || "Couldn't access the microphone.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      cleanupStream();
    }
    mediaRecorderRef.current = null;
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return {
    isListening,
    isTranscribing,
    toggleListening,
    stopListening,
  };
}
