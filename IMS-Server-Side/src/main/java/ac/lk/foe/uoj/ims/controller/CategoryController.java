package ac.lk.foe.uoj.ims.controller;

import ac.lk.foe.uoj.ims.entity.InventoryCategory;
import ac.lk.foe.uoj.ims.service.CategoryService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import ac.lk.foe.uoj.ims.utill.StandardResponce;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/category")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Get all categories – accessible to all authenticated users
    @GetMapping("/all")
    public ResponseEntity<StandardResponce> getAll() {
        List<InventoryCategory> categories = categoryService.getAll();
        return ResponseEntity.ok(new StandardResponce(200, "Success", categories, null));
    }

    // Create category – IMO only
    @PostMapping("/save")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> save(@RequestBody InventoryCategory category) {
        ServiceResponse response = categoryService.save(category);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new StandardResponce(201, "Created", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, "Bad Request", response.getObject(), null));
    }

    // Update category – IMO only
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> update(@PathVariable("id") Long id,
            @RequestBody InventoryCategory category) {
        ServiceResponse response = categoryService.update(id, category);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Updated", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }

    // Delete category – IMO only
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> delete(@PathVariable("id") Long id) {
        ServiceResponse response = categoryService.delete(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Deleted", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }
}
