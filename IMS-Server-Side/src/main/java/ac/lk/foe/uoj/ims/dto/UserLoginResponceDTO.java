package ac.lk.foe.uoj.ims.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserLoginResponceDTO {
    private Object massage;
    private LocalDateTime time;
    private Long departmentId;
    private String departmentName;
}