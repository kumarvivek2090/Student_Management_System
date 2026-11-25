package com.studentreport.controller;

import com.studentreport.dto.ApiResponse;
import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.service.MaterialService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/materials")
public class MaterialController {

    private final MaterialService materialService;

    public MaterialController(MaterialService materialService) {
        this.materialService = materialService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EnterpriseDTO.LearningMaterialDTO>>> getMaterials(Authentication auth) {
        String role = auth.getAuthorities().stream().findFirst().map(a -> a.getAuthority().replace("ROLE_", "")).orElse("");
        if ("TEACHER".equals(role)) {
            return ResponseEntity.ok(ApiResponse.ok(materialService.getByTeacher(auth.getName())));
        } else if ("STUDENT".equals(role)) {
            return ResponseEntity.ok(ApiResponse.ok(materialService.getForStudent(auth.getName())));
        }
        return ResponseEntity.ok(ApiResponse.ok(materialService.getAll()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<EnterpriseDTO.LearningMaterialDTO>> createMaterial(
            @RequestBody EnterpriseDTO.CreateMaterialRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.ok("Resource published", materialService.create(request, auth.getName())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<Void>> deleteMaterial(@PathVariable UUID id) {
        materialService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Resource removed", null));
    }
}
