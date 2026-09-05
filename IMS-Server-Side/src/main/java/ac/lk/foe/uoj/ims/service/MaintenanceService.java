package ac.lk.foe.uoj.ims.service;

import ac.lk.foe.uoj.ims.entity.MaintenanceRecord;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;

import java.util.List;

public interface MaintenanceService {
    ServiceResponse requestMaintenance(Long itemId, String description, Long requestedById);
    ServiceResponse approveMaintenance(Long recordId, Long approvedById);
    ServiceResponse completeMaintenance(Long recordId, String completionNotes, Double cost, String serviceProvider);
    ServiceResponse rejectMaintenance(Long recordId, Long rejectedById);
    List<MaintenanceRecord> getByItem(Long itemId);
    List<MaintenanceRecord> getByStatus(String status);
    List<MaintenanceRecord> getAll();
}
