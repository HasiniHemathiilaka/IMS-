package ac.lk.foe.uoj.ims.service.IMPL;

import ac.lk.foe.uoj.ims.entity.Department;
import ac.lk.foe.uoj.ims.repo.DepartmentRepository;
import ac.lk.foe.uoj.ims.service.DepartmentService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentServiceIMPL implements DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentServiceIMPL(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<Department> getAll() {
        return departmentRepository.findAll();
    }

    @Override
    public ServiceResponse save(Department department) {
        if (departmentRepository.existsByCode(department.getCode())) {
            return new ServiceResponse(false, "Department code already exists", null);
        }
        if (departmentRepository.existsByName(department.getName())) {
            return new ServiceResponse(false, "Department name already exists", null);
        }
        try {
            departmentRepository.save(department);
            return new ServiceResponse(true, "Department saved successfully", null);
        } catch (Exception e) {
            return new ServiceResponse(false, "Failed to save department: " + e.getMessage(), null);
        }
    }

    @Override
    public ServiceResponse update(Long id, Department department) {
        return departmentRepository.findById(id).map(existing -> {
            if (department.getName() != null) existing.setName(department.getName());
            if (department.getCode() != null) existing.setCode(department.getCode());
            existing.setStatus(department.isStatus());
            departmentRepository.save(existing);
            return new ServiceResponse(true, "Department updated successfully", null);
        }).orElse(new ServiceResponse(false, "Department not found", null));
    }

    @Override
    public ServiceResponse delete(Long id) {
        if (!departmentRepository.existsById(id)) {
            return new ServiceResponse(false, "Department not found", null);
        }
        departmentRepository.deleteById(id);
        return new ServiceResponse(true, "Department deleted successfully", null);
    }
}
