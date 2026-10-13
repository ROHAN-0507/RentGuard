package jar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import jar.model.Payment;
import jar.model.User;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByLandlord(User landlord);

    List<Payment> findByTenant(User tenant);
}