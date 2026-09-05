package ac.lk.foe.uoj.ims.service;

import ac.lk.foe.uoj.ims.entity.Department;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;

import java.util.List;

public interface DepartmentService {
    List<Department> getAll();
    ServiceResponse save(Department department);
    ServiceResponse update(Long id, Department department);
    ServiceResponse delete(Long id);
}
