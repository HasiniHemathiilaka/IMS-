package ac.lk.foe.uoj.ims.repo;

import ac.lk.foe.uoj.ims.entity.InventoryRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryRequestRepository extends JpaRepository<InventoryRequest, Long> {
    List<InventoryRequest> findByStatus(String status);
    List<InventoryRequest> findByRequestedByIdAndStatus(Long userId, String status);
    List<InventoryRequest> findByRequestedById(Long userId);
    List<InventoryRequest> findByDepartmentId(Long departmentId);
    List<InventoryRequest> findByItemType(String itemType);
}
