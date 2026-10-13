package jar.service;

import java.util.List;

import org.springframework.stereotype.Service;

import jar.model.Property;
import jar.model.Role;
import jar.model.User;
import jar.repository.PropertyRepository;
import jar.repository.UserRepository;

@Service
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public PropertyService(
            PropertyRepository propertyRepository,
            UserRepository userRepository) {
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    public Property createProperty(Property property, String email) {
        User landlord = getLandlord(email);
        property.setLandlord(landlord);
        return propertyRepository.save(property);
    }

    public List<Property> getMyProperties(String email) {
        User landlord = getLandlord(email);
        return propertyRepository.findByLandlord(landlord);
    }

    public Property updateProperty(
            Long propertyId,
            Property updatedProperty,
            String email) {

        User landlord = getLandlord(email);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getLandlord().getId().equals(landlord.getId())) {
            throw new RuntimeException("You can only modify your own properties");
        }

        property.setTitle(updatedProperty.getTitle());
        property.setAddress(updatedProperty.getAddress());
        property.setCity(updatedProperty.getCity());
        property.setState(updatedProperty.getState());
        property.setPincode(updatedProperty.getPincode());
        property.setMonthlyRent(updatedProperty.getMonthlyRent());
        property.setDescription(updatedProperty.getDescription());

        return propertyRepository.save(property);
    }

    public void deleteProperty(Long propertyId, String email) {
        User landlord = getLandlord(email);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getLandlord().getId().equals(landlord.getId())) {
            throw new RuntimeException("You can only delete your own properties");
        }

        propertyRepository.delete(property);
    }

    private User getLandlord(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.LANDLORD) {
            throw new RuntimeException("Only landlords can manage properties");
        }

        return user;
    }
}