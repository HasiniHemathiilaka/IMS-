package ac.lk.foe.uoj.ims.repo;

import ac.lk.foe.uoj.ims.entity.InventoryCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<InventoryCategory, Long> {
    boolean existsByCategoryName(String categoryName);
}
