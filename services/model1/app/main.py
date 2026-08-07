from fastapi import FastAPI

from app.schemas import (

    ComplaintRequest,

    PredictionResponse
)

from app.inference import (

    predict_authenticity
)

app = FastAPI(

    title="Grievance Intelligence API",

    version="2.0.0"
)

# =========================================
# HEALTH CHECK
# =========================================

@app.get("/")

def root():

    return {

        "message":
            "Grievance Intelligence API Running"
    }

# =========================================
# PREDICT
# =========================================

@app.post(

    "/predict",

    response_model=PredictionResponse
)

def predict(

    request: ComplaintRequest
):

    result = predict_authenticity(

        request.complaint
    )

    return result