import AddFriend from "../components/friends/AddFriend";
import FriendList from "../components/friends/FriendList";
import FriendRequests from "../components/friends/FriendRequests";

function FriendsPage() {
  // 👇 ID người dùng hiện tại (bạn có thể lấy từ context hoặc Auth)
  const currentUserId = 1;

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-4">Quản lý bạn bè</h1>
      <AddFriend currentUserId={currentUserId} />
      <FriendRequests currentUserId={currentUserId} />
      <FriendList currentUserId={currentUserId} />
    </div>
  );
}

export default FriendsPage;
