package com.backend.pm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload sent to the FastAPI ML prediction service.
 * Field names map to the exact JSON format expected by POST /predict.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MlRequest {

    @JsonProperty("Vehicle_Type")
    private String vehicleType;

    @JsonProperty("Make_and_Model")
    private String makeAndModel;

    @JsonProperty("Usage_Hours")
    private int usageHours;

    @JsonProperty("Engine_Temperature")
    private double engineTemperature;

    @JsonProperty("Actual_Load")
    private double actualLoad;

    @JsonProperty("Load_Capacity")
    private double loadCapacity;

    @JsonProperty("Fuel_Consumption")
    private double fuelConsumption;

    @JsonProperty("Vibration_Levels")
    private double vibrationLevels;

    @JsonProperty("Predictive_Score")
    private double predictiveScore;

    @JsonProperty("Battery_Status")
    private String batteryStatus;

    @JsonProperty("Brake_Condition")
    private String brakeCondition;

    @JsonProperty("Oil_Quality")
    private String oilQuality;

    @JsonProperty("Weather_Conditions")
    private String weatherConditions;

    @JsonProperty("Road_Conditions")
    private String roadConditions;

    @JsonProperty("Route_Info")
    private String routeInfo;

    @JsonProperty("Year_of_Manufacture")
    private int yearOfManufacture;

    @JsonProperty("Tire_Pressure")
    private double tirePressure;

    @JsonProperty("Failure_History")
    private int failureHistory;

    @JsonProperty("Anomalies_Detected")
    private int anomaliesDetected;
}
