package com.codenova.ai.service;

import com.codenova.ai.model.dto.RunCodeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class CodeRunnerService {

    private static final Logger log = LoggerFactory.getLogger(CodeRunnerService.class);
    private final Path tempDir = Paths.get("temp_runner");

    public CodeRunnerService() {
        try {
            Files.createDirectories(tempDir);
        } catch (IOException e) {
            log.error("Failed to create temporary directory for code execution", e);
        }
    }

    public RunCodeResponse runCode(String code, String language) {
        String sessionFolder = UUID.randomUUID().toString();
        Path runPath = tempDir.resolve(sessionFolder);

        try {
            Files.createDirectories(runPath);
        } catch (IOException e) {
            log.error("Failed to create run directory", e);
            return RunCodeResponse.builder()
                    .stdout("")
                    .stderr("Server Error: Failed to initialize code execution environment.")
                    .exitCode(-1)
                    .executionTimeMs(0)
                    .build();
        }

        String fileName;
        String extension;
        if ("Java".equalsIgnoreCase(language)) {
            fileName = "Solution";
            extension = ".java";
        } else if ("JavaScript".equalsIgnoreCase(language)) {
            fileName = "Solution";
            extension = ".js";
        } else if ("Python".equalsIgnoreCase(language)) {
            fileName = "Solution";
            extension = ".py";
        } else {
            return RunCodeResponse.builder()
                    .stdout("")
                    .stderr("Unsupported language: " + language)
                    .exitCode(-1)
                    .executionTimeMs(0)
                    .build();
        }

        Path codeFile = runPath.resolve(fileName + extension);
        try {
            Files.write(codeFile, code.getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            log.error("Failed to write source code file", e);
            cleanup(runPath);
            return RunCodeResponse.builder()
                    .stdout("")
                    .stderr("Server Error: Failed to write source file.")
                    .exitCode(-1)
                    .executionTimeMs(0)
                    .build();
        }

        long startTime = System.currentTimeMillis();
        String stdout = "";
        String stderr = "";
        int exitCode = -1;

        try {
            if ("Java".equalsIgnoreCase(language)) {
                // Compile
                ProcessBuilder compileBuilder = new ProcessBuilder("javac", "Solution.java");
                compileBuilder.directory(runPath.toFile());
                Process compileProcess = compileBuilder.start();
                boolean compileCompleted = compileProcess.waitFor(5, TimeUnit.SECONDS);

                if (!compileCompleted) {
                    compileProcess.destroyForcibly();
                    cleanup(runPath);
                    return RunCodeResponse.builder()
                            .stdout("")
                            .stderr("Compilation Timeout: javac compiler timed out after 5 seconds.")
                            .exitCode(-1)
                            .executionTimeMs(5000)
                            .build();
                }

                if (compileProcess.exitValue() != 0) {
                    stderr = readStream(compileProcess.getErrorStream());
                    cleanup(runPath);
                    return RunCodeResponse.builder()
                            .stdout("")
                            .stderr(stderr)
                            .exitCode(compileProcess.exitValue())
                            .executionTimeMs(System.currentTimeMillis() - startTime)
                            .build();
                }

                // Run
                String mainClass = findMainClass(code);
                ProcessBuilder runBuilder = new ProcessBuilder("java", mainClass);
                runBuilder.directory(runPath.toFile());
                Process runProcess = runBuilder.start();
                boolean runCompleted = runProcess.waitFor(5, TimeUnit.SECONDS);

                if (!runCompleted) {
                    runProcess.destroyForcibly();
                    cleanup(runPath);
                    return RunCodeResponse.builder()
                            .stdout("")
                            .stderr("Execution Timeout: Code execution exceeded 5 seconds.")
                            .exitCode(-1)
                            .executionTimeMs(5000)
                            .build();
                }

                stdout = readStream(runProcess.getInputStream());
                stderr = readStream(runProcess.getErrorStream());
                exitCode = runProcess.exitValue();

            } else if ("JavaScript".equalsIgnoreCase(language)) {
                // Run node Solution.js
                ProcessBuilder runBuilder = new ProcessBuilder("node", "Solution.js");
                runBuilder.directory(runPath.toFile());
                Process runProcess = runBuilder.start();
                boolean runCompleted = runProcess.waitFor(5, TimeUnit.SECONDS);

                if (!runCompleted) {
                    runProcess.destroyForcibly();
                    cleanup(runPath);
                    return RunCodeResponse.builder()
                            .stdout("")
                            .stderr("Execution Timeout: Code execution exceeded 5 seconds.")
                            .exitCode(-1)
                            .executionTimeMs(5000)
                            .build();
                }

                stdout = readStream(runProcess.getInputStream());
                stderr = readStream(runProcess.getErrorStream());
                exitCode = runProcess.exitValue();

            } else if ("Python".equalsIgnoreCase(language)) {
                // Run python Solution.py (try "python", then "py" as fallback for windows)
                ProcessBuilder runBuilder;
                Process runProcess;
                try {
                    runBuilder = new ProcessBuilder("python", "Solution.py");
                    runBuilder.directory(runPath.toFile());
                    runProcess = runBuilder.start();
                } catch (IOException ioException) {
                    // Fallback to "py" command for windows systems
                    runBuilder = new ProcessBuilder("py", "Solution.py");
                    runBuilder.directory(runPath.toFile());
                    runProcess = runBuilder.start();
                }

                boolean runCompleted = runProcess.waitFor(5, TimeUnit.SECONDS);

                if (!runCompleted) {
                    runProcess.destroyForcibly();
                    cleanup(runPath);
                    return RunCodeResponse.builder()
                            .stdout("")
                            .stderr("Execution Timeout: Code execution exceeded 5 seconds.")
                            .exitCode(-1)
                            .executionTimeMs(5000)
                            .build();
                }

                stdout = readStream(runProcess.getInputStream());
                stderr = readStream(runProcess.getErrorStream());
                exitCode = runProcess.exitValue();
            }
        } catch (IOException | InterruptedException e) {
            log.error("Execution exception", e);
            stderr = "Runtime Error: " + e.getMessage() + "\n(Make sure the target language runtime compiler/interpreter is installed and configured in your system PATH.)";
        } finally {
            cleanup(runPath);
        }

        long endTime = System.currentTimeMillis();
        return RunCodeResponse.builder()
                .stdout(stdout)
                .stderr(stderr)
                .exitCode(exitCode)
                .executionTimeMs(endTime - startTime)
                .build();
    }

    private String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line).append("\n");
            }
        }
        return sb.toString();
    }

    private void cleanup(Path runPath) {
        try {
            Files.walk(runPath)
                    .sorted((p1, p2) -> p2.compareTo(p1)) // delete files before directories
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            // ignore
                        }
                    });
        } catch (Exception e) {
            log.error("Cleanup failed for " + runPath, e);
        }
    }

    private String findMainClass(String code) {
        int mainIdx = code.indexOf("public static void main");
        if (mainIdx == -1) {
            return "Solution"; // default fallback
        }
        
        String searchArea = code.substring(0, mainIdx);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("class\\s+(\\w+)");
        java.util.regex.Matcher matcher = pattern.matcher(searchArea);
        String className = "Solution";
        while (matcher.find()) {
            className = matcher.group(1);
        }
        return className;
    }
}
