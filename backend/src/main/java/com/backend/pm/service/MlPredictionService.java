package com.backend.pm.service;

import com.backend.pm.client.MlClient;
import com.backend.pm.model.MlRequest;
import com.backend.pm.model.MlResponse;
import com.backend.pm.model.WindowStatistics;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Builds the ML request payload from aggregated statistics,
 * performs anomaly detection, and calls the ML prediction service.
 */
@Slf4j
@Service
public class MlPredictionService {

    private final MlClient mlClient;
    private final String defaultVehicleType;
    private final String defaultMakeAndModel;
    private final int defaultUsageHours;
    private final String defaultBatteryStatus;
    private final String defaultBrakeCondition;
    private final String defaultOilQuality;
    private final int defaultLoadCapacity;
    private final int defaultYearOfManufacture;

    public MlPredictionService(MlClient mlClient,
                               @Value("${ml.defaults.vehicle-type:Truck}") String defaultVehicleType,
                               @Value("${ml.defaults.make-and-model:AshokLeyland_1616}") String defaultMakeAndModel,
                               @Value("${ml.defaults.usage-hours:5200}") int defaultUsageHours,
                               @Value("${ml.defaults.battery-status:Good}") String defaultBatteryStatus,
                               @Value("${ml.defaults.brake-condition:Fair}") String defaultBrakeCondition,
                               @Value("${ml.defaults.oil-quality:Good}") String defaultOilQuality,
                               @Value("${ml.defaults.load-capacity:16}") int defaultLoadCapacity,
                               @Value("${ml.defaults.year-of-manufacture:2019}") int defaultYearOfManufacture) {
        this.mlClient = mlClient;
        this.defaultVehicleType = defaultVehicleType;
        this.defaultMakeAndModel = defaultMakeAndModel;
        this.defaultUsageHours = defaultUsageHours;
        this.defaultBatteryStatus = defaultBatteryStatus;
        this.defaultBrakeCondition = defaultBrakeCondition;
        this.defaultOilQuality = defaultOilQuality;
        this.defaultLoadCapacity = defaultLoadCapacity;
        this.defaultYearOfManufacture = defaultYearOfManufacture;
    }

    /**
     * Builds an ML request from window statistics, detects anomalies,
     * sends to ML service, and returns the prediction response along with warnings.
     *
     * @param stats the aggregated window statistics
     * @return ML prediction response
     */
    public MlResponse predict(WindowStatistics stats) {
        List<String> anomalyWarnings = detectAnomalies(stats);
        int anomalyCount = anomalyWarnings.size();

        // Compute a simple predictive score based on normalized sensor values
        double predictiveScore = computePredictiveScore(stats);

        MlRequest request = MlRequest.builder()
                .vehicleType(defaultVehicleType)
                .makeAndModel(defaultMakeAndModel)
                .usageHours(defaultUsageHours)
                .engineTemperature(stats.getAvgEngineTemperature())
                .actualLoad(stats.getAvgLoad())
                .loadCapacity(defaultLoadCapacity)
                .fuelConsumption(stats.getAvgFuelConsumption())
                .vibrationLevels(stats.getAvgVibrationLevels())
                .predictiveScore(predictiveScore)
                .batteryStatus(defaultBatteryStatus)
                .brakeCondition(defaultBrakeCondition)
                .oilQuality(defaultOilQuality)
                .weatherConditions("Clear")
                .roadConditions("Highway")
                .routeInfo("Intercity")
                .yearOfManufacture(defaultYearOfManufacture)
                .tirePressure(stats.getAvgTirePressure())
                .failureHistory(1)
                .anomaliesDetected(anomalyCount)
                .build();

        log.info("Sending ML request with {} anomalies detected", anomalyCount);

        MlResponse response = mlClient.getPrediction(request);

        // Merge anomaly warnings with any ML service warnings
        if (response != null && response.getWarnings() != null) {
            List<String> allWarnings = new ArrayList<>(response.getWarnings());
            allWarnings.addAll(anomalyWarnings);
            response.setWarnings(allWarnings);
        } else if (response != null) {
            response.setWarnings(anomalyWarnings);
        }

        return response;
    }

    /**
     * Performs simple threshold-based anomaly detection on aggregated stats.
     *
     * @param stats the window statistics to check
     * @return list of warning messages
     */
    private List<String> detectAnomalies(WindowStatistics stats) {
        List<String> warnings = new ArrayList<>();

        if (stats.getAvgEngineTemperature() > 130) {
            warnings.add("ALERT: Average engine temperature exceeds 130°C — possible overheating");
            log.warn("Temperature anomaly detected: avg={}°C", stats.getAvgEngineTemperature());
        }
        if (stats.getAvgVibrationLevels() > 1.0) {
            warnings.add("ALERT: Average vibration levels exceed 1.0 — potential mechanical issue");
            log.warn("Vibration anomaly detected: avg={}", stats.getAvgVibrationLevels());
        }
        if (stats.getAvgTirePressure() < 30) {
            warnings.add("ALERT: Average tire pressure below 30 PSI — check tires immediately");
            log.warn("Tire pressure anomaly detected: avg={} PSI", stats.getAvgTirePressure());
        }

        return warnings;
    }

    /**
     * Computes a simple predictive score from sensor statistics.
     * Normalizes temperature, vibration, and tire pressure into a 0–1 score.
     */
    private double computePredictiveScore(WindowStatistics stats) {
        double tempScore = Math.min(stats.getAvgEngineTemperature() / 200.0, 1.0);
        double vibScore = Math.min(stats.getAvgVibrationLevels() / 2.0, 1.0);
        double tireScore = stats.getAvgTirePressure() < 30 ? 0.8 : 0.3;

        double score = (tempScore + vibScore + tireScore) / 3.0;
        return Math.round(score * 100.0) / 100.0;
    }
}
