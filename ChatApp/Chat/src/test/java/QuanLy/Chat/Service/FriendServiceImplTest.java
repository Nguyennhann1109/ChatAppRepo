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

import QuanLy.Chat.DTO.FriendDTO;
import QuanLy.Chat.Entity.Friend;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.FriendRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.Impl.FriendServiceImpl;

@ExtendWith(MockitoExtension.class)
class FriendServiceImplTest {

	@Mock
	private FriendRepository friendRepository;

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private FriendServiceImpl friendService;

	private User user1;
	private User user2;

	@BeforeEach
	void setUp() {
		user1 = new User();
		user1.setUserId(1L);
		user1.setUsername("user1");

		user2 = new User();
		user2.setUserId(2L);
		user2.setUsername("user2");
	}

	@Test
	void testAddFriend_Success() {
		// Given
		when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
		when(userRepository.findById(2L)).thenReturn(Optional.of(user2));
		when(friendRepository.existsByUser_UserIdAndFriend_UserId(anyLong(), anyLong())).thenReturn(false);
		when(friendRepository.save(any(Friend.class))).thenAnswer(invocation -> {
			Friend f = invocation.getArgument(0);
			return f;
		});

		// When
		FriendDTO result = friendService.addFriend(1L, 2L);

		// Then
		assertNotNull(result);
		assertEquals(1L, result.getUserId());
		assertEquals(2L, result.getFriendId());
		assertEquals("pending", result.getStatus());
		verify(friendRepository, times(1)).save(any(Friend.class));
	}

	@Test
	void testAddFriend_SelfFriend_ThrowsException() {
		// When & Then
		IllegalArgumentException exception = assertThrows(
			IllegalArgumentException.class,
			() -> friendService.addFriend(1L, 1L)
		);
		
		assertEquals("Không thể tự kết bạn với chính mình", exception.getMessage());
		verify(friendRepository, never()).save(any());
	}

	@Test
	void testAddFriend_AlreadyExists_ThrowsException() {
		// Given
		when(userRepository.findById(anyLong())).thenReturn(Optional.of(user1));
		when(friendRepository.existsByUser_UserIdAndFriend_UserId(1L, 2L)).thenReturn(true);

		// When & Then
		RuntimeException exception = assertThrows(
			RuntimeException.class,
			() -> friendService.addFriend(1L, 2L)
		);
		
		assertTrue(exception.getMessage().contains("Đã tồn tại"));
	}

	@Test
	void testAcceptFriend_Success() {
		// Given
		Friend friendRequest = new Friend(user1, user2, "pending");
		when(userRepository.findById(anyLong())).thenReturn(Optional.of(user1));
		when(friendRepository.findByUser_UserIdAndFriend_UserId(1L, 2L)).thenReturn(Optional.of(friendRequest));
		when(friendRepository.existsByUser_UserIdAndFriend_UserId(2L, 1L)).thenReturn(false);
		when(friendRepository.save(any(Friend.class))).thenAnswer(invocation -> invocation.getArgument(0));

		// When
		FriendDTO result = friendService.acceptFriend(1L, 2L);

		// Then
		assertNotNull(result);
		assertEquals("accepted", result.getStatus());
		verify(friendRepository, times(2)).save(any(Friend.class)); // Original + reverse
	}

	@Test
	void testDeleteFriend_Success() {
		// Given
		Friend friendRelation = new Friend(user1, user2, "accepted");
		when(friendRepository.findByUser_UserIdAndFriend_UserId(1L, 2L)).thenReturn(Optional.of(friendRelation));
		when(friendRepository.findByUser_UserIdAndFriend_UserId(2L, 1L)).thenReturn(Optional.of(friendRelation));

		// When
		friendService.deleteFriend(1L, 2L);

		// Then
		verify(friendRepository, times(2)).delete(any(Friend.class)); // Both directions
	}
}




