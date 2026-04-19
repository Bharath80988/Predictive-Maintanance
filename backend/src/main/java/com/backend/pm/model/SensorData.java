package com.backend.pm.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single telemetry reading from a vehicle sensor.
 * Received from the frontend via POST /api/vehicle/telemetry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SensorData {

    @NotBlank(message = "vehicleId must not be blank")
    @JsonProperty("vehicleId")
    private String vehicleId;

    @Positive(message = "engineTemperature must be positive")
    @JsonProperty("engineTemperature")
    private double engineTemperature;

    @PositiveOrZero(message = "vibrationLevels must be >= 0")
    @JsonProperty("vibrationLevels")
    private double vibrationLevels;

    @PositiveOrZero(message = "fuelConsumption must be >= 0")
    @JsonProperty("fuelConsumption")
    private double fuelConsumption;

    @PositiveOrZero(message = "actualLoad must be >= 0")
    @JsonProperty("actualLoad")
    private double actualLoad;

    @Positive(message = "tirePressure must be positive")
    @JsonProperty("tirePressure")
    private double tirePressure;

    @JsonProperty("timestamp")
    private long timestamp;
}
