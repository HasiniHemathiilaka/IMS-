package ac.lk.foe.uoj.ims.service;

import java.util.Map;

public interface JWTService {

    public String jwtToken(String subject, Map<String,String> clams);
    public String getEmail(String token);
}
