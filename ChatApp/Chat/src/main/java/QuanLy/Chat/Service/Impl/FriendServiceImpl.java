package QuanLy.Chat.Service.Impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import QuanLy.Chat.DTO.FriendDTO;
import QuanLy.Chat.Entity.ChatRoom;
import QuanLy.Chat.Entity.Friend;
import QuanLy.Chat.Entity.User;
import QuanLy.Chat.Repository.FriendRepository;
import QuanLy.Chat.Repository.UserRepository;
import QuanLy.Chat.Service.ChatRoomService;
import QuanLy.Chat.Service.FriendService;
import QuanLy.Chat.Service.NotificationService;

@Service
public class FriendServiceImpl implements FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final ChatRoomService chatRoomService;
    private final NotificationService notificationService;

    public FriendServiceImpl(FriendRepository friendRepository, UserRepository userRepository, @Lazy ChatRoomService chatRoomService, NotificationService notificationService) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
        this.chatRoomService = chatRoomService;
        this.notificationService = notificationService;
    }

    @Override
    public FriendDTO addFriend(Long userId, Long friendId) {
        if (userId == null || friendId == null)
            throw new IllegalArgumentException("Thiếu tham số userId hoặc friendId");

        if (userId.equals(friendId))
            throw new IllegalArgumentException("Không thể tự kết bạn với chính mình");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + userId));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bạn bè với ID: " + friendId));

        // Kiểm tra xem đã có mối quan hệ hay chưa
        if (friendRepository.existsByUser_UserIdAndFriend_UserId(userId, friendId)
                || friendRepository.existsByUser_UserIdAndFriend_UserId(friendId, userId)) {
            throw new IllegalArgumentException("Đã tồn tại lời mời hoặc quan hệ bạn bè");
        }

        // Tạo lời mời pending
        Friend relation = new Friend(user, friend, "pending");
        friendRepository.save(relation);

        // Tạo thông báo cho người được mời
        try {
            notificationService.createFriendRequestNotification(friendId, userId);
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo thông báo lời mời kết bạn: " + e.getMessage());
        }

        return new FriendDTO(user.getUserId(), friend.getUserId(), relation.getStatus());
    }

    @Override
    public FriendDTO acceptFriend(Long userId, Long friendId) {
        if (userId == null || friendId == null)
            throw new IllegalArgumentException("Thiếu tham số userId hoặc friendId");

        if (userId.equals(friendId))
            throw new IllegalArgumentException("Yêu cầu không hợp lệ");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + userId));
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bạn bè với ID: " + friendId));

        // Chỉ có người được mời (friendId -> userId) mới chấp nhận
        Friend relation = friendRepository.findByUser_UserIdAndFriend_UserId(friendId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tồn tại lời mời kết bạn"));

        relation.setStatus("accepted");
        friendRepository.save(relation);

        // Tạo chiều ngược lại nếu chưa tồn tại
        if (!friendRepository.existsByUser_UserIdAndFriend_UserId(userId, friendId)) {
            Friend reverse = new Friend(user, friend, "accepted");
            friendRepository.save(reverse);
        }

        // Tạo phòng chat riêng
        createPrivateChatRoom(user, friend);

        // Xóa thông báo friend request cũ
        try {
            notificationService.deleteFriendRequestNotification(userId, friendId);
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa thông báo lời mời: " + e.getMessage());
        }

        // Tạo thông báo cho người gửi lời mời
        try {
            notificationService.createFriendAcceptNotification(friendId, userId);
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo thông báo chấp nhận kết bạn: " + e.getMessage());
        }

        return new FriendDTO(user.getUserId(), friend.getUserId(), "accepted");
    }

    @Override
    public void rejectFriend(Long userId, Long friendId) {
        // Xóa lời mời trong DB
        friendRepository.findByUser_UserIdAndFriend_UserId(friendId, userId)
                .ifPresent(friendRepository::delete);
        
        // Xóa thông báo friend request
        try {
            notificationService.deleteFriendRequestNotification(userId, friendId);
        } catch (Exception e) {
            System.err.println("Lỗi khi xóa thông báo lời mời: " + e.getMessage());
        }
    }

    @Override
    public void cancelRequest(Long userId, Long friendId) {
        friendRepository.findByUser_UserIdAndFriend_UserId(userId, friendId)
                .ifPresent(friendRepository::delete);
    }

    @Override
    public void deleteFriend(Long userId, Long friendId) {
        // Xóa quan hệ bạn bè
        friendRepository.findByUser_UserIdAndFriend_UserId(userId, friendId)
                .ifPresent(friendRepository::delete);
        friendRepository.findByUser_UserIdAndFriend_UserId(friendId, userId)
                .ifPresent(friendRepository::delete);
        
        // Xóa phòng chat riêng tư giữa 2 người
        ChatRoom privateRoom = chatRoomService.getPrivateRoomBetweenUsers(userId, friendId);
        if (privateRoom != null) {
            chatRoomService.deleteRoom(privateRoom.getChatRoomId());
        }
    }

    @Override
    public List<FriendDTO> getFriends(Long userId) {
        return friendRepository.findByUser_UserId(userId)
                .stream()
                .filter(f -> "accepted".equalsIgnoreCase(f.getStatus()))
                .map(f -> {
                    User friend = f.getFriend();
                    return new FriendDTO(
                        f.getUser().getUserId(),
                        friend.getUserId(),
                        f.getStatus(),
                        friend.getUsername(),
                        friend.getDisplayName(),
                        friend.getAvatarUrl(),
                        friend.getEmail()
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<FriendDTO> getPendingRequests(Long userId) {
        return friendRepository.findByFriend_UserId(userId)
                .stream()
                .filter(f -> "pending".equalsIgnoreCase(f.getStatus()))
                .map(f -> {
                    User sender = f.getUser();
                    return new FriendDTO(
                        sender.getUserId(),
                        f.getFriend().getUserId(),
                        f.getStatus(),
                        sender.getUsername(),
                        sender.getDisplayName(),
                        sender.getAvatarUrl(),
                        sender.getEmail()
                    );
                })
                .collect(Collectors.toList());
    }

    private void createPrivateChatRoom(User user1, User user2) {
        try {
            if (chatRoomService.existsPrivateRoomBetweenUsers(user1.getUserId(), user2.getUserId())) return;

            String roomName = user1.getUsername() + " & " + user2.getUsername();
            ChatRoom room = chatRoomService.createRoom(roomName, false);
            chatRoomService.addMember(room.getChatRoomId(), user1.getUserId(), "member");
            chatRoomService.addMember(room.getChatRoomId(), user2.getUserId(), "member");
        } catch (Exception e) {
            System.err.println("Lỗi khi tạo room chat: " + e.getMessage());
        }
    }
}
