package jar.service;

import java.util.List;

import org.springframework.stereotype.Service;

import jar.model.AgreementStatus;
import jar.model.Property;
import jar.model.RentalAgreement;
import jar.model.Role;
import jar.model.User;
import jar.repository.PropertyRepository;
import jar.repository.RentalAgreementRepository;
import jar.repository.UserRepository;

@Service
public class RentalAgreementService {

    private final RentalAgreementRepository agreementRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    public RentalAgreementService(
            RentalAgreementRepository agreementRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository) {
        this.agreementRepository = agreementRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
    }

    public RentalAgreement createAgreement(
            Long propertyId,
            Long tenantId,
            RentalAgreement agreement,
            String landlordEmail) {

        User landlord = getUser(landlordEmail);

        if (landlord.getRole() != Role.LANDLORD) {
            throw new RuntimeException("Only landlords can create rental agreements");
        }

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        if (!property.getLandlord().getId().equals(landlord.getId())) {
            throw new RuntimeException("You can only create agreements for your own properties");
        }

        User tenant = userRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (tenant.getRole() != Role.TENANT) {
            throw new RuntimeException("Selected user is not a tenant");
        }

        agreement.setProperty(property);
        agreement.setLandlord(landlord);
        agreement.setTenant(tenant);
        agreement.setStatus(AgreementStatus.ACTIVE);

        return agreementRepository.save(agreement);
    }

    public List<RentalAgreement> getMyAgreements(String email) {

        User user = getUser(email);

        if (user.getRole() == Role.LANDLORD) {
            return agreementRepository.findByLandlord(user);
        }

        if (user.getRole() == Role.TENANT) {
            return agreementRepository.findByTenant(user);
        }

        throw new RuntimeException("Administrators cannot use this endpoint");
    }

    public RentalAgreement getAgreement(Long id, String email) {

        User user = getUser(email);

        RentalAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental agreement not found"));

        boolean isLandlord =
                agreement.getLandlord().getId().equals(user.getId());

        boolean isTenant =
                agreement.getTenant().getId().equals(user.getId());

        if (!isLandlord && !isTenant) {
            throw new RuntimeException("You are not authorized to view this agreement");
        }

        return agreement;
    }

    public RentalAgreement updateAgreement(
            Long id,
            RentalAgreement updatedAgreement,
            String email) {

        User landlord = getUser(email);

        if (landlord.getRole() != Role.LANDLORD) {
            throw new RuntimeException("Only landlords can update rental agreements");
        }

        RentalAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental agreement not found"));

        if (!agreement.getLandlord().getId().equals(landlord.getId())) {
            throw new RuntimeException("You can only modify your own agreements");
        }

        agreement.setMonthlyRent(updatedAgreement.getMonthlyRent());
        agreement.setSecurityDeposit(updatedAgreement.getSecurityDeposit());
        agreement.setStartDate(updatedAgreement.getStartDate());
        agreement.setEndDate(updatedAgreement.getEndDate());

        if (updatedAgreement.getStatus() != null) {
            agreement.setStatus(updatedAgreement.getStatus());
        }

        return agreementRepository.save(agreement);
    }

    public RentalAgreement terminateAgreement(Long id, String email) {

        User landlord = getUser(email);

        if (landlord.getRole() != Role.LANDLORD) {
            throw new RuntimeException("Only landlords can terminate agreements");
        }

        RentalAgreement agreement = agreementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental agreement not found"));

        if (!agreement.getLandlord().getId().equals(landlord.getId())) {
            throw new RuntimeException("You can only terminate your own agreements");
        }

        agreement.setStatus(AgreementStatus.TERMINATED);

        return agreementRepository.save(agreement);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}