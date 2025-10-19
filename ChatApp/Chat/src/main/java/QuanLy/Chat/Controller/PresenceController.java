package QuanLy.Chat.Controller;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import QuanLy.Chat.DTO.TypingDTO;

@RestController
@RequestMapping("/api/presence")
public class PresenceController {

	private final SimpMessagingTemplate messagingTemplate;

	private static final Logger logger = LoggerFactory.getLogger(PresenceController.class);
	private final Set<Long> onlineUsers = ConcurrentHashMap.newKeySet();
	// Map sessionId -> userId for disconnect handling
	private final Map<String, Long> sessionUserMap = new ConcurrentHashMap<>();

	public PresenceController(SimpMessagingTemplate messagingTemplate) {
		this.messagingTemplate = messagingTemplate;
	}

	// WS: client gửi /app/typing với body TypingDTO
	@MessageMapping("/typing")
	public void typing(@Payload TypingDTO typing) {
		messagingTemplate.convertAndSend("/topic/rooms/" + typing.getRoomId() + "/typing", typing);
	}

	// WS: client gửi /app/presence với body { userId, online }
	@MessageMapping("/presence")
	public void presence(@Payload Map<String, Object> presence, SimpMessageHeaderAccessor headerAccessor) {
		try {
			Object u = presence.get("userId");
			if (u == null) return;
			Long userId = Long.valueOf(String.valueOf(u));
			Boolean online = Boolean.TRUE.equals(presence.get("online"));

			String sessionId = headerAccessor.getSessionId();
			if (sessionId != null) {
				sessionUserMap.put(sessionId, userId);
			}

			if (online) onlineUsers.add(userId);
			else onlineUsers.remove(userId);

			// broadcast presence update
			messagingTemplate.convertAndSend("/topic/presence", Map.of("userId", userId, "online", online));
		} catch (RuntimeException e) {
			logger.error("Error handling presence message", e);
			throw e;
		}
	}

	// REST: get online status simple demo (server-only memory)
	@GetMapping("/online/{userId}")
	public ResponseEntity<Boolean> isOnline(@PathVariable Long userId) {
		return ResponseEntity.ok(onlineUsers.contains(userId));
	}

	// Listen for disconnect events to remove user
	@EventListener
	public void handleSessionDisconnect(SessionDisconnectEvent event) {
		StompHeaderAccessor sha = StompHeaderAccessor.wrap(event.getMessage());
		String sessionId = sha.getSessionId();
		Long userId = sessionUserMap.remove(sessionId);
		if (userId != null) {
			onlineUsers.remove(userId);
			messagingTemplate.convertAndSend("/topic/presence", Map.of("userId", userId, "online", false));
		}
	}
}


