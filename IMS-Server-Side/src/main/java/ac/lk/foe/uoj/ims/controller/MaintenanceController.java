package ac.lk.foe.uoj.ims.controller;

import ac.lk.foe.uoj.ims.entity.MaintenanceRecord;
import ac.lk.foe.uoj.ims.repo.UserRepository;
import ac.lk.foe.uoj.ims.service.MaintenanceService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import ac.lk.foe.uoj.ims.utill.StandardResponce;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final UserRepository userRepository;

    public MaintenanceController(MaintenanceService maintenanceService,
            UserRepository userRepository) {
        this.maintenanceService = maintenanceService;
        this.userRepository = userRepository;
    }

    private Long getCurrentUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .map(u -> u.getId()).orElse(null);
    }

    // Lab TO requests maintenance for an item
    @PostMapping("/request/{itemId}")
    @PreAuthorize("hasAnyAuthority('LAB_TO','ADMIN')")
    public ResponseEntity<StandardResponce> requestMaintenance(@PathVariable("itemId") Long itemId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        Long userId = getCurrentUserId(auth);
        String description = body.get("description");
        ServiceResponse response = maintenanceService.requestMaintenance(itemId, description, userId);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new StandardResponce(201, "Maintenance requested", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, "Failed", response.getObject(), null));
    }

    // IMO approves maintenance
    @PutMapping("/approve/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> approve(@PathVariable("id") Long id, Authentication auth) {
        ServiceResponse response = maintenanceService.approveMaintenance(id, getCurrentUserId(auth));
        return buildResponse(response);
    }

    // IMO or Admin rejects maintenance
    @PutMapping("/reject/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> reject(@PathVariable("id") Long id, Authentication auth) {
        ServiceResponse response = maintenanceService.rejectMaintenance(id, getCurrentUserId(auth));
        return buildResponse(response);
    }

    // MA or Lab TO marks maintenance as complete
    @PutMapping("/complete/{id}")
    @PreAuthorize("hasAnyAuthority('MA','LAB_TO','ADMIN')")
    public ResponseEntity<StandardResponce> complete(@PathVariable("id") Long id,
            @RequestBody Map<String, Object> body) {
        String notes = (String) body.get("completionNotes");
        String provider = (String) body.get("serviceProvider");
        Double cost = body.get("cost") != null ? Double.parseDouble(body.get("cost").toString()) : null;
        ServiceResponse response = maintenanceService.completeMaintenance(id, notes, cost, provider);
        return buildResponse(response);
    }

    // Maintenance history for a specific item
    @GetMapping("/item/{itemId}")
    public ResponseEntity<StandardResponce> getByItem(@PathVariable("itemId") Long itemId) {
        List<MaintenanceRecord> records = maintenanceService.getByItem(itemId);
        return ResponseEntity.ok(new StandardResponce(200, "Success", records, null));
    }

    // All maintenance records – IMO / Admin / Lab In-Charge / MA
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN','LAB_IN_CHARGE','MA')")
    public ResponseEntity<StandardResponce> getAll() {
        List<MaintenanceRecord> records = maintenanceService.getAll();
        return ResponseEntity.ok(new StandardResponce(200, "Success", records, null));
    }

    // Filter by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN','MA')")
    public ResponseEntity<StandardResponce> getByStatus(@PathVariable("status") String status) {
        List<MaintenanceRecord> records = maintenanceService.getByStatus(status);
        return ResponseEntity.ok(new StandardResponce(200, "Success", records, null));
    }

    private ResponseEntity<StandardResponce> buildResponse(ServiceResponse response) {
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Success", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, "Failed", response.getObject(), null));
    }
}
