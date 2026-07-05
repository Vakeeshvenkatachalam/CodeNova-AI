package com.codenova.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CodeNovaApplication {
    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(CodeNovaApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            java.io.File envFile = new java.io.File(".env");
            if (envFile.exists()) {
                java.nio.file.Files.lines(envFile.toPath())
                        .map(String::trim)
                        .filter(line -> !line.isEmpty() && !line.startsWith("#"))
                        .forEach(line -> {
                            int eqIdx = line.indexOf('=');
                            if (eqIdx > 0) {
                                String key = line.substring(0, eqIdx).trim();
                                String val = line.substring(eqIdx + 1).trim();
                                if (System.getenv(key) == null && System.getProperty(key) == null) {
                                    System.setProperty(key, val);
                                }
                            }
                        });
            }
        } catch (Exception e) {
            // Ignore / log
        }
    }
}
