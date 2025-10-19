package QuanLy.Chat.Entity;

import lombok.*;
import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomMemberID implements Serializable {
    private Long chatRoom;
    private Long user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChatRoomMemberID)) return false;
        ChatRoomMemberID that = (ChatRoomMemberID) o;
        return Objects.equals(chatRoom, that.chatRoom) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(chatRoom, user);
    }
}