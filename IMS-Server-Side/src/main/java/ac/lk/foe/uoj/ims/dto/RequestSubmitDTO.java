package ac.lk.foe.uoj.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestSubmitDTO {
    private String itemName;
    private String itemType;       // CAPITAL | SIMPLE
    private Long categoryId;
    private Long departmentId;
    private Integer quantity;
    private String purpose;
    private String specifications;
    private String technicalRemarks;
}
