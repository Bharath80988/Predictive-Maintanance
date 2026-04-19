package com.backend.pm.controller;

import com.backend.pm.model.PredictionResult;
import com.backend.pm.model.SensorData;
import com.backend.pm.service.TelemetryService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for vehicle telemetry ingestion.
 * Accepts sensor readings and returns prediction results when a full window is processed.
 */
@Slf4j
@RestController
@RequestMapping("/api/vehicle")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final TelemetryService telemetryService;

    public VehicleController(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }

    /**
     * POST /api/vehicle/telemetry
     * <p>
     * Accepts a single telemetry reading from the frontend.
     * Returns 200 with the prediction result if the window is complete,
     * or 202 (Accepted) with a status message if still buffering.
     *
     * @param sensorData the telemetry payload
     * @return prediction result or buffering acknowledgement
     */
    @PostMapping("/telemetry")
    public ResponseEntity<?> receiveTelemetry(@Valid @RequestBody SensorData sensorData) {
        log.info("Received telemetry from vehicle [{}]", sensorData.getVehicleId());

        PredictionResult result = telemetryService.processTelemetry(sensorData);

        if (result != null) {
            // Window complete — return full prediction
            return ResponseEntity.ok(result);
        }

        // Still buffering — return acknowledgement
        return ResponseEntity.accepted().body(Map.of(
                "status", "buffering",
                "vehicle_id", sensorData.getVehicleId(),
                "message", "Telemetry received. Waiting for more data to complete the analysis window."
        ));
    }
}
