package ac.lk.foe.uoj.ims.repo;

import ac.lk.foe.uoj.ims.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByDepartmentId(Long departmentId);
    List<InventoryItem> findByType(String type);
    List<InventoryItem> findByCategoryId(Long categoryId);
    List<InventoryItem> findByStatus(String status);
    // Used for low-stock alerting: items where quantity < threshold
    List<InventoryItem> findByQuantityLessThanAndStatus(Integer quantity, String status);
}
