package jar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jar.model.Role;
import jar.model.User;
import jar.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/tenants")
    public ResponseEntity<List<User>> getTenants() {

        List<User> tenants =
                userRepository.findByRole(Role.TENANT);

        return ResponseEntity.ok(tenants);
    }
}