package ac.lk.foe.uoj.ims.service.IMPL;

import ac.lk.foe.uoj.ims.entity.UserEntity;
import ac.lk.foe.uoj.ims.repo.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MyUserDetailServiceIMPL implements UserDetailsService {
    private final UserRepository userRepository;

    public MyUserDetailServiceIMPL(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserEntity userEntity = userRepository.findByEmail(email).orElse(null);
        if (userEntity != null) {
            return User.builder()
                    // Use email as the username so Spring Security can match
                    // the submitted credentials correctly
                    .username(userEntity.getEmail())
                    .password(userEntity.getPassword())
                    .authorities(List.of(new SimpleGrantedAuthority(userEntity.getRole())))
                    .build();
        }
        throw new UsernameNotFoundException("User not found: " + email);
    }
}
