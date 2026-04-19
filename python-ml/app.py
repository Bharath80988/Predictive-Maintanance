from fastapi import FastAPI, HTTPException
from inference import predict_maintenance

app = FastAPI(title="Predictive Maintenance ML Service")


@app.get("/")
def root():
    return {"status": "ML service running"}


@app.post("/predict")
def predict(payload: dict):
    try:
        return predict_maintenance(payload)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception:
        raise HTTPException(status_code=500, detail="Internal model error")
