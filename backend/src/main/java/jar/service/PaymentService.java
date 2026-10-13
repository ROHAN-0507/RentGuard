package jar.service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import jar.model.Payment;
import jar.model.PaymentStatus;
import jar.model.RentalAgreement;
import jar.model.Role;
import jar.model.User;
import jar.repository.PaymentRepository;
import jar.repository.RentalAgreementRepository;
import jar.repository.UserRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RentalAgreementRepository agreementRepository;
    private final UserRepository userRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            RentalAgreementRepository agreementRepository,
            UserRepository userRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.agreementRepository = agreementRepository;
        this.userRepository = userRepository;
    }

    public Payment createPayment(
            Long agreementId,
            Payment payment,
            Authentication authentication
    ) {

        User currentUser = getCurrentUser(authentication);

        if (currentUser.getRole() != Role.LANDLORD) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only landlords can create payment records"
            );
        }

        RentalAgreement agreement = agreementRepository.findById(agreementId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Agreement not found"
                        )
                );

        if (agreement.getLandlord() == null ||
                !agreement.getLandlord().getId().equals(currentUser.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not own this agreement"
            );
        }

        if (agreement.getTenant() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Agreement does not have a tenant"
            );
        }

        if (payment.getAmount() == null ||
                payment.getAmount().signum() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount must be greater than zero"
            );
        }

        if (payment.getDueDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Due date is required"
            );
        }

        payment.setAgreement(agreement);
        payment.setLandlord(currentUser);
        payment.setTenant(agreement.getTenant());

        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaidDate(null);

        return paymentRepository.save(payment);
    }

    public List<Payment> getMyPayments(Authentication authentication) {

        User currentUser = getCurrentUser(authentication);

        List<Payment> payments;

        if (currentUser.getRole() == Role.LANDLORD) {
            payments = paymentRepository.findByLandlord(currentUser);
        } else if (currentUser.getRole() == Role.TENANT) {
            payments = paymentRepository.findByTenant(currentUser);
        } else {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This account cannot access payments"
            );
        }

        updateOverduePayments(payments);

        payments.sort(
                Comparator.comparing(
                        Payment::getDueDate,
                        Comparator.nullsLast(Comparator.reverseOrder())
                )
        );

        return payments;
    }

    public Payment getPayment(
            Long paymentId,
            Authentication authentication
    ) {

        User currentUser = getCurrentUser(authentication);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Payment not found"
                        )
                );

        validateOwnership(payment, currentUser);

        updateOverdueStatus(payment);

        return payment;
    }

    public Payment markAsPaid(
            Long paymentId,
            Authentication authentication
    ) {

        User currentUser = getCurrentUser(authentication);

        if (currentUser.getRole() != Role.LANDLORD) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only landlords can mark payments as paid"
            );
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Payment not found"
                        )
                );

        if (payment.getLandlord() == null ||
                !payment.getLandlord().getId().equals(currentUser.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not own this payment"
            );
        }

        if (payment.getStatus() == PaymentStatus.PAID) {
            return payment;
        }

        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidDate(LocalDate.now());

        return paymentRepository.save(payment);
    }

    private void updateOverduePayments(List<Payment> payments) {

        boolean changed = false;

        for (Payment payment : payments) {

            if (updateOverdueStatus(payment)) {
                changed = true;
            }
        }

        if (changed) {
            paymentRepository.saveAll(payments);
        }
    }

    private boolean updateOverdueStatus(Payment payment) {

        if (payment.getStatus() == PaymentStatus.PENDING &&
                payment.getDueDate() != null &&
                payment.getDueDate().isBefore(LocalDate.now())) {

            payment.setStatus(PaymentStatus.OVERDUE);

            return true;
        }

        return false;
    }

    private void validateOwnership(
            Payment payment,
            User currentUser
    ) {

        boolean landlordOwns =
                payment.getLandlord() != null &&
                payment.getLandlord().getId().equals(currentUser.getId());

        boolean tenantOwns =
                payment.getTenant() != null &&
                payment.getTenant().getId().equals(currentUser.getId());

        if (!landlordOwns && !tenantOwns) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You do not have access to this payment"
            );
        }
    }

    private User getCurrentUser(Authentication authentication) {

        if (authentication == null ||
                authentication.getName() == null) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "User not found"
                        )
                );
    }
}