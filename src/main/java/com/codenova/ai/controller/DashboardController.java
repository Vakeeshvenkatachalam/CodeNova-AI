package com.codenova.ai.controller;

import com.codenova.ai.model.dto.DashboardInsightResponse;
import com.codenova.ai.model.dto.DashboardSummaryResponse;
import com.codenova.ai.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary(Principal principal) {
        DashboardSummaryResponse response = dashboardService.getSummary(principal.getName());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/insights")
    public ResponseEntity<DashboardInsightResponse> getInsights(Principal principal) {
        DashboardInsightResponse response = dashboardService.getInsights(principal.getName());
        return ResponseEntity.ok(response);
    }
}
