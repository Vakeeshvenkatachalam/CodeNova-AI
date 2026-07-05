package com.codenova.ai.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testPublicEndpointsPermitAll() throws Exception {
        // Health check endpoint is public
        mockMvc.perform(get("/api/v1/health"))
                .andExpect(status().isOk());
    }

    @Test
    public void testSecureEndpointsWithoutAuthReturnsUnauthorized() throws Exception {
        // Getting dashboard summary without token should be blocked
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "vikas@codenova.com", roles = "USER")
    public void testStudentRoleAccessDashboardSummaryAllowed() throws Exception {
        // Authenticated users with student role can access dashboard summary
        mockMvc.perform(get("/api/v1/dashboard/summary"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "vikas@codenova.com", roles = "USER")
    public void testStudentRoleAccessAdminMetricsForbidden() throws Exception {
        // Students are blocked from admin metrics
        mockMvc.perform(get("/api/v1/admin/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@codenova.com", roles = "ADMIN")
    public void testAdminRoleAccessAdminMetricsAllowed() throws Exception {
        // Admins can access admin metrics
        mockMvc.perform(get("/api/v1/admin/metrics"))
                .andExpect(status().isOk());
    }
}
