package com.studentreport.service;

import com.studentreport.entity.ActivityLog;
import com.studentreport.repository.ActivityLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ActivityLogService {

    private final ActivityLogRepository logRepository;

    public ActivityLogService(ActivityLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getRecent() {
        return logRepository.findTop20ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getPaginated(int page, int size) {
        return logRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Transactional
    public ActivityLog log(String email, String action, String details, String ip, ActivityLog.Severity severity) {
        ActivityLog log = ActivityLog.builder()
                .userEmail(email)
                .action(action)
                .details(details)
                .ipAddress(ip != null ? ip : "127.0.0.1")
                .severity(severity != null ? severity : ActivityLog.Severity.INFO)
                .build();
        return logRepository.save(log);
    }
}
