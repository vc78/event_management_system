package com.ems.event_management_system.service;

import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;
import org.springframework.web.socket.messaging.SessionUnsubscribeEvent;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class WebSocketSessionTracker {

    private final SimpMessagingTemplate messagingTemplate;

    // Maps sessionId -> eventId
    private final Map<String, Long> sessionToEventMap = new ConcurrentHashMap<>();
    
    // Maps eventId -> count
    private final Map<Long, Integer> eventAttendeeCount = new ConcurrentHashMap<>();

    private static final Pattern SUBSCRIBE_PATTERN = Pattern.compile("^/topic/engagement/(\\d+)/room$");

    @EventListener
    public void handleSessionSubscribe(SessionSubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = accessor.getDestination();
        if (destination != null) {
            Matcher matcher = SUBSCRIBE_PATTERN.matcher(destination);
            if (matcher.matches()) {
                Long eventId = Long.parseLong(matcher.group(1));
                String sessionId = accessor.getSessionId();
                sessionToEventMap.put(sessionId, eventId);
                
                eventAttendeeCount.merge(eventId, 1, Integer::sum);
                broadcastAttendeeCount(eventId);
            }
        }
    }

    @EventListener
    public void handleSessionUnsubscribe(SessionUnsubscribeEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        removeSession(sessionId);
    }

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = accessor.getSessionId();
        removeSession(sessionId);
    }

    private void removeSession(String sessionId) {
        Long eventId = sessionToEventMap.remove(sessionId);
        if (eventId != null) {
            eventAttendeeCount.computeIfPresent(eventId, (id, count) -> {
                int next = count - 1;
                return next < 0 ? 0 : next;
            });
            broadcastAttendeeCount(eventId);
        }
    }

    private void broadcastAttendeeCount(Long eventId) {
        int count = eventAttendeeCount.getOrDefault(eventId, 0);
        messagingTemplate.convertAndSend("/topic/engagement/" + eventId + "/attending", Map.of("count", count));
    }
}
