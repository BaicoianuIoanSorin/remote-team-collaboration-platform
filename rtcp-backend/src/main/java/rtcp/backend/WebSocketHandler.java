package rtcp.backend;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.util.HashSet;
import java.util.Set;

@Component
public class WebSocketHandler extends TextWebSocketHandler {

    private Set<WebSocketSession> activeSessions = new HashSet<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        activeSessions.add(session);
        System.out.println("New session established: " + session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        activeSessions.remove(session);
        System.out.println("Session closed: " + session.getId());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        System.out.println("Received message: " + message.getPayload());
        activeSessions.stream().filter(s -> !s.getId().equals(session.getId())).forEach(s -> {
            try {
                s.sendMessage(message);
                System.out.println("Sent message to session: " + s.getId());
            } catch (Exception e) {
                System.out.println("Error sending message to session: " + s.getId());
            }
        });
    }
}