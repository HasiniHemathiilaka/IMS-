package ac.lk.foe.uoj.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InventoryItemRequestDTO {
    private String name;
    private String type; // CAPITAL | SIMPLE
    private Long categoryId;
    private Long departmentId;
    private String specifications;
    private Integer quantity;
    private Integer threshold;
    private String location;
}
