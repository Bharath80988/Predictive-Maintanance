package com.backend.pm.service;

import com.backend.pm.buffer.TelemetryBuffer;
import com.backend.pm.model.MlResponse;
import com.backend.pm.model.PredictionResult;
import com.backend.pm.model.SensorData;
import com.backend.pm.model.WindowStatistics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Orchestrates the telemetry pipeline:
 * buffer → check window → aggregate → predict → respond → clear.
 */
@Slf4j
@Service
public class TelemetryService {

    private final TelemetryBuffer telemetryBuffer;
    private final AggregationService aggregationService;
    private final MlPredictionService mlPredictionService;
    private final int windowSize;

    public TelemetryService(TelemetryBuffer telemetryBuffer,
                            AggregationService aggregationService,
                            MlPredictionService mlPredictionService,
                            @Value("${telemetry.window.size}") int windowSize) {
        this.telemetryBuffer = telemetryBuffer;
        this.aggregationService = aggregationService;
        this.mlPredictionService = mlPredictionService;
        this.windowSize = windowSize;
    }

    /**
     * Processes an incoming telemetry reading.
     * <p>
     * Buffers the reading. When the window reaches the configured size,
     * runs the full aggregation → prediction → response pipeline and clears the buffer.
     *
     * @param sensorData the incoming sensor reading
     * @return PredictionResult if the window is complete, or null if still buffering
     */
    public PredictionResult processTelemetry(SensorData sensorData) {
        String vehicleId = sensorData.getVehicleId();

        // 1. Buffer the reading
        telemetryBuffer.addReading(sensorData);
        int currentSize = telemetryBuffer.getWindowSize(vehicleId);

        log.info("Vehicle [{}]: buffered reading {}/{}", vehicleId, currentSize, windowSize);

        // 2. Check if window is full
        if (currentSize < windowSize) {
            return null; // Still collecting — no prediction yet
        }

        log.info("Vehicle [{}]: window complete — starting pipeline", vehicleId);

        // 3. Get snapshot and clear buffer atomically
        List<SensorData> readings = telemetryBuffer.getReadingsAndClear(vehicleId);

        // 4. Aggregate statistics
        WindowStatistics stats = aggregationService.aggregate(readings);
        log.info("Vehicle [{}]: aggregation complete — avgTemp={}°C, avgVibration={}",
                vehicleId, stats.getAvgEngineTemperature(), stats.getAvgVibrationLevels());

        // 5. Call ML prediction service
        MlResponse mlResponse = mlPredictionService.predict(stats);

        // 6. Build combined result
        PredictionResult result = PredictionResult.builder()
                .vehicleId(vehicleId)
                .windowStatistics(stats)
                .prediction(PredictionResult.Prediction.builder()
                        .probability(mlResponse.getFailureRisk().getProbability())
                        .riskLevel(mlResponse.getFailureRisk().getRiskLevel())
                        .estimatedHoursToFailure(mlResponse.getTimeToFailure().getEstimatedHours())
                        .modelConfidence(mlResponse.getModelConfidence())
                        .build())
                .warnings(mlResponse.getWarnings() != null ? mlResponse.getWarnings() : Collections.emptyList())
                .build();

        log.info("Vehicle [{}]: prediction complete — risk={}, probability={}",
                vehicleId, result.getPrediction().getRiskLevel(), result.getPrediction().getProbability());

        return result;
    }
}
