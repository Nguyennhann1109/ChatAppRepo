package QuanLy.Chat.Service;

import java.util.List;

import QuanLy.Chat.Entity.Message;

public interface MessageService {
	Message sendMessage(Long roomId, Long senderId, String content);
	List<Message> listMessagesByRoom(Long roomId);
	List<Message> listMessagesByRoom(Long roomId, int page, int size);
	Message editMessage(Long messageId, Long editorUserId, String newContent);
	void softDeleteMessage(Long messageId, Long requesterUserId);
	Message markDelivered(Long messageId, Long userId);
	Message markSeen(Long messageId, Long userId);
	Message sendMedia(Long roomId, Long senderId, String fileName, String contentType, String url);
}


