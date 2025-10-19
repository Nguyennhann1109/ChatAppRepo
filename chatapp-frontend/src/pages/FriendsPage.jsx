import React, { Suspense } from 'react';

const FriendList = React.lazy(() => import('../components/friends/FriendList'));

function FriendsPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải bạn bè...</div>}>
      <FriendList />
    </Suspense>
  );
}

export default FriendsPage;
