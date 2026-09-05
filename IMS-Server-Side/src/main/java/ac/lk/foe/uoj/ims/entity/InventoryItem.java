package ac.lk.foe.uoj.ims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_item")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    // CAPITAL = long-term asset, SIMPLE = consumable
    private String type; // CAPITAL | SIMPLE

    private Long categoryId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(length = 1000)
    private String specifications;

    private Integer quantity;

    private Integer threshold; // low-stock alert level

    private String location;

    // ACTIVE | DISUSED
    private String status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "ACTIVE";
        if (this.quantity == null) this.quantity = 0;
    }
}
