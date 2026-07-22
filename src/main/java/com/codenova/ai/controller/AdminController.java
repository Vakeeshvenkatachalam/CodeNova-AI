package com.codenova.ai.controller;

import com.codenova.ai.model.dto.*;
import com.codenova.ai.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserSummaryDto>> listUsers() {
        List<UserSummaryDto> response = adminService.listUsers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/metrics")
    public ResponseEntity<AdminMetricsResponse> getPlatformMetrics() {
        AdminMetricsResponse response = adminService.getPlatformMetrics();
        return ResponseEntity.ok(response);
    }

    @PostMapping("/users/{id}/access")
    public ResponseEntity<Map<String, String>> toggleUserAccess(
            @PathVariable("id") Long userId,
            @RequestParam("action") String action) {
        adminService.toggleUserAccess(userId, action);
        return ResponseEntity.ok(Collections.singletonMap("message", "User access updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable("id") Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Collections.singletonMap("message", "User deleted successfully"));
    }

    @GetMapping("/users/{id}/progress")
    public ResponseEntity<AdminUserProgressResponse> getUserProgress(@PathVariable("id") Long userId) {
        AdminUserProgressResponse response = adminService.getUserProgress(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/report")
    public ResponseEntity<AdminReportResponse> getOverallReport() {
        AdminReportResponse response = adminService.getOverallReport();
        return ResponseEntity.ok(response);
    }
}

