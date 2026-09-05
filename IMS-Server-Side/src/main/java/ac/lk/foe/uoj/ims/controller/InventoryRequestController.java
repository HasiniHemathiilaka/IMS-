package ac.lk.foe.uoj.ims.controller;

import ac.lk.foe.uoj.ims.dto.DecisionDTO;
import ac.lk.foe.uoj.ims.dto.RequestSubmitDTO;
import ac.lk.foe.uoj.ims.entity.InventoryRequest;
import ac.lk.foe.uoj.ims.repo.UserRepository;
import ac.lk.foe.uoj.ims.service.InventoryRequestService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import ac.lk.foe.uoj.ims.utill.StandardResponce;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/request")
public class InventoryRequestController {

    private final InventoryRequestService requestService;
    private final UserRepository userRepository;

    public InventoryRequestController(InventoryRequestService requestService,
            UserRepository userRepository) {
        this.requestService = requestService;
        this.userRepository = userRepository;
    }

    // ── Helper: resolve current user's DB id from their email (JWT subject) ──

    private Long getCurrentUserId(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .map(u -> u.getId()).orElse(null);
    }

    // ════════════════════════════════════════════════════════════════════
    // SUBMISSION
    // ════════════════════════════════════════════════════════════════════

    // 1. Lab TO submits a new request
    @PostMapping("/submit")
    @PreAuthorize("hasAnyAuthority('LAB_TO','ADMIN')")
    public ResponseEntity<StandardResponce> submit(@RequestBody RequestSubmitDTO dto,
            Authentication auth) {
        Long userId = getCurrentUserId(auth);
        ServiceResponse response = requestService.submit(dto, userId);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new StandardResponce(201, "Request submitted successfully", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, "Failed to submit request", response.getObject(), null));
    }

    // ════════════════════════════════════════════════════════════════════
    // DECISION ENDPOINTS (each role approves / rejects their stage)
    // ════════════════════════════════════════════════════════════════════

    // 2. Lab In-Charge decides   PENDING_IN_CHARGE → PENDING_MA | REJECTED
    @PutMapping("/in-charge-decision/{id}")
    @PreAuthorize("hasAnyAuthority('LAB_IN_CHARGE','ADMIN')")
    public ResponseEntity<StandardResponce> inChargeDecision(@PathVariable("id") Long id,
            @RequestBody DecisionDTO dto, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        ServiceResponse response = requestService.inChargeDecision(id, dto, userId);
        return buildResponse(response);
    }

    // 3. MA decides   PENDING_MA → COMPLETED (SIMPLE) | PENDING_HOD (CAPITAL) | REJECTED
    @PutMapping("/ma-decision/{id}")
    @PreAuthorize("hasAnyAuthority('MA','ADMIN')")
    public ResponseEntity<StandardResponce> maDecision(@PathVariable("id") Long id,
            @RequestBody DecisionDTO dto, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        ServiceResponse response = requestService.maDecision(id, dto, userId);
        return buildResponse(response);
    }

    // 4. HOD decides   PENDING_HOD → PENDING_ADMIN | REJECTED
    @PutMapping("/hod-decision/{id}")
    @PreAuthorize("hasAnyAuthority('HOD','ADMIN')")
    public ResponseEntity<StandardResponce> hodDecision(@PathVariable("id") Long id,
            @RequestBody DecisionDTO dto, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        ServiceResponse response = requestService.hodDecision(id, dto, userId);
        return buildResponse(response);
    }

    // 5. Admin (IMO) decides   PENDING_ADMIN → PENDING_WELFARE | REJECTED
    @PutMapping("/admin-decision/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> adminDecision(@PathVariable("id") Long id,
            @RequestBody DecisionDTO dto, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        ServiceResponse response = requestService.adminDecision(id, dto, userId);
        return buildResponse(response);
    }

    // 6. Welfare (Waitfire) team decides   PENDING_WELFARE → COMPLETED | REJECTED
    @PutMapping("/welfare-decision/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> welfareDecision(@PathVariable("id") Long id,
            @RequestBody DecisionDTO dto, Authentication auth) {
        Long userId = getCurrentUserId(auth);
        ServiceResponse response = requestService.welfareDecision(id, dto, userId);
        return buildResponse(response);
    }

    // ════════════════════════════════════════════════════════════════════
    // ROLE-SPECIFIC PENDING QUEUE ENDPOINTS
    // ════════════════════════════════════════════════════════════════════

    // Lab In-Charge sees all PENDING_IN_CHARGE requests
    @GetMapping("/pending/in-charge")
    @PreAuthorize("hasAnyAuthority('LAB_IN_CHARGE','ADMIN')")
    public ResponseEntity<StandardResponce> pendingForInCharge() {
        List<InventoryRequest> requests = requestService.getRequestsForInCharge();
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // MA sees all PENDING_MA requests
    @GetMapping("/pending/ma")
    @PreAuthorize("hasAnyAuthority('MA','ADMIN')")
    public ResponseEntity<StandardResponce> pendingForMA() {
        List<InventoryRequest> requests = requestService.getRequestsForMA();
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // HOD sees all PENDING_HOD requests
    @GetMapping("/pending/hod")
    @PreAuthorize("hasAnyAuthority('HOD','ADMIN')")
    public ResponseEntity<StandardResponce> pendingForHOD() {
        List<InventoryRequest> requests = requestService.getRequestsForHOD();
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // Admin (IMO) sees all PENDING_ADMIN requests
    @GetMapping("/pending/admin")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> pendingForAdmin() {
        List<InventoryRequest> requests = requestService.getRequestsForAdmin();
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // Welfare / Waitfire team sees all PENDING_WELFARE requests
    @GetMapping("/pending/welfare")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> pendingForWelfare() {
        List<InventoryRequest> requests = requestService.getRequestsForWelfare();
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // ════════════════════════════════════════════════════════════════════
    // QUERY ENDPOINTS
    // ════════════════════════════════════════════════════════════════════

    // Single request detail (includes full history)
    @GetMapping("/{id}")
    public ResponseEntity<StandardResponce> getById(@PathVariable("id") Long id) {
        ServiceResponse response = requestService.getRequestById(id);
        return buildResponse(response);
    }

    // Current user's own requests
    @GetMapping("/my")
    public ResponseEntity<StandardResponce> myRequests(Authentication auth) {
        Long userId = getCurrentUserId(auth);
        List<InventoryRequest> requests = requestService.getMyRequests(userId);
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // Filter by status (generic – for any privileged role)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyAuthority('HOD','IMO','MA','LAB_IN_CHARGE','ADMIN')")
    public ResponseEntity<StandardResponce> byStatus(@PathVariable("status") String status) {
        List<InventoryRequest> requests = requestService.getByStatus(status);
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // All requests – IMO / Admin
    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> getAll() {
        List<InventoryRequest> requests = requestService.getAll();
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // By department
    @GetMapping("/department/{deptId}")
    @PreAuthorize("hasAnyAuthority('HOD','IMO','ADMIN')")
    public ResponseEntity<StandardResponce> byDepartment(@PathVariable("deptId") Long deptId) {
        List<InventoryRequest> requests = requestService.getByDepartment(deptId);
        return ResponseEntity.ok(new StandardResponce(200, "Success", requests, null));
    }

    // ════════════════════════════════════════════════════════════════════
    // PRIVATE HELPER
    // ════════════════════════════════════════════════════════════════════

    private ResponseEntity<StandardResponce> buildResponse(ServiceResponse response) {
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Success", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, response.getObject() != null ? response.getObject().toString() : "Failed", null, null));
    }
}
