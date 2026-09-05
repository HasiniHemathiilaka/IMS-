package ac.lk.foe.uoj.ims.service;


import ac.lk.foe.uoj.ims.dto.UserLoginRequestDTO;
import ac.lk.foe.uoj.ims.dto.UserRegRequestDTO;
import ac.lk.foe.uoj.ims.entity.UserEntity;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;

import java.util.List;

public interface UserService {
    ServiceResponse signUp(UserRegRequestDTO userRegRequestDTO);
    ServiceResponse signIn(UserLoginRequestDTO userLoginRequestDTO);
    boolean isEnablePerson(String email);

    // User Management (Admin)
    List<UserEntity> getAllUsers();
    List<UserEntity> getPendingUsers();
    ServiceResponse approveUser(Long id);
    ServiceResponse updateUser(Long id, UserRegRequestDTO dto);
    ServiceResponse deactivateUser(Long id);
}
