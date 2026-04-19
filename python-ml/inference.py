import sys
import joblib
import numpy as np
import pandas as pd

MODEL_DIR = "models"

# ---- Load artifacts with graceful error handling ----
try:
    calibrated_clf = joblib.load(f"{MODEL_DIR}/failure_classifier.joblib")
    preprocessor = joblib.load(f"{MODEL_DIR}/preprocessor.joblib")
    categorical_features = joblib.load(f"{MODEL_DIR}/categorical_features.joblib")
    model_config = joblib.load(f"{MODEL_DIR}/model_config.joblib")
except FileNotFoundError as e:
    print(f"FATAL: Model artifact not found — {e}", file=sys.stderr)
    print("Ensure all .joblib files exist in the 'models/' directory.", file=sys.stderr)
    sys.exit(1)

# Pre-compute numeric columns once at startup to avoid per-request overhead
_categorical_set = set(categorical_features)
_numeric_features = [col for col in preprocessor.feature_names_in_ if col not in _categorical_set]


# ---- Risk mapping ----
def map_risk_level(prob: float) -> str:
    if prob < model_config["risk_thresholds"]["LOW"]:
        return "LOW"
    elif prob < model_config["risk_thresholds"]["MEDIUM"]:
        return "MEDIUM"
    else:
        return "HIGH"


# ---- Input validation ----
def validate_input(payload: dict):
    warnings = []

    required_fields = [
        "Vehicle_Type", "Make_and_Model", "Usage_Hours",
        "Engine_Temperature", "Actual_Load", "Load_Capacity",
        "Fuel_Consumption", "Vibration_Levels", "Predictive_Score",
        "Battery_Status", "Brake_Condition", "Oil_Quality",
        "Weather_Conditions", "Road_Conditions", "Route_Info",
        "Year_of_Manufacture", "Tire_Pressure",
        "Failure_History", "Anomalies_Detected"
    ]

    for field in required_fields:
        if field not in payload:
            raise ValueError(f"Missing mandatory field: {field}")

    if payload["Usage_Hours"] < 0:
        raise ValueError("Usage_Hours cannot be negative")

    if payload["Load_Capacity"] <= 0:
        raise ValueError("Load_Capacity must be positive")

    if not (0 <= payload["Predictive_Score"] <= 1):
        raise ValueError("Predictive_Score must be between 0 and 1")

    if payload["Engine_Temperature"] > 180:
        warnings.append("High engine temperature detected")

    return warnings


# ---- Prediction ----
def predict_maintenance(payload: dict) -> dict:
    warnings = validate_input(payload)

    df = pd.DataFrame([payload])

    # ---- Engineered features ----
    df["load_ratio"] = df["Actual_Load"] / df["Load_Capacity"]
    df["temp_load_stress"] = df["Engine_Temperature"] * df["load_ratio"]

    engineered_defaults = [
        "predictive_score_trend",
        "wear_acceleration",
        "anomaly_rate",
        "idle_vehicle_flag",
        "warning_fuel_spike",
        "warning_spike_vibration",
        "warning_temp_jump"
    ]

    for col in engineered_defaults:
        df[col] = 0.0

    # ---- Schema alignment ----
    for col in preprocessor.feature_names_in_:
        if col not in df.columns:
            df[col] = 0

    df = df[preprocessor.feature_names_in_]
    df = df.fillna(0)

    # ---- Type safety (using pre-computed sets) ----
    for col in _categorical_set:
        if col in df.columns:
            df[col] = df[col].astype(str)

    for col in _numeric_features:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # ---- Prediction ----
    prob = float(calibrated_clf.predict_proba(df)[0, 1])
    risk = map_risk_level(prob)

    est_hours = None
    if risk in ["MEDIUM", "HIGH"]:
        est_hours = (
            (1 - payload["Predictive_Score"]) * 120
            / (1 + df.loc[0, "load_ratio"])
        )
        est_hours = float(
            np.clip(est_hours, 0, model_config["max_estimated_hours"])
        )

    model_confidence = float(round(abs(prob - 0.5) * 2, 3))

    return {
        "vehicle": {
            "type": payload["Vehicle_Type"],
            "manufacturer": payload["Make_and_Model"]
        },
        "failure_risk": {
            "probability": round(prob, 4),
            "risk_level": risk
        },
        "time_to_failure": {
            "estimated_hours": None if est_hours is None else round(est_hours, 2),
            "confidence_range": "±25 hours" if est_hours is not None else ""
        },
        "model_confidence": model_confidence,
        "warnings": warnings
    }
