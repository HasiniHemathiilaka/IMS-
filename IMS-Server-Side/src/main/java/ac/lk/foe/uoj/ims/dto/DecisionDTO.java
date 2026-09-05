package ac.lk.foe.uoj.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DecisionDTO {
    private boolean approve;
    private String reason; // Mandatory if approve is false
}
