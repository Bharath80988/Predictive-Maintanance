package com.backend.pm.client;

import com.backend.pm.model.MlRequest;
import com.backend.pm.model.MlResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * HTTP client that communicates with the FastAPI ML prediction service.
 */
@Slf4j
@Component
public class MlClient {

    private final RestTemplate restTemplate;
    private final String mlApiUrl;

    public MlClient(RestTemplate restTemplate,
                    @Value("${ml.api.url}") String mlApiUrl) {
        this.restTemplate = restTemplate;
        this.mlApiUrl = mlApiUrl;
    }

    /**
     * Sends a prediction request to the ML service and returns the parsed response.
     *
     * @param request the ML model input payload
     * @return prediction response from the ML service
     */
    public MlResponse getPrediction(MlRequest request) {
        log.info("Sending prediction request to ML service at {}", mlApiUrl);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<MlRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<MlResponse> response = restTemplate.postForEntity(
                mlApiUrl, entity, MlResponse.class
        );

        log.info("Received prediction response: risk_level={}",
                response.getBody() != null ? response.getBody().getFailureRisk().getRiskLevel() : "null");

        return response.getBody();
    }
}
