# Online Status Debug

## Vấn đề
- Online status không hiển thị đúng
- Cả 2 users đều hiển thị "Không hoạt động" mặc dù đang online

## Log hiện tại
```
📊 Online users now: Array(2)  ← Có 2 users trong Set
✅ Added user to online: 1     ← userId = 1 được add
🔍 Conversation: Object        ← Cần xem chi tiết otherUserId
```

## Cần kiểm tra
1. Click vào "Object" trong console log "🔍 Conversation" để xem:
   - `otherUserId` là bao nhiêu? (1, 2, 3?)
   - `isOnline` = true/false?
   - `allOnlineUsers` = [1, 2]?

2. Nếu `otherUserId` = 2 nhưng `allOnlineUsers` = [1, 1]:
   → Vấn đề: Backend broadcast userId = 1 cho cả 2 users
   → Fix: Backend cần broadcast đúng userId

3. Nếu `otherUserId` = null:
   → Vấn đề: Backend không trả về otherUserId
   → Fix: ChatRoomController.getUserRooms()

## Next Steps
1. Mở Console (F12)
2. Click vào log "🔍 Conversation: Object"
3. Copy toàn bộ object details
4. Paste vào đây để phân tích
