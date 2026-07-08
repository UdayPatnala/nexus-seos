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
        String email = request.get("email");
        String password = request.get("password");
        String fullName = request.get("fullName");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already taken."));
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        User savedUser = userRepository.saveAndFlush(user);

        Profile profile = new Profile();
        profile.setUser(savedUser);
        profile.setFullName(fullName != null ? fullName : "Nexus Student");
        profileRepository.saveAndFlush(profile);

        String token = tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "email", email, "fullName", profile.getFullName()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !passwordEncoder.matches(password, userOpt.get().getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }

        User user = userOpt.get();
        Profile profile = profileRepository.findById(user.getId()).orElse(null);
        String fullName = profile != null ? profile.getFullName() : "Nexus Student";

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(Map.of("token", token, "email", email, "fullName", fullName));
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

        return ResponseEntity.ok(response);
    }
}
