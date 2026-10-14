package jar.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jar.dto.AuthResponse;
import jar.dto.LoginRequest;
import jar.dto.RegisterRequest;
import jar.model.User;
import jar.repository.UserRepository;
import jar.security.JwtService;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User(
            request.getName(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            request.getRole()
        );

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(
            savedUser.getEmail(),
            savedUser.getRole().name()
        );

        return new AuthResponse(
            token,
            savedUser.getId(),
            savedUser.getName(),
            savedUser.getEmail(),
            savedUser.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String token = jwtService.generateToken(
            user.getEmail(),
            user.getRole().name()
        );

        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
        );
    }
}
