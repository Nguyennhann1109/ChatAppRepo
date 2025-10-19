package QuanLy.Chat.Service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import QuanLy.Chat.Entity.ChatRoom;
import QuanLy.Chat.Entity.Message;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.ChatRoomRepository;
import QuanLy.Chat.Repository.MessageRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.Impl.MessageServiceImpl;

@ExtendWith(MockitoExtension.class)
class MessageServiceImplTest {

	@Mock
	private MessageRepository messageRepository;

	@Mock
	private ChatRoomRepository chatRoomRepository;

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private MessageServiceImpl messageService;

	private ChatRoom testRoom;
	private User testSender;
	private Message testMessage;

	@BeforeEach
	void setUp() {
		testRoom = new ChatRoom();
		testRoom.setChatRoomId(1L);
		testRoom.setRoomName("Test Room");

		testSender = new User();
		testSender.setUserId(1L);
		testSender.setUsername("sender");

		testMessage = new Message();
		testMessage.setMessageId(1L);
		testMessage.setChatRoom(testRoom);
		testMessage.setSender(testSender);
		testMessage.setContent("Test message");
	}

	@Test
	void testSendMessage_Success() {
		// Given
		when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(testRoom));
		when(userRepository.findById(1L)).thenReturn(Optional.of(testSender));
		when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

		// When
		Message result = messageService.sendMessage(1L, 1L, "Test message");

		// Then
		assertNotNull(result);
		assertEquals("Test message", result.getContent());
		verify(messageRepository, times(1)).save(any(Message.class));
	}

	@Test
	void testSendMessage_EmptyContent_ThrowsException() {
		// When & Then
		IllegalArgumentException exception = assertThrows(
			IllegalArgumentException.class,
			() -> messageService.sendMessage(1L, 1L, "")
		);
		
		assertEquals("Nội dung tin nhắn trống", exception.getMessage());
		verify(messageRepository, never()).save(any());
	}

	@Test
	void testSendMessage_RoomNotFound_ThrowsException() {
		// Given
		when(chatRoomRepository.findById(999L)).thenReturn(Optional.empty());

		// When & Then
		RuntimeException exception = assertThrows(
			RuntimeException.class,
			() -> messageService.sendMessage(999L, 1L, "Test")
		);
		
		assertTrue(exception.getMessage().contains("Không tìm thấy phòng"));
	}

	@Test
	void testEditMessage_Success() {
		// Given
		when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));
		when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

		// When
		Message result = messageService.editMessage(1L, 1L, "Updated content");

		// Then
		assertNotNull(result);
		verify(messageRepository, times(1)).save(testMessage);
	}

	@Test
	void testEditMessage_NotOwner_ThrowsException() {
		// Given
		when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));

		// When & Then
		RuntimeException exception = assertThrows(
			RuntimeException.class,
			() -> messageService.editMessage(1L, 999L, "Updated")
		);
		
		assertTrue(exception.getMessage().contains("Chỉ người gửi mới được sửa"));
	}

	@Test
	void testSoftDeleteMessage_Success() {
		// Given
		when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));
		when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

		// When
		messageService.softDeleteMessage(1L, 1L);

		// Then
		verify(messageRepository, times(1)).save(testMessage);
	}

	@Test
	void testMarkDelivered_Success() {
		// Given
		when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));
		when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

		// When
		Message result = messageService.markDelivered(1L, 1L);

		// Then
		assertNotNull(result);
		assertEquals("DELIVERED", result.getStatus());
		verify(messageRepository, times(1)).save(testMessage);
	}

	@Test
	void testMarkSeen_Success() {
		// Given
		when(messageRepository.findById(1L)).thenReturn(Optional.of(testMessage));
		when(messageRepository.save(any(Message.class))).thenReturn(testMessage);

		// When
		Message result = messageService.markSeen(1L, 1L);

		// Then
		assertNotNull(result);
		assertEquals("SEEN", result.getStatus());
		verify(messageRepository, times(1)).save(testMessage);
	}
}




