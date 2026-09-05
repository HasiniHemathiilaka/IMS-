package ac.lk.foe.uoj.ims.controller;

import ac.lk.foe.uoj.ims.dto.InventoryItemRequestDTO;
import ac.lk.foe.uoj.ims.entity.InventoryItem;
import ac.lk.foe.uoj.ims.service.InventoryItemService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import ac.lk.foe.uoj.ims.utill.StandardResponce;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
public class InventoryItemController {

    private final InventoryItemService inventoryItemService;

    public InventoryItemController(InventoryItemService inventoryItemService) {
        this.inventoryItemService = inventoryItemService;
    }

    // All authenticated users can view inventory
    @GetMapping("/all")
    public ResponseEntity<StandardResponce> getAll() {
        List<InventoryItem> items = inventoryItemService.getAll();
        return ResponseEntity.ok(new StandardResponce(200, "Success", items, null));
    }

    @GetMapping("/department/{deptId}")
    public ResponseEntity<StandardResponce> getByDepartment(@PathVariable("deptId") Long deptId) {
        List<InventoryItem> items = inventoryItemService.getByDepartment(deptId);
        return ResponseEntity.ok(new StandardResponce(200, "Success", items, null));
    }

    @GetMapping("/my-department")
    public ResponseEntity<StandardResponce> getMyDepartmentInventory(Authentication authentication) {
        String email = authentication.getName();
        List<InventoryItem> items = inventoryItemService.getMyDepartmentInventory(email);
        return ResponseEntity.ok(new StandardResponce(200, "Success", items, null));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<StandardResponce> getByType(@PathVariable("type") String type) {
        List<InventoryItem> items = inventoryItemService.getByType(type);
        return ResponseEntity.ok(new StandardResponce(200, "Success", items, null));
    }

    // Low-stock items – IMO and MA can view
    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyAuthority('IMO','MA','ADMIN')")
    public ResponseEntity<StandardResponce> getLowStock() {
        List<InventoryItem> items = inventoryItemService.getLowStockItems();
        return ResponseEntity.ok(new StandardResponce(200, "Success", items, null));
    }

    // IMO/ADMIN can add any item; LAB_TO, MA, HOD, LAB_IN_CHARGE can add SIMPLE items only
    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN','LAB_TO','MA','HOD','LAB_IN_CHARGE')")
    public ResponseEntity<StandardResponce> addItem(@RequestBody InventoryItemRequestDTO dto,
                                                    Authentication authentication) {
        // Enforce SIMPLE-only for non-IMO / non-ADMIN roles
        boolean isPrivileged = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("IMO") || a.getAuthority().equals("ADMIN"));
        if (!isPrivileged && "CAPITAL".equalsIgnoreCase(dto.getType())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new StandardResponce(403, "Forbidden", "Only ADMIN or IMO can add CAPITAL items.", null));
        }
        ServiceResponse response = inventoryItemService.save(dto);
        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new StandardResponce(201, "Item created", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, "Failed", response.getObject(), null));
    }

    // All inventory-related roles can update items
    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN','LAB_TO','MA','HOD','LAB_IN_CHARGE')")
    public ResponseEntity<StandardResponce> updateItem(@PathVariable("id") Long id,
            @RequestBody InventoryItemRequestDTO dto) {
        ServiceResponse response = inventoryItemService.update(id, dto);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Updated", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }

    // MA performs Stock-In (add quantity after purchase)
    @PutMapping("/stock-in/{id}")
    @PreAuthorize("hasAnyAuthority('MA','ADMIN')")
    public ResponseEntity<StandardResponce> stockIn(@PathVariable("id") Long id,
            @RequestBody Map<String, Integer> body) {
        Integer qty = body.get("quantity");
        ServiceResponse response = inventoryItemService.stockIn(id, qty);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Stock updated", response.getObject(), null));
        }
        return ResponseEntity.badRequest()
                .body(new StandardResponce(400, "Failed", response.getObject(), null));
    }

    // IMO marks item as DISUSED (disposal)
    @PutMapping("/disuse/{id}")
    @PreAuthorize("hasAnyAuthority('IMO','ADMIN')")
    public ResponseEntity<StandardResponce> markDisused(@PathVariable("id") Long id) {
        ServiceResponse response = inventoryItemService.markDisused(id);
        if (response.isSuccess()) {
            return ResponseEntity.ok(new StandardResponce(200, "Marked as DISUSED", response.getObject(), null));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new StandardResponce(404, "Not Found", response.getObject(), null));
    }
}
