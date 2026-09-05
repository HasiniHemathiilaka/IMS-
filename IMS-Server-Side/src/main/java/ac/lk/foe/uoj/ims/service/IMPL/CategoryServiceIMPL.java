package ac.lk.foe.uoj.ims.service.IMPL;

import ac.lk.foe.uoj.ims.entity.InventoryCategory;
import ac.lk.foe.uoj.ims.repo.CategoryRepository;
import ac.lk.foe.uoj.ims.service.CategoryService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceIMPL implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceIMPL(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<InventoryCategory> getAll() {
        return categoryRepository.findAll();
    }

    @Override
    public ServiceResponse save(InventoryCategory category) {
        if (categoryRepository.existsByCategoryName(category.getCategoryName())) {
            return new ServiceResponse(false, "Category name already exists", null);
        }
        try {
            categoryRepository.save(category);
            return new ServiceResponse(true, "Category saved successfully", null);
        } catch (Exception e) {
            return new ServiceResponse(false, "Failed to save category: " + e.getMessage(), null);
        }
    }

    @Override
    public ServiceResponse update(Long id, InventoryCategory category) {
        return categoryRepository.findById(id).map(existing -> {
            if (category.getCategoryName() != null) existing.setCategoryName(category.getCategoryName());
            if (category.getCategoryDesc() != null) existing.setCategoryDesc(category.getCategoryDesc());
            categoryRepository.save(existing);
            return new ServiceResponse(true, "Category updated successfully", null);
        }).orElse(new ServiceResponse(false, "Category not found", null));
    }

    @Override
    public ServiceResponse delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            return new ServiceResponse(false, "Category not found", null);
        }
        categoryRepository.deleteById(id);
        return new ServiceResponse(true, "Category deleted successfully", null);
    }
}
