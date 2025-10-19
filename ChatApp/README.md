# Chat Application - Đồ án môn học

Ứng dụng chat realtime với Spring Boot backend, hỗ trợ nhắn tin, bạn bè, phòng chat, gọi video/audio WebRTC.

## 🚀 Tính năng

### Core Features
- ✅ **Authentication & Authorization**: JWT + Refresh Token, phân quyền theo role
- ✅ **User Management**: CRUD user với validation
- ✅ **Friend System**: Thêm/chấp nhận/từ chối/hủy/xóa bạn bè, kiểm tra trùng 2 chiều
- ✅ **Chat Rooms**: Tạo/quản lý phòng chat (1-1 và nhóm), quản lý thành viên
- ✅ **Messaging**: 
  - Gửi tin nhắn REST + realtime WebSocket (STOMP)
  - Sửa/xóa mềm tin nhắn
  - Trạng thái delivered/seen
  - Phân trang
  - Upload media (khung)
- ✅ **Notifications**: CRUD thông báo, đánh dấu đã đọc, tiếng Việt
- ✅ **Block & Report**: Chặn user, báo cáo vi phạm
- ✅ **WebRTC Calling**: API cuộc gọi + signaling (offer/answer/ICE), ICE servers endpoint
- ✅ **Realtime**: Typing indicator, presence (khung), broadcast tin nhắn qua WebSocket

### Technical Stack
- **Backend**: Spring Boot 3.5.6, Java 21
- **Database**: SQL Server (JPA/Hibernate)
- **Security**: Spring Security, JWT (jjwt), BCrypt
- **Realtime**: WebSocket (STOMP), SockJS
- **Validation**: Jakarta Validation
- **Build**: Maven

---

## 📋 Yêu cầu hệ thống

- **Java**: 21+
- **Maven**: 3.9+
- **SQL Server**: 2019+ (hoặc LocalDB)
- **Port**: 8080 (backend), 1433 (SQL Server)

---

## ⚙️ Cài đặt & Chạy

### 1. Clone repo
```bash
git clone <repo-url>
cd ChatApp/Chat
```

### 2. Cấu hình Database
Tạo database `ChatApp` trong SQL Server:
```sql
CREATE DATABASE ChatApp;
```

Cập nhật `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=ChatApp;encrypt=true;trustServerCertificate=true
spring.datasource.username=nhombay
spring.datasource.password=123
```

### 3. Build & Run
```bash
# Compile
.\mvnw.cmd clean compile

# Run
.\mvnw.cmd spring-boot:run
```

Server khởi động tại: `http://localhost:8080`

### 4. Kiểm tra
```bash
# Health check
curl http://localhost:8080/api/webrtc/ice-servers
```

---

## 📚 API Documentation

### Base URL: `http://localhost:8080`

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Đăng ký user mới | ❌ |
| POST | `/api/auth/login` | Đăng nhập | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ |
| POST | `/api/auth/logout` | Đăng xuất | ❌ |

### 👤 Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Lấy danh sách user | ✅ |
| GET | `/api/users/{id}` | Lấy user theo ID | ✅ |
| POST | `/api/users` | Tạo user mới | ✅ |
| PUT | `/api/users/{id}` | Cập nhật user | ✅ |
| DELETE | `/api/users/{id}` | Xóa user | ✅ |

### 👥 Friends (`/api/friends`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/friends/add` | Gửi lời mời kết bạn | ✅ |
| POST | `/api/friends/accept` | Chấp nhận lời mời | ✅ |
| POST | `/api/friends/reject` | Từ chối lời mời | ✅ |
| POST | `/api/friends/cancel` | Hủy lời mời đã gửi | ✅ |
| GET | `/api/friends/{userId}` | Danh sách bạn bè | ✅ |
| DELETE | `/api/friends/delete` | Xóa bạn | ✅ |

### 💬 Chat Rooms (`/api/rooms`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/rooms` | Tạo phòng chat | ✅ |
| GET | `/api/rooms` | Danh sách phòng | ✅ |
| GET | `/api/rooms/{roomId}` | Chi tiết phòng | ✅ |
| PUT | `/api/rooms/{roomId}` | Cập nhật phòng | ✅ |
| DELETE | `/api/rooms/{roomId}` | Xóa phòng | ✅ |
| POST | `/api/rooms/{roomId}/members` | Thêm thành viên | ✅ |
| GET | `/api/rooms/{roomId}/members` | Danh sách thành viên | ✅ |
| DELETE | `/api/rooms/{roomId}/members/{userId}` | Xóa thành viên | ✅ |

### 💌 Messages (`/api/messages`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/messages` | Gửi tin nhắn | ✅ |
| GET | `/api/messages/room/{roomId}` | Lấy tin nhắn (có phân trang) | ✅ |
| PUT | `/api/messages/{messageId}` | Sửa tin nhắn | ✅ |
| DELETE | `/api/messages/{messageId}` | Xóa mềm tin nhắn | ✅ |
| POST | `/api/messages/room/{roomId}/delivered/{messageId}` | Đánh dấu delivered | ✅ |
| POST | `/api/messages/room/{roomId}/seen/{messageId}` | Đánh dấu seen | ✅ |
| POST | `/api/messages/room/{roomId}/media` | Upload media | ✅ |

### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/user/{userId}` | Danh sách thông báo | ✅ |
| GET | `/api/notifications/user/{userId}/unread` | Thông báo chưa đọc | ✅ |
| POST | `/api/notifications` | Tạo thông báo | ✅ |
| POST | `/api/notifications/user/{userId}/mark-all-read` | Đánh dấu tất cả đã đọc | ✅ |
| DELETE | `/api/notifications/user/{userId}` | Xóa tất cả thông báo | ✅ |

### 📞 Calls (`/api/calls`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/calls/start` | Bắt đầu cuộc gọi | ✅ |
| POST | `/api/calls/{callId}/end` | Kết thúc cuộc gọi | ✅ |
| GET | `/api/calls/user/{userId}` | Lịch sử cuộc gọi | ✅ |
| DELETE | `/api/calls/{callId}` | Xóa cuộc gọi | ✅ |
| DELETE | `/api/calls/range` | Xóa theo khoảng thời gian | ✅ |

### 🚫 Block & Report (`/api/blocks`, `/api/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/blocks` | Chặn user | ✅ |
| GET | `/api/blocks` | Danh sách đã chặn | ✅ |
| DELETE | `/api/blocks` | Bỏ chặn | ✅ |
| POST | `/api/reports` | Báo cáo vi phạm | ✅ |
| GET | `/api/reports` | Danh sách báo cáo | ✅ |
| DELETE | `/api/reports/{id}` | Xóa báo cáo | ✅ |

### 🌐 WebRTC (`/api/webrtc`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/webrtc/ice-servers` | Lấy STUN/TURN servers | ❌ |

---

## 🔌 WebSocket Endpoints

### Connection
- **URL**: `ws://localhost:8080/ws` (SockJS enabled)
- **Protocol**: STOMP

### Topics (Subscribe)
- `/topic/rooms/{roomId}` - Nhận tin nhắn mới trong phòng
- `/topic/rooms/{roomId}/typing` - Nhận typing indicator
- `/topic/webrtc/{userId}/offer` - Nhận WebRTC offer
- `/topic/webrtc/{userId}/answer` - Nhận WebRTC answer
- `/topic/webrtc/{userId}/ice` - Nhận ICE candidate

### Destinations (Send)
- `/app/rooms/{roomId}/send` - Gửi tin nhắn
- `/app/typing` - Gửi typing indicator
- `/app/webrtc/offer` - Gửi WebRTC offer
- `/app/webrtc/answer` - Gửi WebRTC answer
- `/app/webrtc/ice` - Gửi ICE candidate

---

## 🧪 Testing

### Run Unit Tests
```bash
# Run all tests
.\mvnw.cmd test

# Run specific test
.\mvnw.cmd test -Dtest=UserServiceImplTest

# Run with coverage (nếu có jacoco)
.\mvnw.cmd test jacoco:report
```

### Test Coverage
- ✅ `UserServiceImplTest` - 8 test cases (CRUD + validation)
- ✅ `MessageServiceImplTest` - 8 test cases (send, edit, delete, status)
- ✅ `FriendServiceImplTest` - 5 test cases (add, accept, delete logic)

### Import Postman Collection
File: `ChatApp_Postman_Collection.json`

Import vào Postman: File → Import → chọn file JSON

### Flow test cơ bản qua Postman:
1. **Register** → Tạo 2 user (user1, user2) - lưu tự động accessToken
2. **Login** → Lấy access token mới nếu cần
3. **Add Friend** → user1 gửi lời mời tới user2
4. **Accept Friend** → user2 chấp nhận
5. **Create Room** → Tạo phòng chat - lưu tự động roomId
6. **Add Member** → Thêm user2 vào phòng
7. **Send Message** → Gửi tin nhắn - lưu tự động messageId
8. **WebSocket** → Subscribe topic và nhận realtime (test bằng FE)

### Database Performance (Optional)
Chạy file SQL để tạo index:
```bash
# Kết nối SQL Server, chạy file:
src/main/resources/db/migration/V1__Add_Performance_Indexes.sql
```

Indexes được tạo:
- `idx_messages_chatroom_sent` - Query tin nhắn theo phòng
- `idx_users_username` - Login lookup
- `idx_friends_user_status` - Friend queries
- `idx_notifications_user_read` - Notification unread
- `idx_calls_caller`, `idx_calls_receiver` - Call history

---

## 🔧 Configuration

### JWT Settings (`application.properties`)
```properties
app.jwt.secret=ZmFrZV9zZWNyZXRfZm9yX2RlbW8=
app.jwt.accessMillis=900000       # 15 phút
app.jwt.refreshMillis=1209600000  # 14 ngày
```

### CORS Settings
```properties
# Cho phép origin
http://localhost:3000
http://localhost:5173
```

### TURN Server (Production)
```properties
app.webrtc.turnUrl=turn:your-domain.com:3478
app.webrtc.turnUsername=turnuser
app.webrtc.turnCredential=turnpass
```

---

## 📱 Frontend Integration

### 1. Đăng nhập và lưu token
```javascript
const res = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user1', password: '123456' })
});
const { accessToken, refreshToken, user } = await res.json();
localStorage.setItem('accessToken', accessToken);
```

### 2. Gọi API với JWT
```javascript
const res = await fetch('/api/users', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### 3. Kết nối WebSocket (SockJS + STOMP)
```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = new Client({ webSocketFactory: () => socket });

stompClient.onConnect = () => {
  // Subscribe nhận tin nhắn
  stompClient.subscribe('/topic/rooms/1', (message) => {
    const msg = JSON.parse(message.body);
    console.log('New message:', msg);
  });

  // Gửi tin nhắn
  stompClient.publish({
    destination: '/app/rooms/1/send',
    body: JSON.stringify({ senderId: 1, content: 'Hello!' })
  });
};

stompClient.activate();
```

### 4. WebRTC Calling
```javascript
// Lấy ICE servers
const { iceServers } = await fetch('/api/webrtc/ice-servers').then(r => r.json());

// Tạo peer connection
const pc = new RTCPeerConnection({ iceServers });

// Gửi offer qua STOMP
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
stompClient.publish({
  destination: '/app/webrtc/offer',
  body: JSON.stringify({ fromUserId: 1, toUserId: 2, sdp: offer.sdp })
});
```

---

## 🐛 Troubleshooting

### Lỗi kết nối database
```
Kiểm tra SQL Server đang chạy
Xác nhận username/password đúng
Trust certificate: trustServerCertificate=true
```

### Lỗi CORS
```
Thêm origin FE vào SecurityConfig.corsConfigurationSource()
```

### WebSocket không kết nối
```
Kiểm tra endpoint: ws://localhost:8080/ws
Dùng SockJS fallback nếu proxy chặn WS
```

### JWT expired
```
Gọi /api/auth/refresh với refreshToken
Cập nhật accessToken mới
```

---

## 🎨 Frontend Development

Xem hướng dẫn chi tiết xây dựng React frontend: **[REACT_FRONTEND_GUIDE.md](REACT_FRONTEND_GUIDE.md)**

Bao gồm:
- Setup project & dependencies
- API service layer với axios interceptors
- Authentication & protected routes
- WebSocket STOMP integration
- WebRTC video call implementation
- Component structure & styling
- Deployment guide

---

## 📝 TODO (Nâng cao)

### Đã hoàn thành ✅
- ✅ Database indexing (V1__Add_Performance_Indexes.sql)
- ✅ Unit tests (UserService, MessageService, FriendService)
- ✅ Global exception handler
- ✅ JWT + Refresh token
- ✅ DTO pattern đầy đủ
- ✅ WebSocket realtime
- ✅ WebRTC signaling

### Nâng cao (Optional)
- [ ] Redis cache cho user/room/presence
- [ ] Message queue (Kafka/RabbitMQ) cho async tasks
- [ ] Cursor-based pagination
- [ ] Delivered/seen per-recipient
- [ ] Upload media thực tế (S3/MinIO)
- [ ] TURN server production (Coturn)
- [ ] Integration tests
- [ ] Docker compose deployment
- [ ] Monitoring (Prometheus + Grafana)

---

## 👨‍💻 Tác giả

- **Nhóm**: [Tên nhóm]
- **Môn học**: [Tên môn]
- **Năm**: 2025

## 📄 License

MIT License
