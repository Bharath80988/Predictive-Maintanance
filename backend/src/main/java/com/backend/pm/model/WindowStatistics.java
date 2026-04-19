package com.backend.pm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Aggregated statistics computed from a sliding window of sensor readings.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WindowStatistics {

    @JsonProperty("samples_collected")
    private int samplesCollected;

    @JsonProperty("avg_engine_temperature")
    private double avgEngineTemperature;

    @JsonProperty("avg_vibration_levels")
    private double avgVibrationLevels;

    @JsonProperty("avg_fuel_consumption")
    private double avgFuelConsumption;

    @JsonProperty("avg_load")
    private double avgLoad;

    @JsonProperty("avg_tire_pressure")
    private double avgTirePressure;
}
