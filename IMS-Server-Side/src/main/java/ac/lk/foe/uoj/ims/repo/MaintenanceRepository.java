package ac.lk.foe.uoj.ims.repo;

import ac.lk.foe.uoj.ims.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceRepository extends JpaRepository<MaintenanceRecord, Long> {
    List<MaintenanceRecord> findByInventoryItemId(Long itemId);
    List<MaintenanceRecord> findByStatus(String status);
    List<MaintenanceRecord> findByRequestedById(Long userId);
}
