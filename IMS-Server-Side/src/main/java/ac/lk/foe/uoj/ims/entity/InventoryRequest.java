package ac.lk.foe.uoj.ims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_request")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemName;

    // CAPITAL | SIMPLE
    private String itemType;

    private Long categoryId;

    private Long departmentId;

    private Integer quantity;

    @Column(length = 1000)
    private String purpose;

    @Column(length = 1000)
    private String specifications;

    // Workflow statuses:
    // SUBMITTED → REVIEWED → HOD_APPROVED → IMO_APPROVED → PURCHASED | REJECTED
    private String status;

    // User IDs of each approver/actor
    private Long requestedById;

    @Column(length = 1000)
    private String technicalRemarks; // Lab In-Charge remarks

    private Long labInChargeId;
    private Long hodId;
    private Long imoId;
    private Long maId;

    @Column(length = 2000)
    private String purchaseDetails; // filled by MA after purchase

    @OneToMany(mappedBy = "requestId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<RequestHistory> history = new java.util.ArrayList<>();

    private LocalDateTime requestDate;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.requestDate = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) this.status = "SUBMITTED";
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
