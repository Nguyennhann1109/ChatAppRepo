package QuanLy.Chat.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import QuanLy.Chat.DTO.FriendDTO;
import QuanLy.Chat.Service.FriendService;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    // Gửi lời mời (POST JSON)
    @PostMapping("/add")
    public ResponseEntity<?> addFriend(@RequestBody FriendDTO request) {
        try {
            // userId = người gửi, friendId = người nhận
            return ResponseEntity.ok(friendService.addFriend(request.getUserId(), request.getFriendId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Chấp nhận lời mời (POST JSON)
    @PostMapping("/accept")
    public ResponseEntity<?> acceptFriend(@RequestBody FriendDTO request) {
        try {
            // friendId = người gửi lời mời, userId = người nhận hiện tại
            return ResponseEntity.ok(friendService.acceptFriend(request.getFriendId(), request.getUserId()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Từ chối lời mời
    @PostMapping("/reject")
    public ResponseEntity<?> rejectFriend(@RequestBody FriendDTO request) {
        try {
            // friendId = người gửi, userId = người nhận
            friendService.rejectFriend(request.getFriendId(), request.getUserId());
            return ResponseEntity.ok("Đã từ chối lời mời");
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Hủy lời mời
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelRequest(@RequestBody FriendDTO request) {
        try {
            // userId = người gửi, friendId = người nhận
            friendService.cancelRequest(request.getUserId(), request.getFriendId());
            return ResponseEntity.ok("Đã hủy lời mời");
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Xóa bạn
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFriend(@RequestBody FriendDTO request) {
        try {
            friendService.deleteFriend(request.getUserId(), request.getFriendId());
            return ResponseEntity.ok("Đã xóa bạn");
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    // Danh sách bạn bè
    @GetMapping("/{userId}")
    public ResponseEntity<List<FriendDTO>> getFriends(@PathVariable Long userId) {
        return ResponseEntity.ok(friendService.getFriends(userId));
    }

    // Danh sách lời mời chờ
    @GetMapping("/pending/{userId}")
    public ResponseEntity<List<FriendDTO>> getPendingRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(friendService.getPendingRequests(userId));
    }
}
