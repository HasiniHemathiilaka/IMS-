package ac.lk.foe.uoj.ims.controller;

import ac.lk.foe.uoj.ims.entity.AuditLog;
import ac.lk.foe.uoj.ims.service.AuditLogService;
import ac.lk.foe.uoj.ims.utill.StandardResponce;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/audit")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // All audit logs – ADMIN only
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> getAll() {
        List<AuditLog> logs = auditLogService.getAll();
        return ResponseEntity.ok(new StandardResponce(200, "Success", logs, null));
    }

    // Audit logs for a specific user – ADMIN only
    @GetMapping("/user/{email}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> getByUser(@PathVariable("email") String email) {
        List<AuditLog> logs = auditLogService.getByUser(email);
        return ResponseEntity.ok(new StandardResponce(200, "Success", logs, null));
    }
}
