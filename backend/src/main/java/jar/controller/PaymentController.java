package jar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jar.model.Payment;
import jar.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<Payment> createPayment(
            @RequestParam Long agreementId,
            @RequestBody Payment payment,
            Authentication authentication
    ) {

        Payment created = paymentService.createPayment(
                agreementId,
                payment,
                authentication
        );

        return ResponseEntity.ok(created);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Payment>> getMyPayments(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                paymentService.getMyPayments(authentication)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPayment(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                paymentService.getPayment(id, authentication)
        );
    }

    @PutMapping("/{id}/paid")
    public ResponseEntity<Payment> markAsPaid(
            @PathVariable Long id,
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                paymentService.markAsPaid(id, authentication)
        );
    }
}