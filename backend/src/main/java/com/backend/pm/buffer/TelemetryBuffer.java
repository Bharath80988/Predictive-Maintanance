package com.backend.pm.buffer;

import com.backend.pm.model.SensorData;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe per-vehicle telemetry buffer using a sliding window approach.
 * Each vehicle maintains its own list of sensor readings.
 */
@Component
public class TelemetryBuffer {

    private final ConcurrentHashMap<String, List<SensorData>> vehicleBuffers = new ConcurrentHashMap<>();

    /**
     * Adds a sensor reading to the buffer for the given vehicle.
     *
     * @param data the sensor reading to buffer
     */
    public void addReading(SensorData data) {
        vehicleBuffers
                .computeIfAbsent(data.getVehicleId(), k -> Collections.synchronizedList(new ArrayList<>()))
                .add(data);
    }

    /**
     * Returns the current number of buffered readings for a vehicle.
     *
     * @param vehicleId the vehicle identifier
     * @return the current window size
     */
    public int getWindowSize(String vehicleId) {
        List<SensorData> readings = vehicleBuffers.get(vehicleId);
        return readings == null ? 0 : readings.size();
    }

    /**
     * Atomically returns a snapshot of all buffered readings and clears the buffer.
     * This prevents a race condition where a new reading could be added between
     * getting the snapshot and clearing—causing data loss.
     *
     * @param vehicleId the vehicle identifier
     * @return list of buffered sensor readings, or empty list if none
     */
    public List<SensorData> getReadingsAndClear(String vehicleId) {
        List<SensorData> readings = vehicleBuffers.get(vehicleId);
        if (readings == null) {
            return Collections.emptyList();
        }
        synchronized (readings) {
            List<SensorData> snapshot = new ArrayList<>(readings);
            readings.clear();
            return snapshot;
        }
    }
}
