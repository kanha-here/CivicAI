from pathlib import Path
from typing import Optional
import threading

from PIL import Image
import torch
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util


MODEL_NAME = "Qwen/Qwen3-VL-Embedding-2B"


class VerificationResponse(BaseModel):
    complaint_text: str
    image_match_score: float
    verification_status: str
    image_supports_complaint: bool
    strong_threshold: float
    partial_threshold: float
    method: str
    model: str


class HealthResponse(BaseModel):
    status: str
    model_name: str
    model_loaded: bool
    device: str


class VisualEvidenceVerifier:
    """
    Multilingual image-text verification using Qwen3-VL embeddings.

    Logic:
    - Encode complaint text
    - Encode uploaded image
    - Compare embeddings using cosine similarity
    - Return match/partial/weak verification result
    """

    def __init__(
        self,
        model_name: str = MODEL_NAME,
        strong_threshold: float = 0.55,
        partial_threshold: float = 0.35,
    ):
        self.model_name = model_name
        self.strong_threshold = strong_threshold
        self.partial_threshold = partial_threshold
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model: Optional[SentenceTransformer] = None
        self._lock = threading.Lock()

    def load_model(self) -> SentenceTransformer:
        """
        Lazy model loading.
        This prevents the app from failing during startup if model loading is slow.
        The first request that needs the model will load it.
        """
        if self.model is None:
            with self._lock:
                if self.model is None:
                    self.model = SentenceTransformer(
                        self.model_name,
                        device=self.device,
                    )

        return self.model

    def _load_image(self, image_path: Path) -> Image.Image:
        try:
            return Image.open(image_path).convert("RGB")
        except Exception as error:
            raise ValueError(f"Invalid image file: {error}") from error

    def _decide_status(self, score: float) -> tuple[str, bool]:
        if score >= self.strong_threshold:
            return "strong_match", True

        if score >= self.partial_threshold:
            return "partial_match", True

        return "weak_match", False

    def verify(self, complaint_text: str, image_path: Path) -> VerificationResponse:
        if not complaint_text or len(complaint_text.strip()) < 3:
            raise ValueError("Complaint text is too short.")

        if not image_path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        model = self.load_model()
        image = self._load_image(image_path)

        text_embedding = model.encode(
            [complaint_text],
            convert_to_tensor=True,
            normalize_embeddings=True,
        )

        image_embedding = model.encode(
            [image],
            convert_to_tensor=True,
            normalize_embeddings=True,
        )

        score = float(util.cos_sim(text_embedding, image_embedding)[0][0])
        status, supports = self._decide_status(score)

        return VerificationResponse(
            complaint_text=complaint_text,
            image_match_score=round(score, 4),
            verification_status=status,
            image_supports_complaint=supports,
            strong_threshold=self.strong_threshold,
            partial_threshold=self.partial_threshold,
            method="qwen3_vl_embedding_image_text_similarity",
            model=self.model_name,
        )

    def compare_texts(self, text_a: str, text_b: str) -> dict:
        """
        Debug helper to verify model embedding similarity for two texts.
        Useful before testing image upload.
        """
        if not text_a or not text_b:
            raise ValueError("Both text_a and text_b are required.")

        model = self.load_model()

        embeddings = model.encode(
            [text_a, text_b],
            convert_to_tensor=True,
            normalize_embeddings=True,
        )

        score = float(util.cos_sim(embeddings[0], embeddings[1]))

        return {
            "text_a": text_a,
            "text_b": text_b,
            "similarity_score": round(score, 4),
            "model": self.model_name,
        }
