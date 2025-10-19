-- Convert notifications.message and navigation_data to NVARCHAR (Unicode) for SQL Server
ALTER TABLE notifications ALTER COLUMN message NVARCHAR(MAX) NOT NULL;
ALTER TABLE notifications ALTER COLUMN navigation_data NVARCHAR(MAX) NULL;

-- If using other databases, use equivalent commands (this file is for SQL Server).
