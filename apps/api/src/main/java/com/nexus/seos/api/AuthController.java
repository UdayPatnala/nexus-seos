package com.nexus.seos.api;

import com.nexus.seos.database.User;
import com.nexus.seos.database.Profile;
import com.nexus.seos.database.Repositories.UserRepository;
import com.nexus.seos.database.Repositories.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Autowired
    public AuthController(UserRepository userRepository, ProfileRepository profileRepository,
                          PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        return ResponseEntity.badRequest().body(Map.of("error", "Registration is disabled. Use an Access Key to sign in."));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String accessKey = request.get("accessKey");
        if (accessKey == null || accessKey.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Access Key is required."));
        }

        Optional<User> userOpt = userRepository.findByAccessKey(accessKey.trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid Access Key."));
        }

        User user = userOpt.get();
        Profile profile = profileRepository.findById(user.getId()).orElse(null);
        String fullName = profile != null ? profile.getFullName() : "Nexus Student";

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "email", user.getEmail(), "fullName", fullName, "isDemo", user.isDemo()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "No authorization token provided."));
        }

        String token = authHeader.substring(7);
        if (!tokenProvider.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token."));
        }

        UUID userId = tokenProvider.getUserIdFromToken(token);
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found."));
        }

        Profile profile = profileRepository.findById(userId).orElse(null);
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("fullName", profile != null ? profile.getFullName() : "Nexus Student");
        response.put("bio", profile != null ? profile.getBio() : "");
        response.put("avatarUrl", profile != null ? profile.getAvatarUrl() : "");
        response.put("isDemo", user.isDemo());

        return ResponseEntity.ok(response);
    }
}
