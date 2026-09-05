package ac.lk.foe.uoj.ims.service.IMPL;

import ac.lk.foe.uoj.ims.entity.AuditLog;
import ac.lk.foe.uoj.ims.repo.AuditLogRepository;
import ac.lk.foe.uoj.ims.service.AuditLogService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditLogServiceIMPL implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceIMPL(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Override
    public void log(String userEmail, String action, String entityType, String entityId, String description) {
        AuditLog entry = new AuditLog();
        entry.setUserEmail(userEmail);
        entry.setAction(action);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setDescription(description);
        auditLogRepository.save(entry);
    }

    @Override
    public List<AuditLog> getAll() {
        return auditLogRepository.findAll();
    }

    @Override
    public List<AuditLog> getByUser(String userEmail) {
        return auditLogRepository.findByUserEmail(userEmail);
    }
}
