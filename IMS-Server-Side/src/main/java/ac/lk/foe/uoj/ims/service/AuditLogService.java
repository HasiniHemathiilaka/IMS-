package ac.lk.foe.uoj.ims.service;

import ac.lk.foe.uoj.ims.entity.AuditLog;

import java.util.List;

public interface AuditLogService {
    void log(String userEmail, String action, String entityType, String entityId, String description);
    List<AuditLog> getAll();
    List<AuditLog> getByUser(String userEmail);
}
