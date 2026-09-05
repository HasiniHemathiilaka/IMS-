package ac.lk.foe.uoj.ims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_record")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long inventoryItemId;

    @Column(length = 1000)
    private String description;

    // PENDING | APPROVED | IN_SERVICE | COMPLETED | REJECTED
    private String status;

    private Long requestedById;
    private Long approvedById;

    private String serviceProvider;

    @Column(length = 500)
    private String completionNotes;

    private Double cost;

    private LocalDateTime requestedDate;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @PrePersist
    protected void onCreate() {
        this.requestedDate = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING";
    }
}
