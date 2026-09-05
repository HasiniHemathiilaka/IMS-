package ac.lk.foe.uoj.ims.filter;

import ac.lk.foe.uoj.ims.entity.UserEntity;
import ac.lk.foe.uoj.ims.repo.UserRepository;
import ac.lk.foe.uoj.ims.service.JWTService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JWTFilter extends OncePerRequestFilter {
    private final JWTService jwtService;
    private final UserRepository userRepository;

    public JWTFilter(JWTService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Skip JWT processing for public auth endpoints
        String path = request.getServletPath();
        if (path.contains("/auth/signin") || path.contains("/auth/signup")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwtToken = authorization.split(" ")[1];
        String email = jwtService.getEmail(jwtToken);
        if (email == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Only set authentication if not already set
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        UserEntity userData = userRepository.findByEmail(email).orElse(null);
        if (userData == null) {
            // Unknown user – let request proceed without authentication (will fail security
            // check)
            filterChain.doFilter(request, response);
            return;
        }

        String role = userData.getRole().toUpperCase().trim();
        // Normalize role for Spring Security authorities
        if (role.equals("IN") || role.equals("LIC")) role = "LAB_IN_CHARGE";
        if (role.equals("TO")) role = "LAB_TO";
        if (role.equals("MA") || role.equals("MANAGEMENT_ASSISTANT") || role.equals("MGT_ASST")) role = "MA";

        UserDetails userDetails = User.builder()
                .username(userData.getEmail())
                .password(userData.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority(role)))
                .build();

        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(userDetails, null,
                userDetails.getAuthorities());
        token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(token);

        filterChain.doFilter(request, response);
    }
}
