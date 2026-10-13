package jar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import jar.model.RentalAgreement;
import jar.model.User;

public interface RentalAgreementRepository extends JpaRepository<RentalAgreement, Long> {

    List<RentalAgreement> findByLandlord(User landlord);

    List<RentalAgreement> findByTenant(User tenant);
}