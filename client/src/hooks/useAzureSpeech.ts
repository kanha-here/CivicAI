import { useRef, useState } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";
import toast from "react-hot-toast";
import { dashboardService } from "../services/dashboard.service";

export const speechLanguages = [
  { label: "Hindi", value: "hi-IN" },
  { label: "English", value: "en-IN" },
  { label: "Bengali", value: "bn-IN" },
  { label: "Tamil", value: "ta-IN" },
  { label: "Telugu", value: "te-IN" },
  { label: "Marathi", value: "mr-IN" },
  { label: "Gujarati", value: "gu-IN" },
  { label: "Kannada", value: "kn-IN" },
  { label: "Malayalam", value: "ml-IN" },
  { label: "Punjabi", value: "pa-IN" },
];

type UseAzureSpeechOptions = {
  language: string;
  onText: (text: string) => void;
};

export function useAzureSpeech({ language, onText }: UseAzureSpeechOptions) {
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);

  const stopListening = () => {
    const recognizer = recognizerRef.current;
    if (!recognizer) {
      setIsListening(false);
      return;
    }

    recognizer.stopContinuousRecognitionAsync(
      () => {
        recognizer.close();
        recognizerRef.current = null;
        setIsListening(false);
      },
      () => {
        recognizer.close();
        recognizerRef.current = null;
        setIsListening(false);
      },
    );
  };

  const startListening = async () => {
    try {
      const { token, region } = await dashboardService.speechToken();
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = language;

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      recognizer.recognized = (_, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && event.result.text) {
          onText(event.result.text);
        }
      };

      recognizer.canceled = (_, event) => {
        toast.error(event.errorDetails || "Speech recognition stopped");
        stopListening();
      };

      recognizer.sessionStopped = () => stopListening();

      recognizer.startContinuousRecognitionAsync(
        () => {
          setIsListening(true);
          toast.success("Listening started");
        },
        (error) => {
          toast.error(error || "Unable to start speech recognition");
          recognizer.close();
          recognizerRef.current = null;
        },
      );
    } catch (error: any) {
      toast.error(error.message || "Azure Speech is not available");
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return {
    isListening,
    toggleListening,
    stopListening,
  };
}
