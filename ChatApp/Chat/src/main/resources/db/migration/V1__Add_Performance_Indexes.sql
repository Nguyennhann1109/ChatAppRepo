-- Performance indexes for ChatApp
-- Run this after initial schema creation

-- Index for message queries (most frequent)
CREATE INDEX idx_messages_chatroom_sent 
ON messages(chatroom_id, sent_at DESC);

-- Index for user lookup by username (login)
CREATE INDEX idx_users_username 
ON users(username);

-- Index for friend queries
CREATE INDEX idx_friends_user_status 
ON friends(user_id, status);

-- Index for notifications by user
CREATE INDEX idx_notifications_user_read 
ON notifications(user_id, is_read, created_at DESC);

-- Index for call history
CREATE INDEX idx_calls_caller 
ON calls(caller_id, start_time DESC);

CREATE INDEX idx_calls_receiver 
ON calls(receiver_id, start_time DESC);

-- Index for chatroom members
CREATE INDEX idx_chatroom_members_user 
ON chatroom_members(user_id);

-- Index for blocks
CREATE INDEX idx_blocks_blocker 
ON blocks(blocker_id);

-- Index for reports
CREATE INDEX idx_reports_created 
ON reports(created_at DESC);

-- Optional: Full-text search index for messages (if needed)
-- CREATE FULLTEXT INDEX idx_messages_content_fulltext 
-- ON messages(content);




