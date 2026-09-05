package ac.lk.foe.uoj.ims.repo;

import ac.lk.foe.uoj.ims.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserEmail(String userEmail);
    List<AuditLog> findByAction(String action);
    List<AuditLog> findByEntityType(String entityType);
}
