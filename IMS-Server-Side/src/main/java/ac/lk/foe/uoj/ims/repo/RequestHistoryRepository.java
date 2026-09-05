package ac.lk.foe.uoj.ims.repo;

import ac.lk.foe.uoj.ims.entity.RequestHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestHistoryRepository extends JpaRepository<RequestHistory, Long> {
    List<RequestHistory> findByRequestIdOrderByTimestampAsc(Long requestId);
}
