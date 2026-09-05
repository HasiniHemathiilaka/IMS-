package ac.lk.foe.uoj.ims.service.IMPL;

import ac.lk.foe.uoj.ims.dto.DecisionDTO;
import ac.lk.foe.uoj.ims.dto.RequestSubmitDTO;
import ac.lk.foe.uoj.ims.entity.InventoryRequest;
import ac.lk.foe.uoj.ims.entity.RequestHistory;
import ac.lk.foe.uoj.ims.repo.RequestHistoryRepository;
import ac.lk.foe.uoj.ims.repo.InventoryRequestRepository;
import ac.lk.foe.uoj.ims.service.InventoryRequestService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryRequestServiceIMPL implements InventoryRequestService {

    private final InventoryRequestRepository requestRepository;
    private final RequestHistoryRepository historyRepository;

    public InventoryRequestServiceIMPL(InventoryRequestRepository requestRepository,
                                       RequestHistoryRepository historyRepository) {
        this.requestRepository = requestRepository;
        this.historyRepository = historyRepository;
    }

    // ── Helper: write an audit entry ─────────────────────────────────────

    private void logHistory(Long requestId, Long actedById, String role, String action, String reason) {
        RequestHistory history = new RequestHistory();
        history.setRequestId(requestId);
        history.setActedById(actedById);
        history.setRole(role);
        history.setAction(action);
        history.setReason(reason);
        historyRepository.save(history);
    }

    // ── Helper: validate rejection requires a reason ──────────────────────

    private ServiceResponse requireReasonOnReject(DecisionDTO decision) {
        if (!decision.isApprove()) {
            String reason = decision.getReason();
            if (reason == null || reason.trim().isEmpty()) {
                return new ServiceResponse(false, "Rejection reason is required", null);
            }
        }
        return null; // validation passed
    }

    // ═════════════════════════════════════════════════════════════════════
    // 1. TO submits request
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public ServiceResponse submit(RequestSubmitDTO dto, Long requestedById) {
        try {
            InventoryRequest request = new InventoryRequest();
            request.setItemName(dto.getItemName());
            request.setItemType(dto.getItemType() != null ? dto.getItemType().toUpperCase() : "SIMPLE");
            request.setCategoryId(dto.getCategoryId());
            request.setDepartmentId(dto.getDepartmentId());
            request.setQuantity(dto.getQuantity());
            request.setPurpose(dto.getPurpose());
            request.setSpecifications(dto.getSpecifications());
            request.setTechnicalRemarks(dto.getTechnicalRemarks());
            request.setRequestedById(requestedById);
            request.setStatus("PENDING_IN_CHARGE");
            InventoryRequest saved = requestRepository.save(request);

            logHistory(saved.getId(), requestedById, "LAB_TO", "SUBMITTED", null);
            return new ServiceResponse(true, saved, null);
        } catch (Exception e) {
            return new ServiceResponse(false, "Failed to submit request: " + e.getMessage(), null);
        }
    }

    // ═════════════════════════════════════════════════════════════════════
    // 2. Lab In-Charge decides
    //    PENDING_IN_CHARGE  →  PENDING_MA  |  REJECTED
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public ServiceResponse inChargeDecision(Long requestId, DecisionDTO decision, Long labInChargeId) {
        ServiceResponse validationError = requireReasonOnReject(decision);
        if (validationError != null) return validationError;

        return requestRepository.findById(requestId).map(req -> {
            if (!"PENDING_IN_CHARGE".equals(req.getStatus())) {
                return new ServiceResponse(false, "Request is not in PENDING_IN_CHARGE status", null);
            }
            req.setLabInChargeId(labInChargeId);
            String action;
            if (decision.isApprove()) {
                req.setStatus("PENDING_MA");
                action = "APPROVED";
            } else {
                req.setStatus("REJECTED");
                action = "REJECTED";
            }
            requestRepository.save(req);
            logHistory(req.getId(), labInChargeId, "LAB_IN_CHARGE", action, decision.getReason());
            return new ServiceResponse(true, req, null);
        }).orElse(new ServiceResponse(false, "Request not found", null));
    }

    // ═════════════════════════════════════════════════════════════════════
    // 3. MA decides
    //    PENDING_MA  →  COMPLETED (SIMPLE)  |  PENDING_HOD (CAPITAL)  |  REJECTED
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public ServiceResponse maDecision(Long requestId, DecisionDTO decision, Long maId) {
        ServiceResponse validationError = requireReasonOnReject(decision);
        if (validationError != null) return validationError;

        return requestRepository.findById(requestId).map(req -> {
            if (!"PENDING_MA".equals(req.getStatus())) {
                return new ServiceResponse(false, "Request is not in PENDING_MA status", null);
            }
            req.setMaId(maId);
            String action;
            if (decision.isApprove()) {
                if ("SIMPLE".equalsIgnoreCase(req.getItemType())) {
                    req.setStatus("COMPLETED");   // MA issues simple item directly
                    action = "ISSUED";
                } else {
                    req.setStatus("PENDING_HOD"); // Capital items escalate to HOD
                    action = "APPROVED";
                }
            } else {
                req.setStatus("REJECTED");
                action = "REJECTED";
            }
            requestRepository.save(req);
            logHistory(req.getId(), maId, "MA", action, decision.getReason());
            return new ServiceResponse(true, req, null);
        }).orElse(new ServiceResponse(false, "Request not found", null));
    }

    // ═════════════════════════════════════════════════════════════════════
    // 4. HOD decides
    //    PENDING_HOD  →  PENDING_ADMIN  |  REJECTED
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public ServiceResponse hodDecision(Long requestId, DecisionDTO decision, Long hodId) {
        ServiceResponse validationError = requireReasonOnReject(decision);
        if (validationError != null) return validationError;

        return requestRepository.findById(requestId).map(req -> {
            if (!"PENDING_HOD".equals(req.getStatus())) {
                return new ServiceResponse(false, "Request is not in PENDING_HOD status", null);
            }
            req.setHodId(hodId);
            String action;
            if (decision.isApprove()) {
                req.setStatus("PENDING_ADMIN");
                action = "APPROVED";
            } else {
                req.setStatus("REJECTED");
                action = "REJECTED";
            }
            requestRepository.save(req);
            logHistory(req.getId(), hodId, "HOD", action, decision.getReason());
            return new ServiceResponse(true, req, null);
        }).orElse(new ServiceResponse(false, "Request not found", null));
    }

    // ═════════════════════════════════════════════════════════════════════
    // 5. Admin (IMO) decides
    //    PENDING_ADMIN  →  PENDING_WELFARE  |  REJECTED
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public ServiceResponse adminDecision(Long requestId, DecisionDTO decision, Long adminId) {
        ServiceResponse validationError = requireReasonOnReject(decision);
        if (validationError != null) return validationError;

        return requestRepository.findById(requestId).map(req -> {
            if (!"PENDING_ADMIN".equals(req.getStatus())) {
                return new ServiceResponse(false, "Request is not in PENDING_ADMIN status", null);
            }
            req.setImoId(adminId);
            String action;
            if (decision.isApprove()) {
                req.setStatus("PENDING_WELFARE");
                action = "APPROVED";
            } else {
                req.setStatus("REJECTED");
                action = "REJECTED";
            }
            requestRepository.save(req);
            logHistory(req.getId(), adminId, "ADMIN", action, decision.getReason());
            return new ServiceResponse(true, req, null);
        }).orElse(new ServiceResponse(false, "Request not found", null));
    }

    // ═════════════════════════════════════════════════════════════════════
    // 6. Welfare (Waitfire) team decides
    //    PENDING_WELFARE  →  COMPLETED  |  REJECTED
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public ServiceResponse welfareDecision(Long requestId, DecisionDTO decision, Long adminId) {
        ServiceResponse validationError = requireReasonOnReject(decision);
        if (validationError != null) return validationError;

        return requestRepository.findById(requestId).map(req -> {
            if (!"PENDING_WELFARE".equals(req.getStatus())) {
                return new ServiceResponse(false, "Request is not in PENDING_WELFARE status", null);
            }
            String action;
            if (decision.isApprove()) {
                req.setStatus("COMPLETED");
                action = "DISPATCHED";
            } else {
                req.setStatus("REJECTED");
                action = "REJECTED";
            }
            requestRepository.save(req);
            logHistory(req.getId(), adminId, "WELFARE", action, decision.getReason());
            return new ServiceResponse(true, req, null);
        }).orElse(new ServiceResponse(false, "Request not found", null));
    }

    // ═════════════════════════════════════════════════════════════════════
    // Single request detail (includes history via @OneToMany)
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public ServiceResponse getRequestById(Long requestId) {
        return requestRepository.findById(requestId)
                .map(req -> new ServiceResponse(true, req, null))
                .orElse(new ServiceResponse(false, "Request not found", null));
    }

    // ═════════════════════════════════════════════════════════════════════
    // Role-filtered pending queues
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public List<InventoryRequest> getRequestsForInCharge() {
        return requestRepository.findByStatus("PENDING_IN_CHARGE");
    }

    @Override
    public List<InventoryRequest> getRequestsForMA() {
        return requestRepository.findByStatus("PENDING_MA");
    }

    @Override
    public List<InventoryRequest> getRequestsForHOD() {
        return requestRepository.findByStatus("PENDING_HOD");
    }

    @Override
    public List<InventoryRequest> getRequestsForAdmin() {
        return requestRepository.findByStatus("PENDING_ADMIN");
    }

    @Override
    public List<InventoryRequest> getRequestsForWelfare() {
        return requestRepository.findByStatus("PENDING_WELFARE");
    }

    // ═════════════════════════════════════════════════════════════════════
    // General queries
    // ═════════════════════════════════════════════════════════════════════
    @Override
    public List<InventoryRequest> getAll() {
        return requestRepository.findAll();
    }

    @Override
    public List<InventoryRequest> getMyRequests(Long userId) {
        return requestRepository.findByRequestedById(userId);
    }

    @Override
    public List<InventoryRequest> getByStatus(String status) {
        return requestRepository.findByStatus(status.toUpperCase());
    }

    @Override
    public List<InventoryRequest> getByDepartment(Long deptId) {
        return requestRepository.findByDepartmentId(deptId);
    }
}
