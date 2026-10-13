package jar.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jar.model.Property;
import jar.service.PropertyService;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    public ResponseEntity<Property> createProperty(
            @RequestBody Property property,
            Authentication authentication) {

        return ResponseEntity.ok(
                propertyService.createProperty(
                        property,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/my")
    public ResponseEntity<List<Property>> getMyProperties(
            Authentication authentication) {

        return ResponseEntity.ok(
                propertyService.getMyProperties(
                        authentication.getName()
                )
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> updateProperty(
            @PathVariable Long id,
            @RequestBody Property property,
            Authentication authentication) {

        return ResponseEntity.ok(
                propertyService.updateProperty(
                        id,
                        property,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id,
            Authentication authentication) {

        propertyService.deleteProperty(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}