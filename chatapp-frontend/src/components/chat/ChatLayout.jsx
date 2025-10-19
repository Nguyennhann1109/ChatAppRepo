import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ConversationList from './ConversationList';
import ModernChatRoom from './ChatRoom';

const ChatLayout = () => {
  const [searchParams] = useSearchParams();
  const [selectedRoomId, setSelectedRoomId] = useState(null);

  // Đọc roomId từ URL khi component mount
  useEffect(() => {
    const roomIdFromUrl = searchParams.get('roomId');
    if (roomIdFromUrl) {
      setSelectedRoomId(roomIdFromUrl);
    }
  }, [searchParams]);

  return (
    <div className="flex h-full bg-white dark:bg-dark-900">
      {/* Sidebar - Danh sách cuộc trò chuyện */}
      <div className="w-80 border-r border-gray-200 dark:border-dark-700 flex-shrink-0">
        <ConversationList 
          onSelectRoom={setSelectedRoomId}
          selectedRoomId={selectedRoomId}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1">
        {selectedRoomId ? (
          <ModernChatRoom roomId={selectedRoomId} key={selectedRoomId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Chọn một cuộc trò chuyện
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatLayout;
