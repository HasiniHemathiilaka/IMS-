package ac.lk.foe.uoj.ims.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_entity")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String f_Name;
    private String l_Name;
    private String email;
    private String contactNo;
    private String role;
    private String gender;
    private boolean state;
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @Column(name = "department_id")
    private Long departmentId;

}
