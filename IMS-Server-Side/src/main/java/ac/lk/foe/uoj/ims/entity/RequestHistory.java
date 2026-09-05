package ac.lk.foe.uoj.ims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "request_history")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id")
    private Long requestId;

    @Column(name = "acted_by_id")
    private Long actedById;

    private String role; // Role of the person acting (e.g., LAB_IN_CHARGE, HOD)

    private String action; // e.g., SUBMITTED, APPROVED, REJECTED, PURCHASED, WELFARE_APPROVED

    @Column(length = 1000)
    private String reason; // Optional reason, especially required for rejections

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}
