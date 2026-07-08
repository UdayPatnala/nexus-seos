package com.nexus.seos.api;

import com.nexus.seos.database.Project;
import com.nexus.seos.database.Execution;
import com.nexus.seos.database.Repositories.ProjectRepository;
import com.nexus.seos.database.Repositories.ExecutionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final ExecutionRepository executionRepository;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public ProjectController(ProjectRepository projectRepository, ExecutionRepository executionRepository,
                             JwtTokenProvider tokenProvider) {
        this.projectRepository = projectRepository;
        this.executionRepository = executionRepository;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping
    public ResponseEntity<?> getProjects(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);
        return ResponseEntity.ok(projectRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createProject(
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.substring(7);
        UUID userId = tokenProvider.getUserIdFromToken(token);
        String name = request.get("name");

        Project project = new Project();
        project.setUserId(userId);
        project.setName(name);
        projectRepository.save(project);

        return ResponseEntity.ok(project);
    }

    @PostMapping("/{projectId}/execute")
    public ResponseEntity<?> executeCode(
            @PathVariable UUID projectId,
            @RequestBody Map<String, String> request) {

        String code = request.get("code");
        String language = request.get("language"); // javascript, python

        Execution execution = new Execution();
        execution.setProjectId(projectId);
        execution.setLanguage(language);

        String stdout = "";
        String stderr = "";
        String status = "SUCCESS";

        try {
            // Write code to a temp file
            String extension = language.equalsIgnoreCase("python") ? ".py" : ".js";
            Path tempFile = Files.createTempFile("nexus_sandbox_", extension);
            Files.writeString(tempFile, code);

            // Setup command process
            ProcessBuilder pb;
            if (language.equalsIgnoreCase("python")) {
                pb = new ProcessBuilder("python", tempFile.toAbsolutePath().toString());
            } else {
                pb = new ProcessBuilder("node", tempFile.toAbsolutePath().toString());
            }

            Process process = pb.start();

            // Read output streams
            StringBuilder outBuilder = new StringBuilder();
            StringBuilder errBuilder = new StringBuilder();

            try (BufferedReader stdInput = new BufferedReader(new InputStreamReader(process.getInputStream()));
                 BufferedReader stdError = new BufferedReader(new InputStreamReader(process.getErrorStream()))) {
                String s;
                while ((s = stdInput.readLine()) != null) {
                    outBuilder.append(s).append("\n");
                }
                while ((s = stdError.readLine()) != null) {
                    errBuilder.append(s).append("\n");
                }
            }

            // Enforce timeout of 5 seconds to prevent hangs
            boolean finished = process.waitFor(5, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                stderr = "Process timed out after 5 seconds.";
                status = "ERROR";
            } else {
                stdout = outBuilder.toString();
                stderr = errBuilder.toString();
                if (process.exitValue() != 0) {
                    status = "ERROR";
                }
            }

            // Cleanup temp file
            Files.deleteIfExists(tempFile);

        } catch (Exception e) {
            status = "ERROR";
            stderr = "System sandboxing error: " + e.getMessage();
        }

        execution.setStdout(stdout);
        execution.setStderr(stderr);
        execution.setStatus(status);
        executionRepository.save(execution);

        return ResponseEntity.ok(execution);
    }

    @GetMapping("/{projectId}/executions")
    public ResponseEntity<?> getExecutions(@PathVariable UUID projectId) {
        return ResponseEntity.ok(executionRepository.findByProjectIdOrderByCreatedAtDesc(projectId));
    }
}
