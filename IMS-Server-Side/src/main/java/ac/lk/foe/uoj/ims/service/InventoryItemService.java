package ac.lk.foe.uoj.ims.service;

import ac.lk.foe.uoj.ims.dto.InventoryItemRequestDTO;
import ac.lk.foe.uoj.ims.entity.InventoryItem;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;

import java.util.List;

public interface InventoryItemService {
    List<InventoryItem> getAll();
    List<InventoryItem> getByDepartment(Long departmentId);
    List<InventoryItem> getMyDepartmentInventory(String email);
    List<InventoryItem> getByType(String type);
    List<InventoryItem> getLowStockItems();
    ServiceResponse save(InventoryItemRequestDTO dto);
    ServiceResponse update(Long id, InventoryItemRequestDTO dto);
    ServiceResponse stockIn(Long id, Integer quantity);
    ServiceResponse markDisused(Long id);
}
