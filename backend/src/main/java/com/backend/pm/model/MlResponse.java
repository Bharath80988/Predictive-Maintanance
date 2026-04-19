package com.backend.pm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response from the FastAPI ML prediction service.
 * Mirrors the exact nested JSON structure returned by POST /predict.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MlResponse {

    @JsonProperty("vehicle")
    private Vehicle vehicle;

    @JsonProperty("failure_risk")
    private FailureRisk failureRisk;

    @JsonProperty("time_to_failure")
    private TimeToFailure timeToFailure;

    @JsonProperty("model_confidence")
    private double modelConfidence;

    @JsonProperty("warnings")
    private List<String> warnings;

    // ---- Nested DTOs ----

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Vehicle {
        @JsonProperty("type")
        private String type;

        @JsonProperty("manufacturer")
        private String manufacturer;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailureRisk {
        @JsonProperty("probability")
        private double probability;

        @JsonProperty("risk_level")
        private String riskLevel;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeToFailure {
        @JsonProperty("estimated_hours")
        private Double estimatedHours;

        @JsonProperty("confidence_range")
        private String confidenceRange;
    }
}
