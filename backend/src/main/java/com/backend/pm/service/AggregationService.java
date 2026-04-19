package com.backend.pm.service;

import com.backend.pm.model.SensorData;
import com.backend.pm.model.WindowStatistics;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Computes aggregated statistics from a window of sensor readings.
 * Performs simple mean calculations over all numeric telemetry fields.
 */
@Service
public class AggregationService {

    /**
     * Aggregates a list of sensor readings into window statistics.
     *
     * @param readings the sensor readings to aggregate
     * @return computed statistics for the window
     */
    public WindowStatistics aggregate(List<SensorData> readings) {
        int count = readings.size();

        double avgEngineTemp = readings.stream()
                .mapToDouble(SensorData::getEngineTemperature)
                .average()
                .orElse(0.0);

        double avgVibration = readings.stream()
                .mapToDouble(SensorData::getVibrationLevels)
                .average()
                .orElse(0.0);

        double avgFuelConsumption = readings.stream()
                .mapToDouble(SensorData::getFuelConsumption)
                .average()
                .orElse(0.0);

        double avgLoad = readings.stream()
                .mapToDouble(SensorData::getActualLoad)
                .average()
                .orElse(0.0);

        double avgTirePressure = readings.stream()
                .mapToDouble(SensorData::getTirePressure)
                .average()
                .orElse(0.0);

        return WindowStatistics.builder()
                .samplesCollected(count)
                .avgEngineTemperature(round(avgEngineTemp))
                .avgVibrationLevels(round(avgVibration))
                .avgFuelConsumption(round(avgFuelConsumption))
                .avgLoad(round(avgLoad))
                .avgTirePressure(round(avgTirePressure))
                .build();
    }

    /**
     * Rounds a double to 2 decimal places.
     */
    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
