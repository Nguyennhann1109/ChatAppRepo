-- Thêm các trường mới vào bảng notifications
ALTER TABLE notifications 
ADD COLUMN notification_type VARCHAR(50),
ADD COLUMN related_user_id BIGINT,
ADD COLUMN related_room_id BIGINT,
ADD COLUMN navigation_data TEXT;

-- Thêm index để tối ưu hiệu suất
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_related_user ON notifications(related_user_id);
CREATE INDEX idx_notifications_related_room ON notifications(related_room_id);
