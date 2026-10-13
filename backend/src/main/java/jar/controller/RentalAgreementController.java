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

import jar.model.RentalAgreement;
import jar.service.RentalAgreementService;

@RestController
@RequestMapping("/api/agreements")
public class RentalAgreementController {

    private final RentalAgreementService agreementService;

    public RentalAgreementController(RentalAgreementService agreementService) {
        this.agreementService = agreementService;
    }

    @PostMapping
    public ResponseEntity<RentalAgreement> createAgreement(
            @RequestParam Long propertyId,
            @RequestParam Long tenantId,
            @RequestBody RentalAgreement agreement,
            Authentication authentication) {

        return ResponseEntity.ok(
                agreementService.createAgreement(
                        propertyId,
                        tenantId,
                        agreement,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<RentalAgreement>> getMyAgreements(
            Authentication authentication) {

        return ResponseEntity.ok(
                agreementService.getMyAgreements(authentication.getName())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalAgreement> getAgreement(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                agreementService.getAgreement(
                        id,
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentalAgreement> updateAgreement(
            @PathVariable Long id,
            @RequestBody RentalAgreement agreement,
            Authentication authentication) {

        return ResponseEntity.ok(
                agreementService.updateAgreement(
                        id,
                        agreement,
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}/terminate")
    public ResponseEntity<RentalAgreement> terminateAgreement(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                agreementService.terminateAgreement(
                        id,
                        authentication.getName()
                )
        );
    }
}