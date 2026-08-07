from pathlib import Path
import tempfile

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from inference import (
    MODEL_NAME,
    HealthResponse,
    VerificationResponse,
    VisualEvidenceVerifier,
)


app = FastAPI(
    title="Visual Evidence Verification API",
    description=(
        "Verifies whether an uploaded image supports a multilingual citizen "
        "complaint using Qwen3-VL multimodal embeddings."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later replace with your Vercel frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


verifier = VisualEvidenceVerifier()
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@app.get("/", response_model=HealthResponse)
def home():
    return HealthResponse(
        status="running",
        model_name=MODEL_NAME,
        model_loaded=verifier.model is not None,
        device=verifier.device,
    )


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        model_name=MODEL_NAME,
        model_loaded=verifier.model is not None,
        device=verifier.device,
    )


@app.post("/load-model")
def load_model():
    """
    Optional endpoint to warm up the model before demo.
    First call may take time.
    """
    verifier.load_model()

    return {
        "status": "loaded",
        "model": MODEL_NAME,
        "device": verifier.device,
    }


@app.post("/verify-image-evidence", response_model=VerificationResponse)
async def verify_image_evidence(
    complaint_text: str = Form(...),
    file: UploadFile = File(...),
):
    suffix = Path(file.filename or "").suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type '{suffix}'. Use jpg, jpeg, png, or webp.",
        )

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_path = Path(temp_file.name)
            temp_file.write(await file.read())

        return verifier.verify(
            complaint_text=complaint_text,
            image_path=temp_path,
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error

    finally:
        if temp_path and temp_path.exists():
            temp_path.unlink()


@app.post("/debug-compare-texts")
def debug_compare_texts(
    text_a: str = Form(...),
    text_b: str = Form(...),
):
    try:
        return verifier.compare_texts(text_a=text_a, text_b=text_b)

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error)) from error
