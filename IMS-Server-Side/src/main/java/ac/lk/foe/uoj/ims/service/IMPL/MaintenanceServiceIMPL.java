package ac.lk.foe.uoj.ims.service.IMPL;

import ac.lk.foe.uoj.ims.entity.MaintenanceRecord;
import ac.lk.foe.uoj.ims.repo.MaintenanceRepository;
import ac.lk.foe.uoj.ims.service.MaintenanceService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MaintenanceServiceIMPL implements MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;

    public MaintenanceServiceIMPL(MaintenanceRepository maintenanceRepository) {
        this.maintenanceRepository = maintenanceRepository;
    }

    @Override
    public ServiceResponse requestMaintenance(Long itemId, String description, Long requestedById) {
        try {
            MaintenanceRecord record = new MaintenanceRecord();
            record.setInventoryItemId(itemId);
            record.setDescription(description);
            record.setRequestedById(requestedById);
            record.setStatus("PENDING");
            maintenanceRepository.save(record);
            return new ServiceResponse(true, "Maintenance request submitted", null);
        } catch (Exception e) {
            return new ServiceResponse(false, "Failed to submit: " + e.getMessage(), null);
        }
    }

    @Override
    public ServiceResponse approveMaintenance(Long recordId, Long approvedById) {
        return maintenanceRepository.findById(recordId).map(rec -> {
            if (!"PENDING".equals(rec.getStatus())) {
                return new ServiceResponse(false, "Only PENDING records can be approved", null);
            }
            rec.setApprovedById(approvedById);
            rec.setStatus("APPROVED");
            rec.setStartDate(LocalDateTime.now());
            maintenanceRepository.save(rec);
            return new ServiceResponse(true, "Maintenance approved", null);
        }).orElse(new ServiceResponse(false, "Record not found", null));
    }

    @Override
    public ServiceResponse completeMaintenance(Long recordId, String completionNotes, Double cost, String serviceProvider) {
        return maintenanceRepository.findById(recordId).map(rec -> {
            if (!"APPROVED".equals(rec.getStatus())) {
                return new ServiceResponse(false, "Only APPROVED records can be completed", null);
            }
            rec.setStatus("COMPLETED");
            rec.setCompletionNotes(completionNotes);
            rec.setCost(cost);
            rec.setServiceProvider(serviceProvider);
            rec.setEndDate(LocalDateTime.now());
            maintenanceRepository.save(rec);
            return new ServiceResponse(true, "Maintenance completed", null);
        }).orElse(new ServiceResponse(false, "Record not found", null));
    }

    @Override
    public ServiceResponse rejectMaintenance(Long recordId, Long rejectedById) {
        return maintenanceRepository.findById(recordId).map(rec -> {
            if (!"PENDING".equals(rec.getStatus())) {
                return new ServiceResponse(false, "Only PENDING records can be rejected", null);
            }
            rec.setStatus("REJECTED");
            rec.setApprovedById(rejectedById);
            maintenanceRepository.save(rec);
            return new ServiceResponse(true, "Maintenance request rejected", null);
        }).orElse(new ServiceResponse(false, "Record not found", null));
    }

    @Override
    public List<MaintenanceRecord> getByItem(Long itemId) {
        return maintenanceRepository.findByInventoryItemId(itemId);
    }

    @Override
    public List<MaintenanceRecord> getByStatus(String status) {
        return maintenanceRepository.findByStatus(status.toUpperCase());
    }

    @Override
    public List<MaintenanceRecord> getAll() {
        return maintenanceRepository.findAll();
    }
}
