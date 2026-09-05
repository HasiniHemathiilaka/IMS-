package ac.lk.foe.uoj.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestHistoryDTO {
    private Long id;
    private Long actedById;
    private String actedByName; // Resolved on the fly or fetched via join
    private String role;
    private String action;
    private String reason;
    private LocalDateTime timestamp;
}
