from pathlib import Path
from typing import Optional
import tempfile
import subprocess
import os

import torch
import librosa
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import WhisperProcessor, WhisperForConditionalGeneration


MODEL_NAME = os.getenv("MODEL_NAME", "openai/whisper-small")

app = FastAPI(
    title="Voice Complaint Transcriber API",
    description="Converts citizen grievance audio into text using Whisper.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later replace with your Vercel frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VoiceComplaintTranscriber:
    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.dtype = torch.float16 if self.device == "cuda" else torch.float32

        self.processor = WhisperProcessor.from_pretrained(self.model_name)

        self.model = WhisperForConditionalGeneration.from_pretrained(
            self.model_name,
            torch_dtype=self.dtype,
        ).to(self.device)

        self.model.eval()

    def convert_to_wav(self, input_path: Path) -> Path:
        output_path = input_path.with_suffix(".wav")

        subprocess.run(
            [
                "ffmpeg",
                "-y",
                "-i", str(input_path),
                "-ar", "16000",
                "-ac", "1",
                str(output_path),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        return output_path

    def transcribe(self, audio_path: Path, language: Optional[str] = "hi") -> str:
        if audio_path.suffix.lower() != ".wav":
            audio_path = self.convert_to_wav(audio_path)

        audio_array, _ = librosa.load(
            str(audio_path),
            sr=16000,
            mono=True,
        )

        inputs = self.processor(
            audio_array,
            sampling_rate=16000,
            return_tensors="pt",
        )

        input_features = inputs.input_features.to(
            device=self.device,
            dtype=self.dtype,
        )

        generate_kwargs = {
            "inputs": input_features,
            "max_new_tokens": 256,
        }

        if language and language != "auto":
            generate_kwargs["forced_decoder_ids"] = self.processor.get_decoder_prompt_ids(
                language=language,
                task="transcribe",
            )

        with torch.no_grad():
            predicted_ids = self.model.generate(**generate_kwargs)

        text = self.processor.batch_decode(
            predicted_ids,
            skip_special_tokens=True,
        )[0].strip()

        return text


transcriber = VoiceComplaintTranscriber()


@app.get("/")
def home():
    return {
        "message": "Voice Complaint Transcriber API is running",
        "model": MODEL_NAME,
        "device": transcriber.device,
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "device": transcriber.device,
    }


@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("hi"),  # hi / en / auto
):
    suffix = Path(file.filename).suffix or ".ogg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_path = Path(temp_file.name)
        temp_file.write(await file.read())

    wav_path = temp_path.with_suffix(".wav")

    try:
        text = transcriber.transcribe(
            audio_path=temp_path,
            language=language,
        )

        return {
            "transcribed_text": text,
            "language": language,
            "model": MODEL_NAME,
            "method": "whisper_direct_fastapi",
        }

    finally:
        if temp_path.exists():
            temp_path.unlink()

        if wav_path.exists():
            wav_path.unlink()