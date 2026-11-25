package com.studentreport.service;

import com.studentreport.entity.Notification;
import com.studentreport.entity.User;
import com.studentreport.repository.NotificationRepository;
import com.studentreport.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(String email) {
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notificationRepository.countByUserEmailAndIsReadFalse(email);
    }

    @Transactional
    public void markAsRead(UUID id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> list = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }

    @Transactional
    public int broadcast(String title, String message, String roleTarget, Notification.NotificationType type) {
        List<User> targetUsers;
        if (roleTarget == null || "ALL".equalsIgnoreCase(roleTarget)) {
            targetUsers = userRepository.findAll();
        } else {
            User.Role r = User.Role.valueOf(roleTarget.toUpperCase());
            targetUsers = userRepository.findByRole(r);
        }

        List<Notification> toSave = targetUsers.stream()
                .map(u -> Notification.builder()
                        .user(u)
                        .title(title)
                        .message(message)
                        .type(type != null ? type : Notification.NotificationType.INFO)
                        .isRead(false)
                        .build())
                .toList();

        notificationRepository.saveAll(toSave);
        return toSave.size();
    }
}
