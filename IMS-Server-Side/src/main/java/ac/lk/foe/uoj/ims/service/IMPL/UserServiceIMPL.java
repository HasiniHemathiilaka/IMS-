package ac.lk.foe.uoj.ims.service.IMPL;


import ac.lk.foe.uoj.ims.dto.UserLoginRequestDTO;
import ac.lk.foe.uoj.ims.dto.UserRegRequestDTO;
import ac.lk.foe.uoj.ims.entity.UserEntity;
import ac.lk.foe.uoj.ims.repo.UserRepository;
import ac.lk.foe.uoj.ims.service.UserService;
import ac.lk.foe.uoj.ims.utill.ServiceResponse;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class UserServiceIMPL implements UserService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JWTServiceIMPL jwtService;


    public UserServiceIMPL(UserRepository userRepository, ModelMapper modelMapper, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JWTServiceIMPL jwtService) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public ServiceResponse signUp(UserRegRequestDTO userRegRequestDTO) {
        if(isEnablePerson(userRegRequestDTO.getEmail())){
            return new ServiceResponse(false, "User already registered !",null);
        }

        try {
            UserEntity userEntity=modelMapper.map(userRegRequestDTO, UserEntity.class);
            userEntity.setId(null); // Always force INSERT — never let ModelMapper carry an id that triggers a JPA merge/update
            userEntity.setPassword(passwordEncoder.encode(userRegRequestDTO.getPassword()));
            userEntity.setState(false);
            if (userRegRequestDTO.getDepartmentId() != null) {
                userEntity.setDepartmentId(userRegRequestDTO.getDepartmentId());
            }
            userRepository.save(userEntity);
            return new ServiceResponse(true, "User registered successfully",null);
        }catch (Exception e){
            System.out.println(e.getMessage());
            return new ServiceResponse(false, "Registration Failed",null);
        }
    }

    @Override
    public ServiceResponse signIn(UserLoginRequestDTO userLoginRequestDTO) {
        System.out.println(userLoginRequestDTO.getEmail());
        if(isEnablePerson(userLoginRequestDTO.getEmail())){
            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                userLoginRequestDTO.getEmail(),userLoginRequestDTO.getPassword()));
            } catch (Exception e) {
                System.out.println(e.getMessage());
                return new ServiceResponse(false,"Login failed. Please check your password.",null);
            }

            if(userRepository.findStateByEmail(userLoginRequestDTO.getEmail())){
                Map<String,String> map = claims(userLoginRequestDTO.getEmail());
                System.out.println(map);
                return new ServiceResponse(true, jwtService.jwtToken(userLoginRequestDTO.getEmail(), map), map);
            }else {
                return new ServiceResponse(false,"Login failed. Please Waiting For Approve By Admin",null);
            }
        }
        else{
            return new ServiceResponse(false,"Login failed. No registered user found with the provided information.",null);
        }
    }

    private Map<String,String> claims(String email){
        Map<String,String> map = new HashMap<>();
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            map.put("role", user.getRole());
            map.put("id", String.valueOf(user.getId()));
            map.put("f_Name", user.getF_Name());
            map.put("l_Name", user.getL_Name());
            if (user.getDepartmentId() != null) {
                map.put("departmentId", String.valueOf(user.getDepartmentId()));
                if (user.getDepartment() != null) {
                    map.put("departmentName", user.getDepartment().getName());
                }
            }
        } else {
            map.put("role", userRepository.findRoleByEmail(email));
        }
        return map;
    }

    @Override
    public boolean isEnablePerson(String email) {
        return userRepository.existsByEmail(email);
    }

    // ─── User Management (Admin) ────────────────────────────────────────────────

    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public List<UserEntity> getPendingUsers() {
        return userRepository.findByState(false);
    }

    @Override
    public ServiceResponse approveUser(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setState(true);
            userRepository.save(user);
            return new ServiceResponse(true, "User approved successfully", null);
        }).orElse(new ServiceResponse(false, "User not found", null));
    }

    @Override
    public ServiceResponse updateUser(Long id, UserRegRequestDTO dto) {
        return userRepository.findById(id).map(user -> {
            if (dto.getF_Name() != null) user.setF_Name(dto.getF_Name());
            if (dto.getL_Name() != null) user.setL_Name(dto.getL_Name());
            if (dto.getContactNo() != null) user.setContactNo(dto.getContactNo());
            if (dto.getRole() != null) user.setRole(dto.getRole());
            if (dto.getGender() != null) user.setGender(dto.getGender());
            if (dto.getDepartmentId() != null) user.setDepartmentId(dto.getDepartmentId());
            userRepository.save(user);
            return new ServiceResponse(true, "User updated successfully", null);
        }).orElse(new ServiceResponse(false, "User not found", null));
    }

    @Override
    public ServiceResponse deactivateUser(Long id) {
        return userRepository.findById(id).map(user -> {
            user.setState(false);
            userRepository.save(user);
            return new ServiceResponse(true, "User deactivated successfully", null);
        }).orElse(new ServiceResponse(false, "User not found", null));
    }
}
