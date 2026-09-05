package ac.lk.foe.uoj.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RequestReviewDTO {
    private String technicalRemarks;
    private String purchaseDetails; // used by MA when marking PURCHASED
}
