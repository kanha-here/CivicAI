from pydantic import BaseModel


class ComplaintRequest(BaseModel):

    complaint: str


class PredictionResponse(BaseModel):

    complaint: str

    validity: str

    validity_confidence: float

    priority: str

    priority_confidence: float

    trust_score: float