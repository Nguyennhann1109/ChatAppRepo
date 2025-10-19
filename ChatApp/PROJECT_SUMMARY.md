## Tóm tắt chức năng và giao thức ChatApp (sau khi đơn giản hóa)

### 1) Xác thực và Quản lý người dùng
- Chức năng:
  - Đăng ký tài khoản mới
  - Đăng nhập/đăng xuất (dựa trên session)
  - Quản lý thông tin cá nhân (CRUD)
  - Danh sách người dùng
- Giao thức:
  - HTTP REST API (JSON)
  - Session-based Authentication (thay JWT)
  - BCrypt mã hóa mật khẩu
- Endpoints:
  - POST /api/auth/register — Đăng ký
  - POST /api/auth/login — Đăng nhập
  - POST /api/auth/logout — Đăng xuất
  - GET /api/users — Danh sách user
  - GET /api/users/{id} — Chi tiết user
  - POST /api/users — Tạo user
  - PUT /api/users/{id} — Cập nhật user
  - DELETE /api/users/{id} — Xóa user

### 2) Nhắn tin (Messaging)
- Chức năng:
  - Gửi tin nhắn văn bản
  - Gửi file/media (upload multipart)
  - Chỉnh sửa tin nhắn
  - Xóa tin nhắn (soft delete)
  - Đánh dấu đã gửi/đã xem
  - Lịch sử tin nhắn (phân trang)
  - Real-time messaging
- Giao thức:
  - HTTP REST API cho CRUD
  - WebSocket + STOMP cho realtime
  - multipart/form-data cho upload
- Endpoints chính:
  - POST /api/messages — Gửi tin nhắn
  - GET /api/messages/room/{roomId} — Lịch sử tin nhắn
  - PUT /api/messages/{messageId} — Chỉnh sửa
  - DELETE /api/messages/{messageId} — Xóa
  - POST /api/messages/room/{roomId}/delivered/{messageId} — Đánh dấu đã gửi
  - POST /api/messages/room/{roomId}/seen/{messageId} — Đánh dấu đã xem
  - POST /api/messages/room/{roomId}/media — Upload file/media
- WebSocket:
  - Client gửi: /app/rooms/{roomId}/send
  - Client subscribe: /topic/rooms/{roomId}

### 3) Phòng chat (Chat Rooms)
- Chức năng:
  - Tạo phòng chat cá nhân/nhóm
  - Cập nhật thông tin phòng
  - Xóa phòng chat
  - Thêm/xóa thành viên
  - Danh sách thành viên
  - Tự động tạo room riêng tư khi 2 người kết bạn
- Giao thức:
  - HTTP REST API
- Endpoints:
  - POST /api/rooms — Tạo phòng
  - PUT /api/rooms/{roomId} — Cập nhật
  - DELETE /api/rooms/{roomId} — Xóa phòng
  - GET /api/rooms/{roomId} — Chi tiết phòng
  - GET /api/rooms — Danh sách phòng
  - POST /api/rooms/{roomId}/members — Thêm thành viên
  - DELETE /api/rooms/{roomId}/members/{userId} — Xóa thành viên
  - GET /api/rooms/{roomId}/members — Danh sách thành viên

### 4) Bạn bè (Friends)
- Chức năng:
  - Gửi lời mời kết bạn
  - Chấp nhận/từ chối lời mời
  - Hủy lời mời
  - Xóa bạn bè
  - Danh sách bạn bè
  - Khi chấp nhận kết bạn: tự động tạo room chat riêng tư nếu chưa có
- Giao thức:
  - HTTP REST API
- Endpoints:
  - POST /api/friends/add — Gửi lời mời
  - POST /api/friends/accept — Chấp nhận lời mời (tạo room tự động)
  - POST /api/friends/reject — Từ chối
  - POST /api/friends/cancel — Hủy lời mời
  - DELETE /api/friends/delete — Xóa bạn bè
  - GET /api/friends/{userId} — Danh sách bạn

### 5) Thông báo (Notifications, đơn giản)
- Chức năng:
  - Xem thông báo của người dùng
  - Đánh dấu tất cả thông báo đã đọc
- Giao thức:
  - HTTP REST API
- Endpoints:
  - GET /api/notifications/user/{userId}
  - POST /api/notifications/user/{userId}/mark-all-read

### 6) Hiện diện (Presence)
- Chức năng:
  - Typing indicators (đang gõ)
  - Online status
- Giao thức:
  - HTTP REST API cho online status
  - WebSocket + STOMP cho typing
- Endpoints/WebSocket:
  - GET /api/presence/online/{userId}
  - WS gửi: /app/typing
  - WS nhận: /topic/rooms/{roomId}/typing

### 7) Cấu hình WebSocket
- Endpoint: /ws
- Message broker: /topic, /queue
- Application destination prefix: /app
- SockJS fallback

### Công nghệ chính
- Backend: Spring Boot 3.x (Web, Data JPA, Security, WebSocket)
- CSDL: Microsoft SQL Server (JPA/Hibernate)
- Bảo mật: Session-based auth, BCrypt
- Real-time: WebSocket + STOMP

### Phạm vi sau khi tối giản
- Controllers còn lại: Auth, User, Message, ChatRoom, Friend, Notification (đơn giản), Presence, RealtimeMessage
- Đã loại bỏ: WebRTC/Call, Report, Block, JWT









