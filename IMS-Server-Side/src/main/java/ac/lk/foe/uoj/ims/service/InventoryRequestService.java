package ac.lk.foe.uoj.ims.service;

import ac.lk.foe.uoj.ims.dto.RequestSubmitDTO;
import ac.lk.foe.uoj.ims.dto.DecisionDTO;
import ac.lk.foe.uoj.ims.entity.InventoryRequest;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;

import java.util.List;

public interface InventoryRequestService {

    // 1. Lab TO submits request → status: PENDING_IN_CHARGE
    ServiceResponse submit(RequestSubmitDTO dto, Long requestedById);

    // 2. Lab In-Charge accepts/rejects → status: PENDING_MA | REJECTED
    ServiceResponse inChargeDecision(Long requestId, DecisionDTO decision, Long labInChargeId);

    // 3. MA accepts/rejects.
    //    If SIMPLE → COMPLETED. If CAPITAL → PENDING_HOD
    ServiceResponse maDecision(Long requestId, DecisionDTO decision, Long maId);

    // 4. HOD accepts/rejects → status: PENDING_ADMIN | REJECTED
    ServiceResponse hodDecision(Long requestId, DecisionDTO decision, Long hodId);

    // 5. Admin accepts/rejects → status: PENDING_WELFARE | REJECTED
    ServiceResponse adminDecision(Long requestId, DecisionDTO decision, Long adminId);

    // 6. Welfare team (via Admin) provides item → status: COMPLETED | REJECTED
    ServiceResponse welfareDecision(Long requestId, DecisionDTO decision, Long adminId);

    // ── Single request detail (with history) ──────────────────────────────
    ServiceResponse getRequestById(Long requestId);

    // ── Role-filtered pending queues ──────────────────────────────────────
    List<InventoryRequest> getRequestsForInCharge();   // PENDING_IN_CHARGE
    List<InventoryRequest> getRequestsForMA();          // PENDING_MA
    List<InventoryRequest> getRequestsForHOD();         // PENDING_HOD
    List<InventoryRequest> getRequestsForAdmin();       // PENDING_ADMIN
    List<InventoryRequest> getRequestsForWelfare();     // PENDING_WELFARE

    // ── General queries ───────────────────────────────────────────────────
    List<InventoryRequest> getAll();
    List<InventoryRequest> getMyRequests(Long userId);
    List<InventoryRequest> getByStatus(String status);
    List<InventoryRequest> getByDepartment(Long deptId);
}
