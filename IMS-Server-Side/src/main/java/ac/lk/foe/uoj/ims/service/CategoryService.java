package ac.lk.foe.uoj.ims.service;

import ac.lk.foe.uoj.ims.entity.InventoryCategory;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;

import java.util.List;

public interface CategoryService {
    List<InventoryCategory> getAll();
    ServiceResponse save(InventoryCategory category);
    ServiceResponse update(Long id, InventoryCategory category);
    ServiceResponse delete(Long id);
}
