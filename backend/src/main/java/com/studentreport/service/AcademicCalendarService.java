package com.studentreport.service;

import com.studentreport.dto.EnterpriseDTO;
import com.studentreport.entity.AcademicEvent;
import com.studentreport.exception.ResourceNotFoundException;
import com.studentreport.repository.AcademicEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AcademicCalendarService {

    private final AcademicEventRepository eventRepository;

    public AcademicCalendarService(AcademicEventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Transactional(readOnly = true)
    public List<EnterpriseDTO.AcademicEventDTO> getAllEvents() {
        return eventRepository.findByIsPublishedTrueOrderByStartDateAsc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnterpriseDTO.AcademicEventDTO createEvent(EnterpriseDTO.AcademicEventDTO dto) {
        AcademicEvent ev = AcademicEvent.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .eventType(dto.getEventType() != null ? dto.getEventType() : AcademicEvent.EventType.ACADEMIC)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .location(dto.getLocation() != null ? dto.getLocation() : "Campus")
                .isPublished(dto.getIsPublished() != null ? dto.getIsPublished() : true)
                .build();
        return mapToDTO(eventRepository.save(ev));
    }

    @Transactional
    public void deleteEvent(UUID id) {
        eventRepository.deleteById(id);
    }

    private EnterpriseDTO.AcademicEventDTO mapToDTO(AcademicEvent e) {
        return EnterpriseDTO.AcademicEventDTO.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .eventType(e.getEventType())
                .startDate(e.getStartDate())
                .endDate(e.getEndDate())
                .startTime(e.getStartTime())
                .endTime(e.getEndTime())
                .location(e.getLocation())
                .isPublished(e.getIsPublished())
                .build();
    }
}
