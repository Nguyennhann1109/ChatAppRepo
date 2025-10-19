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

import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.Impl.UserServiceImpl;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

	@Mock
	private UserRepository userRepository;

	@InjectMocks
	private UserServiceImpl userService;

	private User testUser;

	@BeforeEach
	void setUp() {
		testUser = new User();
		testUser.setUserId(1L);
		testUser.setUsername("testuser");
		testUser.setPasswordHash("hashedpass");
		testUser.setEmail("test@example.com");
	}

	@Test
	void testGetUserById_Success() {
		// Given
		when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

		// When
		Optional<User> result = userService.getUserById(1L);

		// Then
		assertTrue(result.isPresent());
		assertEquals("testuser", result.get().getUsername());
		verify(userRepository, times(1)).findById(1L);
	}

	@Test
	void testGetUserById_NotFound() {
		// Given
		when(userRepository.findById(999L)).thenReturn(Optional.empty());

		// When
		Optional<User> result = userService.getUserById(999L);

		// Then
		assertTrue(result.isEmpty());
		verify(userRepository, times(1)).findById(999L);
	}

	@Test
	void testSaveUser_Success() {
		// Given
		when(userRepository.existsByUsername(anyString())).thenReturn(false);
		when(userRepository.existsByEmail(anyString())).thenReturn(false);
		when(userRepository.save(any(User.class))).thenReturn(testUser);

		// When
		User result = userService.saveUser(testUser);

		// Then
		assertNotNull(result);
		assertEquals("testuser", result.getUsername());
		verify(userRepository, times(1)).save(testUser);
	}

	@Test
	void testSaveUser_UsernameExists_ThrowsException() {
		// Given
		when(userRepository.existsByUsername("testuser")).thenReturn(true);

		// When & Then
		IllegalArgumentException exception = assertThrows(
			IllegalArgumentException.class,
			() -> userService.saveUser(testUser)
		);
		
		assertEquals("Username already exists", exception.getMessage());
		verify(userRepository, never()).save(any());
	}

	@Test
	void testSaveUser_EmailExists_ThrowsException() {
		// Given
		when(userRepository.existsByUsername(anyString())).thenReturn(false);
		when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

		// When & Then
		IllegalArgumentException exception = assertThrows(
			IllegalArgumentException.class,
			() -> userService.saveUser(testUser)
		);
		
		assertEquals("Email already exists", exception.getMessage());
		verify(userRepository, never()).save(any());
	}

	@Test
	void testUpdateUser_Success() {
		// Given
		User updateData = new User();
		updateData.setEmail("newemail@example.com");
		updateData.setPhoneNumber("0987654321");

		when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
		when(userRepository.save(any(User.class))).thenReturn(testUser);

		// When
		User result = userService.updateUser(1L, updateData);

		// Then
		assertNotNull(result);
		verify(userRepository, times(1)).save(testUser);
	}

	@Test
	void testUpdateUser_NotFound_ThrowsException() {
		// Given
		when(userRepository.findById(999L)).thenReturn(Optional.empty());

		// When & Then
		RuntimeException exception = assertThrows(
			RuntimeException.class,
			() -> userService.updateUser(999L, testUser)
		);
		
		assertTrue(exception.getMessage().contains("not found"));
	}

	@Test
	void testDeleteUser() {
		// When
		userService.deleteUser(1L);

		// Then
		verify(userRepository, times(1)).deleteById(1L);
	}
}




