package ac.lk.foe.uoj.ims.service.IMPL;

import ac.lk.foe.uoj.ims.dto.InventoryItemRequestDTO;
import ac.lk.foe.uoj.ims.entity.InventoryItem;
import ac.lk.foe.uoj.ims.repo.InventoryItemRepository;
import ac.lk.foe.uoj.ims.service.InventoryItemService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryItemServiceIMPL implements InventoryItemService {

    private final InventoryItemRepository inventoryItemRepository;
    private final ac.lk.foe.uoj.ims.repo.UserRepository userRepository;

    public InventoryItemServiceIMPL(InventoryItemRepository inventoryItemRepository, ac.lk.foe.uoj.ims.repo.UserRepository userRepository) {
        this.inventoryItemRepository = inventoryItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<InventoryItem> getAll() {
        return inventoryItemRepository.findAll();
    }

    @Override
    public List<InventoryItem> getByDepartment(Long departmentId) {
        return inventoryItemRepository.findByDepartmentId(departmentId);
    }

    @Override
    public List<InventoryItem> getMyDepartmentInventory(String email) {
        return userRepository.findByEmail(email).map(user -> {
            if (user.getDepartmentId() != null) {
                return inventoryItemRepository.findByDepartmentId(user.getDepartmentId());
            }
            return new java.util.ArrayList<InventoryItem>();
        }).orElse(new java.util.ArrayList<InventoryItem>());
    }

    @Override
    public List<InventoryItem> getByType(String type) {
        return inventoryItemRepository.findByType(type.toUpperCase());
    }

    @Override
    public List<InventoryItem> getLowStockItems() {
        // Fetch all active items and filter those where quantity <= threshold
        return inventoryItemRepository.findByStatus("ACTIVE").stream()
                .filter(item -> item.getThreshold() != null
                        && item.getQuantity() != null
                        && item.getQuantity() <= item.getThreshold())
                .collect(Collectors.toList());
    }

    @Override
    public ServiceResponse save(InventoryItemRequestDTO dto) {
        try {
            InventoryItem item = new InventoryItem();
            item.setName(dto.getName());
            item.setType(dto.getType() != null ? dto.getType().toUpperCase() : null);
            item.setCategoryId(dto.getCategoryId());
            item.setDepartmentId(dto.getDepartmentId());
            item.setSpecifications(dto.getSpecifications());
            item.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 0);
            item.setThreshold(dto.getThreshold());
            item.setLocation(dto.getLocation());
            item.setStatus("ACTIVE");
            InventoryItem saved = inventoryItemRepository.save(item);
            return new ServiceResponse(true, saved, null);
        } catch (Exception e) {
            System.err.println("[InventoryService] save() failed: " + e.getMessage());
            e.printStackTrace();
            return new ServiceResponse(false, "Failed to save item: " + e.getMessage(), null);
        }
    }

    @Override
    public ServiceResponse update(Long id, InventoryItemRequestDTO dto) {
        return inventoryItemRepository.findById(id).map(item -> {
            if (dto.getName() != null)           item.setName(dto.getName());
            if (dto.getType() != null)           item.setType(dto.getType().toUpperCase());
            if (dto.getCategoryId() != null)     item.setCategoryId(dto.getCategoryId());
            if (dto.getDepartmentId() != null)   item.setDepartmentId(dto.getDepartmentId());
            if (dto.getSpecifications() != null) item.setSpecifications(dto.getSpecifications());
            if (dto.getLocation() != null)       item.setLocation(dto.getLocation());
            if (dto.getThreshold() != null)      item.setThreshold(dto.getThreshold());
            if (dto.getQuantity() != null)       item.setQuantity(dto.getQuantity());
            InventoryItem updated = inventoryItemRepository.save(item);
            return new ServiceResponse(true, updated, null);
        }).orElse(new ServiceResponse(false, "Item not found", null));
    }

    @Override
    public ServiceResponse stockIn(Long id, Integer quantity) {
        if (quantity == null || quantity <= 0) {
            return new ServiceResponse(false, "Quantity must be a positive number", null);
        }
        return inventoryItemRepository.findById(id).map(item -> {
            item.setQuantity(item.getQuantity() + quantity);
            inventoryItemRepository.save(item);
            return new ServiceResponse(true, "Stock updated. New quantity: " + item.getQuantity(), null);
        }).orElse(new ServiceResponse(false, "Item not found", null));
    }

    @Override
    public ServiceResponse markDisused(Long id) {
        return inventoryItemRepository.findById(id).map(item -> {
            item.setStatus("DISUSED");
            inventoryItemRepository.save(item);
            return new ServiceResponse(true, "Item marked as DISUSED", null);
        }).orElse(new ServiceResponse(false, "Item not found", null));
    }
}
