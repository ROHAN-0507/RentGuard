package jar.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import jar.model.Property;
import jar.model.User;

public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByLandlord(User landlord);
}