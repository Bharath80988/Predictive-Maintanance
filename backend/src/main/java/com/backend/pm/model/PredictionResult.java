package com.backend.pm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Combined response returned to the frontend after a full window is processed.
 * Includes vehicle ID, window statistics, ML prediction, and any warnings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResult {

    @JsonProperty("vehicle_id")
    private String vehicleId;

    @JsonProperty("window_statistics")
    private WindowStatistics windowStatistics;

    @JsonProperty("prediction")
    private Prediction prediction;

    @JsonProperty("warnings")
    private List<String> warnings;

    // ---- Nested prediction block ----

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Prediction {

        @JsonProperty("probability")
        private double probability;

        @JsonProperty("risk_level")
        private String riskLevel;

        @JsonProperty("estimated_hours_to_failure")
        private Double estimatedHoursToFailure;

        @JsonProperty("model_confidence")
        private double modelConfidence;
    }
}
