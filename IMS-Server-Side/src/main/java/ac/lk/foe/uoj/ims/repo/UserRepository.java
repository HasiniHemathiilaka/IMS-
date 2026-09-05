package ac.lk.foe.uoj.ims.repo;


import ac.lk.foe.uoj.ims.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity,Long> {

    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    List<UserEntity> findByState(boolean state);


    // Custom query method to find state by regNo
    @Query("SELECT u.state FROM UserEntity u WHERE u.email = :email")
    Boolean findStateByEmail(@Param("email") String email);

    @Query("SELECT u.role FROM UserEntity u WHERE u.email = :email")
    String findRoleByEmail(@Param("email") String email);

    List<UserEntity> findByRoleLike(String role);



}
