package QuanLy.Chat.Service;

import java.util.List;

import QuanLy.Chat.DTO.FriendDTO;

public interface FriendService {
    FriendDTO addFriend(Long userId, Long friendId);
    FriendDTO acceptFriend(Long userId, Long friendId);
    void rejectFriend(Long userId, Long friendId);
    void cancelRequest(Long userId, Long friendId);
    void deleteFriend(Long userId, Long friendId);
    List<FriendDTO> getFriends(Long userId);
    List<FriendDTO> getPendingRequests(Long userId);
}
