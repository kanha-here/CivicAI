import os
import json

import numpy as np
import onnxruntime as ort

# pyrefly: ignore [missing-import]
from transformers import AutoTokenizer


# =========================================
# MODEL DIRECTORY
# =========================================

MODEL_DIR = os.path.join(

    os.path.dirname(__file__),

    "models"
)

# =========================================
# LOAD TOKENIZER
# =========================================

tokenizer = AutoTokenizer.from_pretrained(
    MODEL_DIR
)

# =========================================
# LOAD PRIORITY MAP
# =========================================

with open(

    os.path.join(
        MODEL_DIR,
        "priority_map.json"
    ),

    "r"
) as f:

    priority_map = json.load(f)

# =========================================
# LOAD ONNX MODEL
# =========================================

session = ort.InferenceSession(

    os.path.join(
        MODEL_DIR,
        "grievance_multitask_model.onnx"
    ),

    providers=["CPUExecutionProvider"]
)

# =========================================
# SOFTMAX
# =========================================

def softmax(x):

    exp_x = np.exp(
        x - np.max(x)
    )

    return exp_x / exp_x.sum()

# =========================================
# PREDICT FUNCTION
# =========================================

def predict_authenticity(text):

    inputs = tokenizer(

        text,

        return_tensors="np",

        truncation=True,

        padding="max_length",

        max_length=384
    )

    ort_inputs = {

        "input_ids":
            inputs["input_ids"].astype(np.int64),

        "attention_mask":
            inputs["attention_mask"].astype(np.int64)
    }

    outputs = session.run(

        None,

        ort_inputs
    )

    # =====================================
    # OUTPUTS
    # =====================================

    validity_logits = outputs[0]

    priority_logits = outputs[1]

    trust_output = outputs[2]

    # =====================================
    # VALIDITY
    # =====================================

    validity_probs = softmax(
        validity_logits[0]
    )

    fake_score = float(
        validity_probs[0]
    )

    authentic_score = float(
        validity_probs[1]
    )

    validity = (

        "Authentic"

        if authentic_score > fake_score

        else "Fake"
    )

    # =====================================
    # PRIORITY
    # =====================================

    priority_probs = softmax(
        priority_logits[0]
    )

    priority_idx = int(
        np.argmax(priority_probs)
    )

    priority = priority_map[
        str(priority_idx)
    ]

    priority_confidence = float(
        np.max(priority_probs)
    )

    # =====================================
    # TRUST SCORE
    # =====================================

    trust_score = float(
        trust_output[0]
    )

    # =====================================
    # RESPONSE
    # =====================================

    return {

        "complaint":
            text,

        "validity":
            validity,

        "validity_confidence":
            round(
                authentic_score * 100,
                2
            ),

        "priority":
            priority,

        "priority_confidence":
            round(
                priority_confidence * 100,
                2
            ),

        "trust_score":
            round(
                trust_score,
                3
            )
    }