package ac.lk.foe.uoj.ims.controller;

import ac.lk.foe.uoj.ims.dto.UserRegRequestDTO;
import ac.lk.foe.uoj.ims.entity.UserEntity;
import ac.lk.foe.uoj.ims.service.UserService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import ac.lk.foe.uoj.ims.utill.StandardResponce;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users - Admin only
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> getAllUsers() {
        List<UserEntity> users = userService.getAllUsers();
        return ResponseEntity.ok(new StandardResponce(200, "Success", users, null));
    }

    // Get all pending (not yet approved) users - Admin only
    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> getPendingUsers() {
        List<UserEntity> users = userService.getPendingUsers();
        return ResponseEntity.ok(new StandardResponce(200, "Success", users, null));
    }

    // Approve a user - Admin only
    @PutMapping("/approve/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> approveUser(@PathVariable("id") Long id) {
        ServiceResponse response = userService.approveUser(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Approved", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }

    // Update user profile - Admin or the user themselves
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> updateUser(@PathVariable("id") Long id,
            @RequestBody UserRegRequestDTO dto) {
        ServiceResponse response = userService.updateUser(id, dto);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Updated", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }

    // Deactivate user - Admin only
    @PutMapping("/deactivate/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> deactivateUser(@PathVariable("id") Long id) {
        ServiceResponse response = userService.deactivateUser(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Deactivated", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }
}
