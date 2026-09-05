package ac.lk.foe.uoj.ims.controller;

import ac.lk.foe.uoj.ims.entity.Department;
import ac.lk.foe.uoj.ims.service.DepartmentService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import ac.lk.foe.uoj.ims.utill.StandardResponce;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/department")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    // Get all departments – accessible to authenticated users
    @GetMapping("/all")
    public ResponseEntity<StandardResponce> getAll() {
        List<Department> departments = departmentService.getAll();
        return ResponseEntity.ok(new StandardResponce(200, "Success", departments, null));
    }

    // Create department – Admin only
    @PostMapping("/save")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> save(@RequestBody Department department) {
        ServiceResponse response = departmentService.save(department);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new StandardResponce(201, "Created", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, "Bad Request", response.getObject(), null));
    }

    // Update department – Admin only
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> update(@PathVariable("id") Long id,
            @RequestBody Department department) {
        ServiceResponse response = departmentService.update(id, department);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Updated", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }

    // Delete department – Admin only
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<StandardResponce> delete(@PathVariable("id") Long id) {
        ServiceResponse response = departmentService.delete(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Deleted", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }
}
