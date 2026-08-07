from pathlib import Path
from typing import Dict, List, Optional

import json
import joblib
import numpy as np

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sentence_transformers import SentenceTransformer


# Paths


BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "best_logistic_embedding_model.joblib"
METADATA_PATH = BASE_DIR / "models" / "best_model_metadata.json"



# FastAPI app


app = FastAPI(
    title="Grievance Department Classifier API",
    description="Classifies citizen complaints into government departments using MiniLM embeddings + Logistic Regression.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Request / Response Schemas


class DepartmentPredictionRequest(BaseModel):
    complaint_text: str = Field(
        ...,
        min_length=3,
        description="Citizen complaint text",
        example="Garbage is dumped in an empty plot and bad smell is coming."
    )
    location: Optional[str] = Field(
        default="unknown",
        description="Optional location, ward, zone, city, or area",
        example="Ward 12"
    )


class ClassProbability(BaseModel):
    department: str
    probability: float


class DepartmentPredictionResponse(BaseModel):
    complaint_text: str
    predicted_department: str
    confidence: float
    probabilities: List[ClassProbability]
    model: str
    method: str


class BatchDepartmentPredictionRequest(BaseModel):
    complaints: List[DepartmentPredictionRequest]


class BatchDepartmentPredictionResponse(BaseModel):
    predictions: List[DepartmentPredictionResponse]



# Model service


class DepartmentClassifierService:
    def __init__(self, model_path: Path, metadata_path: Path):
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        if not metadata_path.exists():
            raise FileNotFoundError(f"Metadata file not found: {metadata_path}")

        with open(metadata_path, "r", encoding="utf-8") as file:
            self.metadata = json.load(file)

        self.embedding_model_name = self.metadata.get(
            "embedding_model_name",
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

        model_package = joblib.load(model_path)

        if isinstance(model_package, dict):
            self.classifier = model_package["classifier"]
            self.model_classes = model_package.get("classes", list(self.classifier.classes_))
            self.embedding_model_name = model_package.get(
                "embedding_model_name",
                self.embedding_model_name
            )
        else:
            self.classifier = model_package
            self.model_classes = list(self.classifier.classes_)

        self.embedding_model = SentenceTransformer(self.embedding_model_name)

    def predict(self, complaint_text: str) -> Dict:
        text = str(complaint_text).strip()

        embedding = self.embedding_model.encode(
            [text],
            convert_to_numpy=True,
            normalize_embeddings=True
        )

        predicted_department = self.classifier.predict(embedding)[0]

        if hasattr(self.classifier, "predict_proba"):
            probabilities = self.classifier.predict_proba(embedding)[0]
            classes = self.classifier.classes_

            probability_items = [
                {
                    "department": str(cls),
                    "probability": float(prob)
                }
                for cls, prob in zip(classes, probabilities)
            ]

            probability_items = sorted(
                probability_items,
                key=lambda item: item["probability"],
                reverse=True
            )

            confidence = float(max(probabilities))

        else:
            probability_items = [
                {
                    "department": str(predicted_department),
                    "probability": 1.0
                }
            ]
            confidence = 1.0

        return {
            "predicted_department": str(predicted_department),
            "confidence": confidence,
            "probabilities": probability_items,
        }


classifier_service = DepartmentClassifierService(
    model_path=MODEL_PATH,
    metadata_path=METADATA_PATH
)



# Routes


@app.get("/")
def home():
    return {
        "message": "Grievance Department Classifier API is running",
        "embedding_model": classifier_service.embedding_model_name,
        "classifier": classifier_service.metadata.get("classifier", "unknown"),
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": True,
        "embedding_model": classifier_service.embedding_model_name,
        "classifier": classifier_service.metadata.get("classifier", "unknown"),
    }


@app.get("/model-info")
def model_info():
    return classifier_service.metadata


@app.post("/predict-department", response_model=DepartmentPredictionResponse)
def predict_department(request: DepartmentPredictionRequest):
    result = classifier_service.predict(request.complaint_text)

    return {
        "complaint_text": request.complaint_text,
        "predicted_department": result["predicted_department"],
        "confidence": result["confidence"],
        "probabilities": result["probabilities"],
        "model": classifier_service.embedding_model_name,
        "method": "MiniLM embeddings + Logistic Regression",
    }


@app.post("/batch-predict-department", response_model=BatchDepartmentPredictionResponse)
def batch_predict_department(request: BatchDepartmentPredictionRequest):
    predictions = []

    for item in request.complaints:
        result = classifier_service.predict(item.complaint_text)

        predictions.append({
            "complaint_text": item.complaint_text,
            "predicted_department": result["predicted_department"],
            "confidence": result["confidence"],
            "probabilities": result["probabilities"],
            "model": classifier_service.embedding_model_name,
            "method": "MiniLM embeddings + Logistic Regression",
        })

    return {
        "predictions": predictions
    }